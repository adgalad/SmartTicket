const web3 = require('../web3')
const contract = require('./contract')
const contracts = contract.contracts
const sendTx = contract.sendTx
const sendTxAndGetInfo = contract.sendTxAndGetInfo
const callTx = contract.callTx

const Event = {
  delete: function (req, res) {
    var promoterAddress = req.body.promoter
    var eventAddress = req.body.event
    var c = contracts.EventPromoter
    c.options.address = promoterAddress
    sendTx(c.methods.deleteEvent(eventAddress))
      .then((e) => {
        res.status(202).send(e)
      }
    )
  },
  create: function (req, res) {
    var promoterAddress = req.body.promoter
    var c = contracts.EventPromoter
    c.options.address = promoterAddress

    var name = req.body.name
    var place = req.body.place
    var date = parseInt(req.body.date)
    var nSeat = parseInt(req.body.nSeat)
    var resell = req.body.resell
    var delegate = req.body.delegate
    var canReturn = req.body.canReturn

    sendTxAndGetInfo(c.methods.createEvent(name, place, date, nSeat, resell, delegate, canReturn)).then(
      (e) => {
        if (!e) {
          return res.status(405).send({
            success: false,
            message: "Couldn't create the promoter"})
        }

        e.promise.then(hash => {
          res.status(202).json({message: true, hash: hash, tx: e.tx})
        })
      }
    )
  },

  get: function (req, res) {
    var address = req.query.address
    if (address === undefined) {
      res.status(400).send({})
    } else {
      var c = contracts.Event
      c.options.address = address

      callTx(c.methods.getInfo()).then(e => {
        var r = {}
        var i = 0
        r['name'] = e[i++]
        r['place'] = e[i++]
        r['date'] = e[i++]
        r['nSeat'] = e[i++]
        r['canResell'] = e[i++]
        r['canDelegate'] = e[i++]
        r['canReturn'] = e[i++]
        res.status(202).json(r)
      })
    }
  },

  getTicket: function (req, res) {
    var address = req.body.address
    var seat = req.body.seat
    if (address === undefined || seat === undefined) {
      res.send({})
    } else {
      var c = contracts.Event
      c.options.address = address

      callTx(c.methods.tickets(seat)).then(e => {
        console.log(e)
        delete e['0']
        delete e['1']
        delete e['2']
        res.status(202).json({
          success: true,
          message: e
        })
      })
    }
  },

  setDate: function (req, res) {
    var address = req.body.address
    if (address === undefined) {
      res.status(405).send({
        success: false,
        message: 'No event address'})
    } else {
      var c = contracts.Event
      c.options.address = address
      var date = req.body.date
      if (date === undefined) {
        res.status(405).send({
          success: false,
          message: 'A date is required'})
      } else {
        sendTx(c.methods.changeDate(date)).then(e => {
          res.send(date)
        })
      }
    }
  },

  setName: function (req, res) {
    var address = req.body.address
    if (address === undefined) {
      res.status(405).send({
        success: false,
        message: 'No event address'})
    } else {
      var c = contracts.Event
      c.options.address = address
      var name = req.body.name
      if (name === undefined) {
        res.status(405).send({
          success: false,
          message: 'A new name is required'})
      } else {
        sendTx(c.methods.changeName(name)).then(e => {
          res.status(202).send(name)
        })
      }
    }
  },

  setPlace: function (req, res) {
    var address = req.body.address
    if (address === undefined) {
      res.status(405).send({
        success: false,
        message: 'No event address'})
    } else {
      var c = contracts.Event
      c.options.address = address
      var place = req.body.place
      if (place === undefined) {
        res.status(405).send({
          success: false,
          message: 'A new place is required'})
      } else {
        sendTx(c.methods.changePlace(place)).then(e => {
          res.send(place)
        })
      }
    }
  }
}

const EventOperation = {
  buyTicket: function (req, res) {
    var c = contracts.Event
    c.options.address = req.body.address
    var owner = web3.utils.sha3(req.body.owner)
    var delegate = web3.utils.sha3(req.body.delegate)
    var seat = parseInt(req.body.seat)
    var price = parseInt(req.body.price)

    sendTxAndGetInfo(c.methods.buyTicket(owner, seat, price, delegate)).then(
      (e) => {
        if (!e) {
          return res.status(405).send({
            success: false,
            message: "Couldn't create the promoter"})
        }

        e.promise.then(info => {
          res.status(202).json({success: true, message: info, tx: e.tx})
        })
      }
    )
  },
  resellTicket: function (req, res) {
    var c = contracts.Event
    c.options.address = req.body.address
    var owner = web3.utils.sha3(req.body.owner)
    var newOwner = web3.utils.sha3(req.body.newOwner)
    var delegate = web3.utils.sha3(req.body.delegate)
    var seat = parseInt(req.body.seat)
    var price = parseInt(req.body.price)

    sendTx(c.methods.resellTicket(owner, newOwner, seat, price, delegate))
      .then(e => {
        return res.status(202).send({
          success: true,
          message: 'Ticket resold'})
      })
  },

  returnTicket: function (req, res) {
    var c = contracts.Event
    c.options.address = req.body.address
    var seat = parseInt(req.body.seat)
    var owner = web3.utils.sha3(req.body.owner)
    console.log(owner, seat)
    sendTxAndGetInfo(c.methods.returnTicket(owner, seat)).then(e => {
      console.log(e)
      if (!e || !e.promise) {
        return res.status(405).send({
          success: false,
          message: "Couldn't return ticket"})
      }
      e.promise.then(info => {
        res.status(202).send({
          success: true,
          tx: e.tx,
          message: 'Ticket returned'})
      })
    })
  }
}

module.exports.EventOperation = EventOperation
module.exports.Event = Event
