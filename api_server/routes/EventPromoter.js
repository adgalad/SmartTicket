const EventPromoter = require('../controller/EventPromoter')
const app = require('../express')
const config = require('../../config')
const auth = require('../controller/authentication')

/* Event Promoter */
app.route('/eventPromoter/authenticate').post(EventPromoter.authenticate)

app.set('superSecret', config.secret)

// get an instance of the router for api routes
// var apiRoutes = express.Router()
// // route middleware to verify a token
// apiRoutes.use(authMiddleware)

// app.use('/', apiRoutes)

app.route('/eventPromoters')
  .get(auth.admin, EventPromoter.list)

app.route('/eventPromoter')
  .post(EventPromoter.create)
  .get(auth.promoter, EventPromoter.get)
  .delete(auth.admin, EventPromoter.delete)
