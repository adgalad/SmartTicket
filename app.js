// REQUIRES
const shell = require('shelljs')
const express = require('express')
const cors = require('cors')
const Web3 = require('web3')
const config = require('./config').networks.development
const fs = require('fs')

// Init Express with cors
const app = express()
app.use(cors())

// Init Web3 using config.js
const web3 = new Web3('http://' + config.host + ':' + config.port)

var contracts = {}

function migrate (account, contractName) {
  // Compile contract
  shell.exec('rm -r build/; truffle compile')
  // Deploy contracts
  const fileName = './build/contracts/' + contractName + '.json'
  const json = require(fileName)
  var contract = new web3.eth.Contract(json.abi, {from: account, gas: '4700000'})

  console.log('Migrating contract for', contractName)

  contract.deploy({data: json.bytecode}).send({from: account, gas: '4700000'}).then(e => {
    contract.options.address = e._address
    json['address'] = e._address
    fs.writeFile(fileName, JSON.stringify(json), 'utf8', e => {
      if (e) console.log(e)
      else console.log('Saving', fileName)
    })
  })
}

function loadContract (account, contractName) {
  const fileName = './build/contracts/' + contractName + '.json'
  const json = require(fileName)
  contracts[contractName] = new web3.eth.Contract(
    json.abi,
    json.address,
    {from: account, gas: '4700000'}
  )
  console.log(json.address)
}

// ROUTES
function sendTx (f) {
  return web3.eth.getAccounts().then(accounts => {
    const sender = {from: accounts[0], gas: '4700000'}
    var x = f.call()
    f.send(sender)
    return x
  })
}

app.get('/eventPromoter/create', (req, res, next) => {
  sendTx(contracts.Admin.methods.createPromoter('hola123')).then(e => {
    res.send(e)
  })
})

app.get('/event/create', (req, res) => {
  console.log(req)
  var contract = contracts.EventPromoter
  contract.options.address = req.query.promoter

  var name = req.query.name
  var place = req.query.place
  var date = req.query.date
  var nSeat = req.query.nSeat
  var resell = req.query.resell
  var delegate = req.query.delegate

  sendTx(contract.methods.createEvent(name, place, date, nSeat, resell, delegate))
      .then((e) => {
        res.send(e)
      })
})
// localhost:3000/event/create?name=Hola&place=Caracas&date=123&nSeat=100&resell=1&delegate=1&promoter=0xf1fbA9D92B9a90Cba2507B5199106f7a84780db3
app.route('/inicio/:id')
  .get(
    function (req, res) {
      console.log('Entre! ' + req.params.id)
    }

)

const argv = process.argv
if (argv[2] === 'run') {
  web3.eth.getAccounts().then(function (accounts) {
    loadContract(accounts[0], 'Admin')
    loadContract(accounts[0], 'Event')
    loadContract(accounts[0], 'EventPromoter')
    console.log(contracts)
    app.listen(3000)
  })
} else if (argv[2] === 'migrate') {
  web3.eth.getAccounts().then(function (accounts) {
    migrate(accounts[0], 'Admin')
  })
}

// module.exports = {contracts, deploy}
