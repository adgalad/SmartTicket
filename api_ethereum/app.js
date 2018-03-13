
const web3 = require('./web3')
const contract = require('./controller/contract')
const routes = require('./routes/routes')
const migrate = require('./migration')

module.exports = function (arg) {
  web3.eth.getAccounts().then(function (accounts) {
    const initServer = function () {
      contract.loadContract(accounts[0], 'Admin')
      contract.loadContract(accounts[0], 'Event')
      contract.loadContract(accounts[0], 'EventPromoter')
      console.log('Init server localhost:3001')
      routes.listen(3001)
    }

    if (arg === 'migrate') {
      migrate(accounts[0], 'Admin', initServer)
    } else {
      initServer()
    }
  })
}
