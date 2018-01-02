// REQUIRES
const express = require('express')
const cors = require('cors')
const Web3 = require('web3')
const config = require('./config').networks.development

// Init Express with cors
const app = express()
app.use(cors())

// Init Web3 using config.js
const web3 = new Web3('http://' + config.host + ':' + config.port)

var contracts = {}

function deploy (account, contractName) {
  const json = require('./build/contracts/' + contractName + '.json')
  var contract = new web3.eth.Contract(
    json.abi,
    json.networks['5777'].address,
    {from: account, gas: '4700000'}
  )
  console.log(json.networks['5777'].address)
  contracts[json.contractName] = contract.methods
}

// web3.eth.getAccounts().then(function(accounts){
//   deploy(accounts[0], "MovieTheater");
//   return accounts;
// }).then(accounts =>{
//   const c      = contracts.MovieTheater;
//   const sender = {from: accounts[0],gas: '4700000'}

//   c.setNumberOfTheaters(2).send(sender).then(() => {
//     c.nTheater().call().then(e => console.log(e));
//   });

//   // c.setNumberOfTheaters(112).send(sender).then(() => {
//   //   c.nTheater().call().then(e => console.log(e));
//   // })

// })

app.get('/deploy', (req, res, next) => {
  web3.eth.getAccounts().then(function (accounts) {
    deploy(accounts[0], 'MovieTheater')
    res.send('Did it')
  })
})

// ROUTES
app.get('/setNumberOfTheaters', (req, res, next) => {
  web3.eth.getAccounts().then(accounts => {
    const c = contracts.MovieTheater
    const sender = {from: accounts[0], gas: '4700000'}
    const n = req.query.n
    c.setNumberOfTheaters(n).send(sender).then(e => {
      c.nTheater().call().then(e => {
        var a = {
          from: accounts[0],
          gas: '4700000',
          res: e
        }
        res.send(a)
      })
    })
  })
})

app.get('/nTheater', (req, res, next) => {
  web3.eth.getAccounts().then(accounts => {
    contracts.MovieTheater.nTheater().call().then(e => res.send(e))
  })
})

app.listen(3000)

// module.exports = {contracts, deploy}
