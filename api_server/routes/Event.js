const Event = require('../controller/Event').Event
const EventOperation = require('../controller/Event').EventOperation
const app = require('../express')
const auth = require('../controller/authentication')

/* Event */
app.route('/events').get(Event.show)
app.route('/event')
  .delete(auth.promoter, Event.delete)
  .post(auth.promoter, Event.create)
  .get(auth.promoter, Event.get)

app.post('/event/ticket', Event.getTicket)
// app.patch('/event/setDate', Event.setDate)
// app.patch('/event/setName', Event.setName)

app.post('/event/buyTicket', auth.promoter, EventOperation.buyTicket)
app.post('/event/resellTicket', auth.promoter, EventOperation.resellTicket)
app.post('/event/returnTicket', auth.promoter, EventOperation.returnTicket)
app.post('/event/setTicketResell', auth.promoter, EventOperation.setTicketResell)
app.post('/event/cancelTicketResell', auth.promoter, EventOperation.cancelTicketResell)
