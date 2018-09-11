const { promisify } = require('util')
const Web3 = require('web3')
const rlp = require('rlp')
const keccak = require('keccak')

const NETWORKS = {
  rinkeby: process.env.BKX_RINKEBY,
  mainnet: process.env.BKX_MAINNET,
  local: 'http://localhost:8545',
  testing: 'http://localhost:9545'
}

// https://ethereum.stackexchange.com/questions/19092/why-was-rlp-chosen-as-the-low-level-protocol-encoding-algorithm
// https://ethereum.stackexchange.com/a/46960/30050
const getContractAddress = web3 => (sender, nonce) => {
  // Use zero if nonce is naught, otherwise otherwise encoded nonce
  // OR generated contract address for nonze zero is will not match
  // what the EVM generates.
  //
  const input = [sender, nonce === 0 ? nonce : web3.toHex(nonce)]
  const rlpEncoded = rlp.encode(input)

  return keccak('keccak256')
    .update(rlpEncoded)
    .digest('hex')
    .substring(24)
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
    toBigNumber,
    getContractAddress: getContractAddress(web3)
  }
}
