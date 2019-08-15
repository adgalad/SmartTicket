
// const contract = require('./controller/contract')
require('./routes/EventPromoter')
require('./routes/Event')
const app = require('./express')

module.exports = function () {
  console.log('listening localhost:3000')
  app.listen(3000)
}
