const contract = require('../controller/contract')
const cors = require('cors')
const express = require('express')
var bodyParser = require('body-parser')

// Init Express with cors
const routes = express()
routes.use(cors())
routes.use(bodyParser.json())
routes.use(bodyParser.urlencoded({ extended: true }))

var contracts = {}

routes.get('/eventPromoter/new', (req, res, next) => {
  contract.sendTx(contracts.Admin.methods.createPromoter('hola123')).then(e => {
    res.send(e)
  })
})

routes.post('/event/delete', (req, res, next) => {
  console.log(req.body)
  var promoterAddress = req.body.promoter
  var eventAddress = req.body.event
  var c = contracts.EventPromoter

  c.options.address = promoterAddress
  
})

routes.get('/event/new', (req, res) => {
  console.log(req)
  var c = contracts.EventPromoter
  var q = req.query

  c.options.address = q.promoter

  var name = q.name
  var place = q.place
  var date = q.date
  var nSeat = q.nSeat
  var resell = q.resell
  var delegate = q.delegate

  contract.sendTx(c.methods.createEvent(name, place, date, nSeat, resell, delegate))
      .then((e) => {
        res.send(e)
      })
})

module.exports = routes
