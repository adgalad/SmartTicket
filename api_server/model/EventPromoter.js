const mongoose = require('./mongo')

var Schema = mongoose.Schema

var EventPromoterScheme = new Schema({
  username: {
    type: String,
    unique: true,
    required: 'An username is required'
  },
  password: {
    type: String,
    required: 'A password is required'
  },
  name: {
    type: String,
    required: 'A name is required'
  },
  admin: {
    type: Boolean,
    default: false
  },
  events: {
    type: [String],
    default: []
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  ethereumHash: {
    type: String,
    unique: true,
    default: '0x0000000000000000000000000000000000000000'
  }
})

module.exports = { EventPromoter: mongoose.model('EventPromoters', EventPromoterScheme) }
