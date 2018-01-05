const web3 = require('./web3')

var contracts = {}

function loadContract (account, contractName) {
  const fileName = '../../build/contracts/' + contractName + '.json'
  const json = require(fileName)
  contracts[contractName] = new web3.eth.Contract(
    json.abi,
    json.address,
    {from: account, gas: '4700000'}
  )
}

function sendTx (f) {
  return web3.eth.getAccounts().then(accounts => {
    const sender = {from: accounts[0], gas: '4700000'}
    var x = f.call()
    f.send(sender)
    return x
  })
}

function callTx (f) {
  return f.call()
}

const Event = {
  delete: function (req, res) {
    var promoterAddress = req.body.promoter
    var eventAddress = req.body.event
    var c = contracts.EventPromoter
    c.options.address = promoterAddress
    sendTx(c.methods.deleteEvent(eventAddress)).then(
      (e) => {
        res.send(e)
      }
    )
  },
  create: function (req, res) {
    var promoterAddress = req.query.promoter
    var c = contracts.EventPromoter
    c.options.address = promoterAddress

    var name = req.body.name
    var place = req.body.place
    var date = parseInt(req.body.date)
    var nSeat = parseInt(req.body.nseat)
    var resell = req.body.resell
    var delegate = req.body.delegate

    sendTx(c.methods.createEvent(name, place, date, nSeat, resell, delegate)).then(
      (e) => {
        res.send(e)
      }
    )
    console.log(req.body)
  },
  get: function (req, res) {
    var eventAddress = req.query.address
    var c = contracts.Event
    c.options.address = eventAddress

    callTx(c.methods.getInfo()).then(
      e => {
        console.log(e)
        res.send(e)
      }
    )
  }
}

const EventPromoter = {
  create: function (req, res) {
    sendTx(contracts.Admin.methods.createPromoter(req.body.name))
      .then(e => {
        res.send(e)
      }
    )
  },

  list: function (req, res) {
    var c = contracts.Admin
    callTx(c.methods.listPromoters()).then(e => {
      var r = {}

      var getName = function (i, contract) {
        return callTx(contract.methods.name()).then(function (name) {
          r[name.replace(/['"]+/g, '')] = e[i]
          if (Object.keys(r).length === e.length) {
            res.send(r)
          }
        })
      }

      for (var i = 0; i < e.length; i++) {
        var p = contracts.EventPromoter
        p.options.address = e[i]
        getName(i, p)
      }
    })
  },

  get: function (req, res) {
    var c = contracts.EventPromoter
    c.options.address = req.query.promoter

    var r = {}
    callTx(c.methods.name()).then(function (name) {
      r.name = name.replace(/['"]+/g, '')
      callTx(c.methods.listEvents()).then(function (events) {
        r.events = events
        res.send(r)
      })
    })
  }
}

const EventOperation = {
  buyTicket: function (req, res) {
    var c = contracts.Event
    c.options.address = req.body.address
    var owner = web3.utils.fromAscii(req.body.owner)
    var delegate = web3.utils.fromAscii(req.body.delegate)
    var seat = parseInt(req.body.seat)

    sendTx(c.methods.buyTicket(owner, seat, delegate)).then(
      e => {
        res.send('Ticket Comprado!')
      }
    )
  },
  resellTicket: function (req, res) {
    var c = contracts.Event
    c.options.address = req.body.address
    var owner = web3.utils.fromAscii(req.body.owner)
    var delegate = web3.utils.fromAscii(req.body.delegate)
    var seat = parseInt(req.body.seat)

    sendTx(c.methods.resellTicket(owner, seat, delegate)).then(
      e => {
        res.send('Ticket Vendido!')
      }
    )
  }
}

module.exports.EventOperation = EventOperation
module.exports.Event = Event
module.exports.EventPromoter = EventPromoter
module.exports.loadContract = loadContract
module.exports.sendTx = sendTx
