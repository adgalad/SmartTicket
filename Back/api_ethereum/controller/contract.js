const web3 = require('../web3')

var contracts = {}

function loadContract (account, contractName) {
  const fileName = '../../build/contracts/' + contractName + '.json'
  const json = require(fileName)
  contracts[contractName] = new web3.eth.Contract(
    json.abi,
    json.address,
    {from: account, gas: '0'}
  )
}

function sendTx (f) {
  return web3.eth.getAccounts().then(accounts => {
    const sender = {from: accounts[0], gas: '0'}
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

function sendTxAndGetInfo (f) {
  return web3.eth.getAccounts().then(accounts => {
    const sender = {from: accounts[0], gas: '0'}
    var res = f.call()
    if (!res) {
      return undefined
    }

    return f.send(sender)
      .then(function (e) {
        return {success: true, promise: res, tx: e}
      })
      .catch(function (error) {
        return {success: false, message: error.message}
      })
  })
}
function callTx (f) {
  return f.call()
}

module.exports = {
  loadContract: loadContract,
  contracts: contracts,
  sendTx: sendTx,
  sendTxAndGetInfo: sendTxAndGetInfo,
  callTx: callTx
}
