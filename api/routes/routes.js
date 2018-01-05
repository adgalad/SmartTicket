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

routes.route('/event/setDate').patch(contract.Event.setDate)
routes.route('/event/setName').patch(contract.Event.setName)
routes.route('/event/setPlace').patch(contract.Event.setPlace)

/* Event Promoter */
routes.route('/eventPromoters')
  .get(contract.EventPromoter.list)

routes.route('/eventPromoter')
  .post(contract.EventPromoter.create)
  .get(contract.EventPromoter.get)

module.exports = routes
