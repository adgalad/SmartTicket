const DB = require('../model/EventPromoter')
const jwt = require('jsonwebtoken')
const app = require('../express')
const request = require('request')

const EventPromoter = {

  create: function (req, res) {
    request.post(
      {url: 'http://localhost:3001/eventPromoter',
        form: { name: req.body.email }},
        (err, resp, body) => {
          if (err) res.send(err)
          try {
            req.body.ethereumHash = JSON.parse(body).hash
          } catch (e) {
            return res.status(405).send({
              success: false,
              message: 'ERROR: Invalid JSON from eth server. (EventPromoter/create)',
              body: e })
          }
          console.log(body)
          var newPromoter = new DB.EventPromoter(req.body)
          newPromoter.save(function (err, event) {
            if (err) res.send(err)
            else res.json(event)
          })
        }
    )
  },

  list: function (req, res) {
    if (req.decoded.admin === false) {
      res.status(403).send({
        success: false,
        message: 'Forbidden'})
      return
    }
    DB.EventPromoter.find(req.query, function (err, promoter) {
      if (err) res.send(err)
      else res.json(promoter)
    })
  },

  get: function (req, res) {
    if (!req.query.email && !req.query._id) {
      res.status(405).send({
        success: false,
        message: 'Method Not Allowed. No parameters found.'})
      return
    }
    // lets verificate that the the user is the same as the requested promoter
    if (req.decoded.admin === false &&
        ((req.query.email && req.decoded.email !== req.query.email) ||
         (req.query.id && req.decoded.id !== req.query.id))) {
      res.status(403).send({
        success: false,
        message: 'Forbidden'})
      return
    }

    DB.EventPromoter.findOne(req.query, function (err, promoter) {
      if (err) res.send(err)
      else res.json(promoter)
    })
  },

  delete: function (req, res) {
    if (req.body.email === undefined && req.body._id === undefined) {
      res.status(405).send({
        success: false,
        message: 'Method Not Allowed. No parameters found.'})
      return
    }

    DB.EventPromoter.findOne(req.body).remove(function (err, promoter) {
      if (err) {
        res.send(err)
      } else if (promoter.n === 0) {
        res.status(404).send({
          success: false,
          message: 'Promoter not found'
        })
      } else {
        res.status(202).send({
          success: true,
          message: 'Accepted'
        })
      }
    })
  },

  authenticate: function (req, res) {
    if (!req.body.email) {
      res.status(405).send({
        success: false,
        message: 'No email'
      })
      return
    }
    DB.EventPromoter.findOne({email: req.body.email}, function (err, promoter) {
      if (err) res.send(err)
      else if (!promoter) {
        res.status(404).send({
          success: false,
          message: 'Promoter not found'
        })
      } else if (promoter) {
        // check if password matches
        if (promoter.password !== req.body.password) {
          res.status(405).send({
            success: false,
            message: 'Wrong Password'
          })
        } else {
          // if promoter is found and password is right
          // create a token with only our given payload
          // we don't want to pass in the entire promoter since that has the password
          const payload = {
            admin: promoter.admin,
            email: promoter.email,
            id: promoter.id,
            hash: promoter.ethereumHash
          }
          var token = jwt.sign(payload, app.get('superSecret'), {
            expiresIn: 3600 * 24 * 2 // expires in 48 hours
          })

          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          })
        }
      }
    })
  }
}

module.exports = EventPromoter
