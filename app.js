// REQUIRES
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

function deploy (account, contractName) {
  const fileName = './build/contracts/' + contractName + '.json'
  const json = require(fileName)
  contracts[contractName] = new web3.eth.Contract(
    json.abi,
    json.address,
    {from: account, gas: '4700000'}
  ).methods
}

// ROUTES
app.get('/setNumberOfTheaters', (req, res, next) => {
  web3.eth.getAccounts().then(accounts => {
    const sender = {from: accounts[0], gas: '4700000'}
    contracts.MovieTheater.setNumberOfTheaters(req.query.n).send(sender)
    res.send({from: accounts[0], gas: '4700000', n: req.query.n})
  })
})

app.get('/nTheater', (req, res, next) => {
  web3.eth.getAccounts().then(accounts => {
    contracts.MovieTheater.nTheater().call().then(e => res.send(e))
  })
})

const argv = process.argv
if (argv[2] === 'run') {
  web3.eth.getAccounts().then(function (accounts) {
    deploy(accounts[0], 'MovieTheater')
    app.listen(3000)
  })
} else if (argv[2] === 'migrate') {
  web3.eth.getAccounts().then(function (accounts) {
    migrate(accounts[0], 'MovieTheater')
  })
}

// module.exports = {contracts, deploy}
