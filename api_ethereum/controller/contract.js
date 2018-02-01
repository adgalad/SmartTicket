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

function sendTx1 (f) {
  return web3.eth.getAccounts().then(accounts => {
    const sender = {from: accounts[0], gas: '4700000'}
    var x = f.call()
    return f.send(sender)
      .then(function (e) {
        return x
      })
      .catch(function (error) {
        return {success: false, message: error.message}
      })
  })
}

function sendTx (f) {
  return web3.eth.getAccounts().then(accounts => {
    const sender = {from: accounts[0], gas: '4700000'}
    var x = f.call()
    return f.send(sender)
      .on('transactionHash', function (txHash) {
        const message = x
        message.tx = txHash
        return {success: true, message: message}
      })
      .on('error', function(error){
        return {success: false, message: error.message}
      })
      
      
  })
}

function callTx (f) {
  return f.call()
}

module.exports.loadContract = loadContract
module.exports.contracts = contracts
module.exports.sendTx = sendTx
// module.exports.sendTxAndGetInfo = sendTxAndGetInfo
module.exports.callTx = callTx
