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

const EventPromoter = {
  create: function (req, res) {
    var c = contracts.EventPromoter
    var q = req.query

    c.options.address = q.promoter

    var name = q.name
    var place = q.place
    var date = q.date
    var nSeat = q.nSeat
    var resell = q.resell
    var delegate = q.delegate

    sendTx(c.methods.createEvent(name, place, date, nSeat, resell, delegate))
        .then((e) => {
          res.send(e)
        })
  },

  list: function (req, res) {
    console.log('Missing implementation')
  },

  get: function (req, res) {
    console.log('Missing implementation')
  }
}

module.exports.EventPromoter = EventPromoter
module.exports.loadContract = loadContract
module.exports.sendTx = sendTx
