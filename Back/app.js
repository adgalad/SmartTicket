const eth = require('./api_ethereum/app')
const server = require('./api_server/app')

const argv = process.argv
if (argv[2] === 'server') {
  server()
} else {
  eth(argv[2])
}
