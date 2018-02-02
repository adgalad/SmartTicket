const Event = require('../controller/Event').Event
const EventOperation = require('../controller/Event').EventOperation
const EventPromoter = require('../controller/EventPromoter')
const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

// Init Express with cors
const routes = express()
routes.use(cors())
routes.use(bodyParser.json())
routes.use(bodyParser.urlencoded({ extended: true }))
routes.use(morgan('dev'))

/* Event */
routes.route('/event')
  .delete(Event.delete)
  .post(Event.create)
  .get(Event.get)

routes.post('/event/ticket', Event.getTicket)

routes.patch('/event/setDate', Event.setDate)
routes.patch('/event/setName', Event.setName)
routes.patch('/event/setPlace', Event.setPlace)

routes.post('/event/buyTicket', EventOperation.buyTicket)
routes.post('/event/resellTicket', EventOperation.resellTicket)
routes.post('/event/returnTicket', EventOperation.returnTicket)

/* Event Promoter */
routes.route('/eventPromoters')
  .get(EventPromoter.list)

routes.route('/eventPromoter')
  .post(EventPromoter.create)
  .get(EventPromoter.get)

module.exports = routes
