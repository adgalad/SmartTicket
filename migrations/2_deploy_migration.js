var Event = artifacts.require('Event')
var EventPromoter = artifacts.require('EventPromoter')
var Admin = artifacts.require('Admin')

module.exports = function (deployer) {
  deployer.deploy(Event)
  deployer.deploy(EventPromoter)
  deployer.deploy(Admin)
}
