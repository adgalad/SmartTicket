
const web3 = require('./controller/web3')
const contract = require('./controller/contract')
const routes = require('./routes/routes')
const migrate = require('./controller/migration')

const argv = process.argv
if (argv[2] === 'run') {
  web3.eth.getAccounts().then(function (accounts) {
    contract.loadContract(accounts[0], 'Admin')
    contract.loadContract(accounts[0], 'Event')
    contract.loadContract(accounts[0], 'EventPromoter')
    routes.listen(3000)
  })
} else if (argv[2] === 'migrate') {
  web3.eth.getAccounts().then(function (accounts) {
    migrate(accounts[0], 'Admin')
  })
}
