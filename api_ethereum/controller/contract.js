const web3 = require('../web3')

var contracts = {}

function loadContract (account, contractName) {
  const fileName = '../../build/contracts/' + contractName + '.json'
  const json = require(fileName)
  contracts[contractName] = new web3.eth.Contract(
    json.abi,
    json.address,
    {from: account, gas: '4700000'}
  )
}

function sendTx (f) {
  return web3.eth.getAccounts().then(accounts => {
    const sender = {from: accounts[0], gas: '4700000'}
    var x = f.call()
    f.send(sender)
    return x
  })
}

function callTx (f) {
  return f.call()
}

module.exports.loadContract = loadContract
module.exports.contracts = contracts
module.exports.sendTx = sendTx
module.exports.callTx = callTx
