const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

// Init Express with cors
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))

module.exports = app
