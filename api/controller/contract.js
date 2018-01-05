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

const EventPromoter = {
  create: function (req, res) {
    sendTx(contracts.Admin.methods.createPromoter(req.query.name))
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

module.exports.EventPromoter = EventPromoter
module.exports.loadContract = loadContract
module.exports.sendTx = sendTx
