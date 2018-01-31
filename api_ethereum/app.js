
const web3 = require('./web3')
const contract = require('./controller/contract')
const routes = require('./routes/routes')
const migrate = require('./migration')

module.exports = function (arg) {
  if (arg === 'migrate') {
    web3.eth.getAccounts().then(function (accounts) {
      migrate(accounts[0], 'Admin')
    })
  }

  web3.eth.getAccounts().then(function (accounts) {
    contract.loadContract(accounts[0], 'Admin')
    contract.loadContract(accounts[0], 'Event')
    contract.loadContract(accounts[0], 'EventPromoter')
    routes.listen(3001)
  })
}
