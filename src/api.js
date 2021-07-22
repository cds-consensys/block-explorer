const { promisify } = require('util')
const Web3 = require('web3')
require('dotenv').config()

const NETWORKS = {
  rinkeby: process.env.BKX_RINKEBY,
  mainnet: process.env.BKX_MAINNET,
  local: 'http://localhost:8545',
  testing: 'http://localhost:9545'
}

console.log(NETWORKS.rinkeby.split('').reverse().join('').split(0,6));

module.exports = args => {
  const network = NETWORKS[args['--net'].toLowerCase()]
  const web3 = new Web3(new Web3.providers.HttpProvider(network))

  // Wrap these node callback convention methods to use as promises
  //
  const getCode = promisify(web3.eth.getCode.bind(web3.eth))
  const getBlock = promisify(web3.eth.getBlock.bind(web3.eth))
  const getTransactionReceipt = promisify(
    web3.eth.getTransactionReceipt.bind(web3.eth)
  )

  // Expose a way to get an zero valued instance of BigNumber
  const fnBigZero = () => web3.toBigNumber('0')

  return {
    getCode,
    getBlock,
    fnBigZero,
    getTransactionReceipt
  }
}
