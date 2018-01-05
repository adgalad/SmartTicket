const contract = require('../controller/contract')
const cors = require('cors')
const express = require('express')

// Init Express with cors
const routes = express()
routes.use(cors())

routes.route('/eventPromoter')
  .post(contract.EventPromoter.create)
  .get(contract.EventPromoter.list)

routes.route('/eventPromoter/get')
  .get(contract.EventPromoter.get)

module.exports = routes
