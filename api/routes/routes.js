const contract = require('../controller/contract')
const cors = require('cors')
const express = require('express')
var bodyParser = require('body-parser')

// Init Express with cors
const routes = express()
routes.use(cors())
routes.use(bodyParser.json())
routes.use(bodyParser.urlencoded({ extended: true }))

routes.get('/eventPromoter/new', (req, res, next) => {
  contract.sendTx(contract.Admin.methods.createPromoter()).then(e => {
    res.send(e)
  })
})

// Event
routes.delete('/event/delete', contract.Event.delete)
routes.post('/event/create', contract.Event.create)

routes.route('/eventPromoter')
  .post(contract.EventPromoter.create)
  .get(contract.EventPromoter.list)

// routes.route('/eventPromoter/:id')
//   .get

module.exports = routes
