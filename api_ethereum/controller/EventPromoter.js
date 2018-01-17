const contract = require('./contract')
const contracts = contract.contracts
const sendTx = contract.sendTx
const callTx = contract.callTx

const EventPromoter = {
  create: function (req, res) {
    console.log(req.body)
    console.log(contracts.Admin)
    sendTx(contracts.Admin.methods.createPromoter(req.body.name))
      .then(e => {
        if (!e) {
          return res.status(405).send({
            success: false,
            message: "Couldn't create the promoter"})
        }
        res.json({hash: e})
      }
    )
  },

  list: function (req, res) {
    var c = contracts.Admin
    console.log('hola')
    callTx(c.methods.listPromoters()).then(e => {
      var r = {}
      console.log('hola1')
      var getName = function (i, contract) {
        return callTx(contract.methods.name()).then(function (name) {
          r[e[i]] = name.replace(/['"]+/g, '')
          console.log(Object.keys(r).length, e.length)
          if (Object.keys(r).length === e.length) {
            res.json(r)
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
    c.options.address = req.query.address

    var r = {}
    callTx(c.methods.name()).then(function (name) {
      r.name = name.replace(/['"]+/g, '')
      callTx(c.methods.listEvents()).then(function (events) {
        r.events = events
        res.json(r)
      })
    })
  }
}

module.exports = EventPromoter
