const contract = require('../controller/contract')
const cors = require('cors')
const express = require('express')
var bodyParser = require('body-parser')

// Init Express with cors
const routes = express()
routes.use(cors())
routes.use(bodyParser.json())
routes.use(bodyParser.urlencoded({ extended: true }))

/* Event */
routes.route('/event')
  .delete(contract.Event.delete)
  .post(contract.Event.create)
  .get(contract.Event.get)

/* Event Promoter */
routes.route('/eventPromoters')
  .get(contract.EventPromoter.list)

routes.route('/eventPromoter')
  .post(contract.EventPromoter.create)
  .get(contract.EventPromoter.get)

module.exports = routes
