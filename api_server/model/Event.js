const mongoose = require('./mongo')

const Schema = mongoose.Schema

const TicketSchema = new Schema({
  idHash: {
    type: String,
    required: 'An ID is required'
  },
  event: {
    type: String,
    required: 'An event id is required'
  },
  zone: {
    type: String,
    required: 'A zone name is required'
  },
  seat: {
    type: String,
    required: 'A seat number is required'
  },
  seatID: {
    type: Number,
    required: 'A seatID is required'
  },
  price: {
    type: Number,
    required: 'An ID is required'
  },
  delegatedHash: {
    type: String,
    default: ''
  }
})

const SeatSchema = new Schema({
  name: {
    type: String,
    default: []
  },
  status: {
    type: String,
    enum: ['Availible', 'Sold'],
    default: 'Availible'
  },
  seatID: {
    type: Number,
    require: 'A seat ID is required'
  },
  price: {
    type: Number,
    required: 'A price is required'
  },
  ticket: {
    type: String,
    default: null
  }
})

const ZoneSchema = new Schema({
  name: {
    type: String,
    required: 'A Zone name is required'
  },
  seats: {
    type: [SeatSchema],
    default: []
  }
})

const EventSchema = new Schema({
  name: {
    type: String,
    required: 'A name is required'
  },
  place: {
    type: String,
    required: 'A location is required'
  },
  owner: {
    type: String,
    required: 'A event owner is required'
  },
  date: {
    type: Number,
    required: 'A date is required'
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  nSeat: {
    type: Number,
    required: 'A number of seats is required'
  },
  resell: {
    type: Boolean,
    default: false
  },
  delegate: {
    type: Boolean,
    default: false
  },
  canReturn: {
    type: Boolean,
    default: false
  },
  seatMap: {
    type: [ZoneSchema],
    default: []
  },
  ethereumHash: {
    type: String,
    default: '0x0000000000000000000000000000000000000000'
  }
})

module.exports = {
  Event: mongoose.model('Events', EventSchema),
  Ticket: mongoose.model('Tickets', TicketSchema),
  Zone: mongoose.model('Zones', ZoneSchema),
  Seat: mongoose.model('Seats', SeatSchema)
}
