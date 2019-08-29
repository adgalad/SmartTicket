const app = require('../express')
const jwt = require('jsonwebtoken')
const DB = require('../model/EventPromoter')

// route middleware to verify a token

const adminAuth = function (req, res, next) {
  authMiddleware(req, res, next, function (req, res, next) {
    if (!req.decoded.admin) {
      res.status(403).send({
        success: false,
        message: 'Forbidden. Admin premissions needed'
      })
    }
    return req.decoded.admin
  })
}

const promoterAuth = function (req, res, next) {
  authMiddleware(req, res, next, function (req, res, next) {
    return true
  })
}

const authMiddleware = function (req, res, next, modifier) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token']

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.status(405).json({ success: false, message: 'Failed to authenticate token.' })
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded
        DB.EventPromoter.findOne(
          {_id: decoded.id, email: decoded.email},
          function (err, p) {
            if (err) return res.status(500).send(err)
            if (p === undefined) {
              return res.status(403).send({
                success: false,
                message: "Forbidden. Account doesn't exists"
              })
            }
            if (!modifier(req, res, next)) {
              return res.status(403).send({
                success: false,
                message: 'Forbidden.'
              })
            }
            if (req.body.token) delete req.body.token
            if (req.query.token) delete req.query.token
            if (req.headers['x-access-token']) delete req.headers['x-access-token']

            return next()
            return res.status(200).json({ success: true })
          })
      }
    })
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    })
  }
}

module.exports = {
  admin: adminAuth,
  promoter: promoterAuth
}
