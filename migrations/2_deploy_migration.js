var MovieTheater = artifacts.require('MovieTheater')
var MovieEvent = artifacts.require('MovieEvent')

module.exports = function (deployer) {
  deployer.deploy(MovieTheater)
  deployer.deploy(MovieEvent)
}
