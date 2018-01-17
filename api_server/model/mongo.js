'use strict'
var mongoose = require('mongoose')
var mongodb = require('../../config.js').database

mongoose.Promise = global.Promise
mongoose.connect(mongodb)

module.exports = mongoose
