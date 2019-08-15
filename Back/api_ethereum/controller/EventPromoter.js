const contract = require('./contract')
const contracts = contract.contracts
const callTx = contract.callTx
const sendTxAndGetInfo = contract.sendTxAndGetInfo

const EventPromoter = {
  create: function (req, res) {
    sendTxAndGetInfo(contracts.Admin.methods.createPromoter(req.body.name))
    .then(e => {
      if (!e) {
        return res.status(405).send({
          success: false,
          message: "Couldn't create the promoter"})
      }

      e.promise.then(hash => {
        res.json({message: true, hash: hash, tx: e.tx})
      })
    })
  },

  list: function (req, res) {
    var c = contracts.Admin
    callTx(c.methods.listPromoters()).then(e => {
      var r = {}
      var getName = function (i, contract) {
        return callTx(contract.methods.name()).then(function (name) {
          r[e[i]] = name.replace(/['"]+/g, '')
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
