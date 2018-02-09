const DB = require('../model/Event')
DB.EventPromoter = require('../model/EventPromoter').EventPromoter
const request = require('request')

const Event = {
  show: function (req, res) {
    DB.Event.find({owner: req.decoded.id}, function (err, events) {
      if (err) { res.send(err) }
      res.json(events)
    })
  },

  delete: function (req, res) {
    if (!req.body.name && !req.body.id) {
      return res.status(405).send({
        success: false,
        message: 'Method Not Allowed. No arguments found.'})
    }

    DB.Event.find(req.body, function (err, event) {
      if (err) { return res.send(err) }
      if (req.decoded.id !== event.owner) {
        return res.status(403).send({
          success: false,
          message: 'Forbidden. You are not the event owner.'})
      }
      event.remove(function (err, _event) {
        if (err) { return res.send(err) }
        res.status(202).send(_event)
      })
    })
  },

  create: function (req, res) {
    var b = req.body
    if (!b.seatmap || !b.name || !b.place || !b.date ||
         b.resell === undefined || b.delegate === undefined ||
         b.canReturn === undefined) {
      return res.status(405).send({
        success: false,
        message: 'Method Not Allowed. Missing arguments.',
        body: req.body})
    }
    var json = {}
    try {
      json = JSON.parse(b.seatmap)
    } catch (e) {
      return res.status(405).send({
        success: false,
        message: 'Invalid seat map JSON.',
        body: e})
    }

    var zones = []
    var seatID = 0
    for (var i = 0; i < json.length; i++) {
      var zone = json[i]
      var seats = []
      for (var j = 0; j < zone.seat.length; j++) {
        seats.push(new DB.Seat({
          name: zone.seat[j],
          price: zone.price,
          seatID: seatID++
        }))
      }
      zones.push(new DB.Zone({
        name: zone.name,
        seats: seats
      }))
    }
    var ethBody = {
      promoter: req.decoded.hash,
      name: b.name,
      place: b.place,
      date: b.date,
      nSeat: seatID,
      resell: b.resell,
      delegate: b.delegate,
      canReturn: b.canReturn
    }
    b.seatMap = zones
    b.owner = req.decoded.id
    b.nSeat = seatID
    console.log(ethBody)
    request.post(
      {url: 'http://localhost:3001/event',
        form: ethBody},
      (err, resp, body) => {
        if (err) return res.status(500).send(err)

        try {
          b.ethereumHash = JSON.parse(body).hash
        } catch (e) {
          return res.status(405).send({
            success: false,
            message: 'ERROR: Invalid JSON from eth server. (Event/create)',
            body: e})
        }
        console.log(b)
        var newEvent = new DB.Event(b)
        newEvent.save(function (err, event) {
          if (err) { return res.status(500).send(err) }
          if (!event) { return res.status(500).json({ success: false, message: "Couldn't save event" }) }
          DB.EventPromoter.findOne({_id: req.decoded.id}, function (err, promoter) {
            if (err) { return res.status(500).send(err) }
            promoter.events.push(event._id)
            promoter.save((e) => {
              return res.status(202).json({
                success: true,
                message: event })
            })
          })
        })
      })
    /// /////  crear contrato
  },

  get: function (req, res) {
    if (!req.query.name && !req.query.id) {
      return res.status(405).send({
        success: false,
        message: 'Method Not Allowed. No arguments found.'})
    }
    DB.Event.findOne({_id: req.query.id}, function (err, event) {
      if (err) { return res.send(err) }
      if (!event) {
        return res.status(404).send({
          success: false,
          message: 'Event not found'})
      }
      if (req.decoded.id !== event.owner) {
        return res.status(403).send({
          success: false,
          message: 'Forbidden. You are not the event owner.'})
      }
      return res.status(202).json({
        success: true,
        message: event })
    })
  },

  getTicket: function (req, res) {
    var id = req.body.event
    var seat = req.body.seat

    if (!id || seat === undefined) {
      return res.status(405).send({
        success: false,
        message: 'Cannot get ticket. No arguments found.'})
    }
    DB.Event.findOne({_id: id}, function (err, event) {
      if (err) {
        return res.send(err)
      }
      request.post({
        url: 'http://localhost:3001/event/ticket',
        form: {address: event.ethereumHash, seat: seat}},
      (err, resp, body) => {
        if (err) {
          return res.status(500).send(err)
        }

        return res.status(202).json({
          success: true,
          message: JSON.parse(body)
        })
      })
    })
  },

  modify: function (req, res) {
    if (!req.query.name && !req.query.id) {
      return res.status(405).send({
        success: false,
        message: 'Method Not Allowed. No arguments found.'})
    }
    DB.Event.findOne(req.query, function (err, event) {
      if (err) {
        res.send(err)
      } else if (req.decoded.id === event.owner) {
        DB.Event.update(req.query, req.body, function (err, nAffected, rawResponse) {
          if (err) {
            return res.send(err)
          }
          return res.status(200).json({success: false, Changes: nAffected, Response: rawResponse})
        })
      } else {
        return res.status(403).send({
          success: false,
          message: 'Forbidden. You are not the event owner.'})
      }
    })
  }
}

