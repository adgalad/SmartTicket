const fs = require('fs')
const shell = require('shelljs')
const web3 = require('./web3')

function migrate (account, contractName) {
  // Compile contract
  shell.exec('rm -rf build/; truffle compile')
  // Deploy contracts
  const fileName = 'build/contracts/' + contractName + '.json'
  const json = require('../' + fileName)
  var contract = new web3.eth.Contract(json.abi, {from: account, gas: '4700000'})

  console.log('Migrating contract for', contractName)

  contract.deploy({data: json.bytecode}).send({from: account, gas: '4700000'}).then(e => {
    contract.options.address = e._address
    json['address'] = e._address
    fs.writeFile(fileName, JSON.stringify(json), 'utf8', e => {
      if (e) console.log(e)
      else console.log('Saving', fileName)
    })
  })
}

module.exports = migrate
