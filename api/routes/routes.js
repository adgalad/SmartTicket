const contract = require('../controller/contract')
const cors = require('cors')
const express = require('express')

// Init Express with cors
const routes = express()
routes.use(cors())

routes.get('/eventPromoter/new', (req, res, next) => {
  contract.sendTx(contract.Admin.methods.createPromoter()).then(e => {
    res.send(e)
  })
})

routes.route('/eventPromoter')
  .post(contract.EventPromoter.create)
  .get(contract.EventPromoter.list)

// routes.route('/eventPromoter/:id')
//   .get

module.exports = routes