const EventOperation = {
  buyTicket: function (req, res) {
    /* What you need */
    var zone = req.body.zone
    var seat = req.body.seat
    var name = req.body.name || req.body.id
    var price = parseInt(req.body.price)
    var idHash = req.body.idHash
    if (!name || !zone || !seat || !price || !idHash) {
      return res.status(405).send({
        success: false,
        message: 'Method Not Allowed. Invalid arguments.'})
    }
    var delegatedHash = req.body.delegated ? req.body.delegated : '0x0'
    /****************/

    DB.Event.findOne({_id: name}, function (err, event) {
      if (err) {
        return res.send(err)
      } else if (!event) {
        return res.status(404).send({
          success: false,
          message: 'Event not found'})
      } else if (event.owner !== req.decoded.id) {
        return res.status(404).send({
          success: false,
          message: 'Forbidden. You are not the event owner.'})
      } else {
        var seatmap = event.seatMap
        for (var i = 0; i < seatmap.length; i++) {
          if (seatmap[i].name === zone) {
            for (var j = 0; j < seatmap[i].seats.length; j++) {
              var s = seatmap[i].seats[j]
              if (s.name === seat) {
                if (s.status === 'Availible') {
                  console.log(s.price, price, s.price !== price)
                  if (s.price !== price) {
                    return res.status(405).send({
                      success: false,
                      message: 'The amount of money sent is not equal to the price of the seat'})
                  }
                  const ethBody = {
                    address: event.ethereumHash,
                    owner: idHash,
                    delegate: delegatedHash,
                    price: s.price,
                    seat: s.seatID
                  }
                  request.post(
                    {url: 'http://localhost:3001/event/buyTicket',
                      form: ethBody},
                    (err, resp, body) => {
                      console.log('entro2')
                      if (err) return res.status(500).send(err)
                      if (resp.statusCode >= 400) {
                        return res.status(405).send({
                          success: false,
                          message: 'Cannot buy ticket'})
                      }
                      console.log('entro3')
                      var ticket = new DB.Ticket({
                        idHash: idHash,
                        event: name,
                        zone: zone,
                        seat: seat,
                        seatID: s.seatID,
                        price: price,
                        delegatedHash: delegatedHash
                      })
                      console.log('entro4')
                      ticket.save(function (err, t) {
                        if (err) { return res.status(500).send(err) }
                        event.seatMap[i].seats[j].status = 'Sold'
                        event.seatMap[i].seats[j].ticket = t._id
                        event.save(function (err, s) {
                          if (err) { return console.log(err) }
                          return res.json({
                            success: true,
                            message: t,
                            tx: JSON.parse(body).tx.transactionHash})
                        })
                      })
                    })
                  return
                } else {
                  return res.status(405).send({
                    success: false,
                    message: 'Seat (' + zone + ':' + seat + ') is sold'})
                }
              }
            }
          }
        }
        return res.status(404).send({
          success: false,
          message: 'Seat not found (' + zone + ':' + seat + ')'})
      }
    })
  },

  resellTicket: function (req, res) {
    var ticketID = req.body.ticket
    var oldOwner = req.body.owner
    var newOwner = req.body.newOwner
    var delegated = req.body.delegated
    var newPrice = req.body.price

    if (!ticketID || !oldOwner || !newOwner) {
      return res.status(405).send({
        success: false,
        message: 'Method Not Allowed. Invalid arguments.'})
    }
    if (delegated === undefined) {
      delegated = '0'
    }

    DB.Ticket.findOne({_id: ticketID, hashID: oldOwner}, function (err, ticket) {
      if (err) return res.send(err)
      DB.Event.findOne({_id: ticket.event}, function (err, event) {
        if (err) return res.send(err)
        if (ticket.idHash === oldOwner) {
          var ethBody = {
            address: event.ethereumHash,
            owner: oldOwner,
            newOwner: newOwner,
            delegate: delegated,
            seat: ticket.seatID,
            price: newPrice
          }
          request.post({
            url: 'http://localhost:3001/event/resellTicket',
            form: ethBody},
          (err, resp, body) => {
            if (err) res.status(400).send(err)
            DB.Ticket.update({_id: ticketID},
              {idHash: newOwner,
                delegatedHash: delegated,
                price: newPrice,
                function (err, nAffected, rawResponse) {
                  if (err) res.send(err)
                  return res.status(200).send({
                    success: true,
                    message: 'Ticket updated.'})
                }
              })
          })
        }
      })
    })
  },

  returnTicket: function (req, res) {
    var ticketID = req.body.ticket
    var owner = req.body.owner
    console.log(req.body)
    if (!ticketID || !owner) {
      return res.status(405).send({
        success: false,
        message: 'Method Not Allowed. Invalid arguments.'})
    }

    DB.Ticket.findOne({_id: ticketID}, (err, ticket) => {
      if (err) return res.send(err)
      if (!ticket) {
        return res.status(404).send({
          success: false,
          message: 'Ticket not found'})
      }
      var eventID = ticket.event
      var zone = ticket.zone
      var seat = ticket.seat
      console.log(ticket)
      ticket.remove(err => {
        if (err) return res.send(err)
        DB.Event.findOne({_id: eventID}, function (err, event) {
          if (err) {
            return res.send(err)
          } else if (!event) {
            return res.status(404).send({
              success: false,
              message: 'Event not found'})
          } else if (event.owner !== req.decoded.id) {
            return res.status(404).send({
              success: false,
              message: 'Forbidden. You are not the event owner.'})
          } else {
            var seatmap = event.seatMap
            for (var i = 0; i < seatmap.length; i++) {
              if (seatmap[i].name === zone) {
                for (var j = 0; j < seatmap[i].seats.length; j++) {
                  var s = seatmap[i].seats[j]
                  if (s.name === seat) {
                    if (s.status === 'Sold') {
                      var ethBody = {
                        address: event.ethereumHash,
                        seat: seatmap[i].seats[j].seatID,
                        owner: owner
                      }
                      request.post({
                        url: 'http://localhost:3001/event/returnTicket',
                        form: ethBody},
                        (err, resp, body) => {
                          if (err) return res.status(400).send(err)
                          event.seatMap[i].seats[j].status = 'Availible'
                          event.seatMap[i].seats[j].ticket = '0'
                          event.save(function (err, s) {
                            if (err) { console.log(err) }
                            return res.status(202).send({
                              success: true,
                              message: 'Accepted. Ticket returned.'})
                          })
                        })
                      return
                    } else {
                      return res.status(405).send({
                        success: false,
                        message: 'Seat (' + zone + ':' + seat + ') was availible, cannot be returned'})
                    }
                  }
                }
              }
            }
            return res.status(404).send({
              success: false,
              message: 'Seat not found'})
          }
        })
      })
    })
  }
}

module.exports.EventOperation = EventOperation
module.exports.Event = Event
