module.exports = {
  secret: '1l0v3burr1t0$',
  database: 'mongodb://127.0.0.1:27017/test',
  networks: {
    eth_development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    },
    eth_release: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    }
  }
}
