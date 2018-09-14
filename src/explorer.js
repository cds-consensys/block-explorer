const getTransactionResults = async (hash, api, options) => {
  const { hasConsole, logreceipts } = options
  const { status, contractAddress } = await api.getTransactionReceipt(hash)
  if (logreceipts && hasConsole) {
    console.log('Transaction hash')
    console.log(JSON.stringify(receipt, null, 2))
    console.log('*****\n')
  }
  // mainnet and rinkeby use status '0x1'
  // ganache uses '0x01'
  const success = status === '0x01' || status === '0x1'
  return { success, contractAddress }
}

const parseTransactions = async (trans, ledger, api, options) => {
  const { logtrans, hasConsole, logcontracts } = options
  const compareAscending = (a, b) => a.transactionIndex - b.transactionIndex
  trans.sort(compareAscending)

  for (let tx of trans) {
    const { from: accFrom, to: accTo, value, nonce, hash } = tx
    const header = `Blk[${tx.blockNumber}]:tx(${tx.transactionIndex})`

    // force log all transactions
    // console.log(`${header}: ${accFrom} -> ${accTo}: ${value} Wei`)

    const { success, contractAddress } = await getTransactionResults(
      hash,
      api,
      options
    )

    if (!success) continue

    if (contractAddress) {
      ledger.addContract(contractAddress)

      if (logcontracts) {
        console.log(`${header}: Contract address created: ${contractAddress}`)
      }
      continue
    }

    // Todo: Investigate how to determine when a contract sends ether in a transaction
    // what does the transaction look like?
    //
    if (value.isZero()) {
      // No ETH transfer detected; short-circuit loop
      continue
    }

    await ledger.addTransaction(accFrom, accTo, value, options)

    if (hasConsole && logtrans) {
      console.log(`${header}: ${accFrom} -> ${accTo}: ${value} Wei`)
    }
  }
}

const getBlockRange = async (args, api) => {
  let startBlock = args.STARTBLOCK
  let endBlock = args.ENDBLOCK

  const latestBlock = await api.getBlock('latest')

  if (args.FROMCURRENTBLOCK) {
    endBlock = latestBlock.number
    startBlock = endBlock - args.FROMCURRENTBLOCK
    if (startBlock < 0) startBlock = 0
  } else if (endBlock === 'latest') {
    endBlock = latestBlock.number
  }
  return { startBlock, endBlock }
}
const blockQuery = async args => {
  // Bootstrap API from args
  const api = require('./api')(args)
  const ledger = require('./ledger')(api)

  const { startBlock, endBlock } = await getBlockRange(args, api)
  let blockNum = startBlock

  // options to pass on
  const options = {
    hasConsole: args['hasConsole'],
    logtrans: args['--logtrans'],
    logreceipts: args['--logreceipts'],
    logcontracts: args['--logcontracts']
  }

  // local options
  const logblocks = args['--logblocks']

  do {
    try {
      const block = await api.getBlock(blockNum++, true)
      logblocks && console.log('block', JSON.stringify(block, null, 2))

      await parseTransactions(block.transactions, ledger, api, options)
    } catch (error) {
      console.error(error)
      return { error }
    }
  } while (blockNum <= endBlock)

  args.hasConsole &&
    console.log(`Summary Report of Block Range [${startBlock}, ${endBlock}]\n`)

  ledger.finalize()

  // oh boy
  return ledger.db
}

module.exports = {
  blockQuery
}
