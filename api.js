const { promisify } = require('util')
const Web3 = require('web3')

const NETWORKS = {
  rinkeby: process.env.BKX_RINKEBY,
  mainnet: process.env.BKX_MAINNET,
  local: 'http://localhost:8545',
  testing: 'http://localhost:9545'
}

module.exports = args => {
  const network = NETWORKS[args['--net'].toLowerCase()]
  const web3 = new Web3(new Web3.providers.HttpProvider(network))

  // Wrap these node callback convention methods to use as promises
  //
  const getCode = promisify(web3.eth.getCode.bind(web3.eth))
  const getBlock = promisify(web3.eth.getBlock.bind(web3.eth))
  const toBigNumber = web3.toBigNumber

  return {
    getCode,
    getBlock,
    toBigNumber
  }
}
