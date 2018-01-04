const config = require('../../config').networks.development
const Web3 = require('web3')

const web3 = new Web3('http://' + config.host + ':' + config.port)

module.exports = web3
