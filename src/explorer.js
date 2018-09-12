const addAccount = async (account, db, api) => {
  if (account in db.accounts) return

  const code = await api.getCode(account)
  const isExternalyOwnedAccount = code === '0x' || code === '0x0'
  db.accounts[account] = {
    isExternalyOwnedAccount,
    ethOut: api.fnBigZero(),
    ethIn: api.fnBigZero()
  }
}

const getTransactionResults = async (hash, api, options) => {
  const { hasConsole, logreceipts } = options
  const receipt = await api.getTransactionReceipt(hash)
  const { status, contractAddress } = receipt
  if (logreceipts && hasConsole) {
    console.group('Transaction hash')
    console.log(JSON.stringify(receipt, null, 2))
    console.log('*****\n')
    console.groupEnd()
  }
  // mainnet and rinkeby use status '0x1'
  // ganache uses '0x01'
  const success = status === '0x01' || status === '0x1'
  return { success, contractAddress }
}

const parseTransactions = async (trans, db, api, options) => {
  const { logtrans, hasConsole, logcontracts } = options
  const compareAscending = (a, b) => a.transactionIndex - b.transactionIndex
  trans.sort(compareAscending)

  for (let tx of trans) {
    const { from: accFrom, to: accTo, value, nonce, hash } = tx
    const header = `Blk[${tx.blockNumber}]:tx(${tx.transactionIndex})`

    const txResult = await getTransactionResults(hash, api, options)
    const { success, contractAddress } = txResult

    if (!success) continue

    if (contractAddress) {
      db.contractsCreated.push(contractAddress)

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

    await addAccount(accFrom, db, api)
    await addAccount(accTo, db, api)

    // update accumulators
    db.accounts[accFrom].ethOut = db.accounts[accFrom].ethOut.plus(value)
    db.accounts[accTo].ethIn = db.accounts[accTo].ethIn.plus(value)
    db.totalTransferred = db.totalTransferred.plus(value)

    if (db.accounts[accTo].isExternalyOwnedAccount) {
      db.totalInExternals = db.totalInExternals.plus(value)
    } else {
      db.totalInContracts = db.totalInContracts.plus(value)
    }

    if (db.accounts[accFrom].isExternalyOwnedAccount) {
      db.totalOutExternals = db.totalOutExternals.plus(value)
    } else {
      db.totalOutContracts = db.totalOutContracts.plus(value)
    }

    if (hasConsole && logtrans) {
      console.log(`${header}: ${accFrom} -> ${accTo}: ${value} Wei`)
    }
  }
}

const percentages = (portion, whole) =>
  portion
    .dividedBy(whole)
    .times(100)
    .toFixed(2)
    .toString(10)

const tallySummary = db => {
  db.pctSentByContracts = percentages(db.totalOutContracts, db.totalTransferred)
  db.pctSentByExternals = percentages(db.totalOutExternals, db.totalTransferred)

  db.pctReceivedByContracts = percentages(
    db.totalInContracts,
    db.totalTransferred
  )
  db.pctReceivedByExternals = percentages(
    db.totalInExternals,
    db.totalTransferred
  )
}

const getBlockRange = async (args, api) => {
  let start = args.STARTBLOCK
  let end = args.ENDBLOCK

  const latestBlock = await api.getBlock('latest')

  if (args.FROMCURRENTBLOCK) {
    end = latestBlock.number
    start = end - args.FROMCURRENTBLOCK
    if (start < 0) start = 0
  } else if (end === 'latest') {
    end = latestBlock.number
  }
  return [start, end]
}

const blockQuery = async args => {
  // Bootstrap API from args
  const api = require('./api')(args)

  const [startBlock, endBlock] = await getBlockRange(args, api)
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

  // Data store of interesting accumulated data
  const db = {
    // account -> accountbook.
    // The book accumulates payouts and pay-ins as well as account type: Externally
    // Owned, or contract
    //
    accounts: {},

    // The total amount of Wei transferred in the specified range
    totalTransferred: api.fnBigZero(),

    // Totals for External accounts
    totalInExternals: api.fnBigZero(),
    totalOutExternals: api.fnBigZero(),

    // Totals for Contract accounts
    totalInContracts: api.fnBigZero(),
    totalOutContracts: api.fnBigZero(),

    // Total contracts created
    contractsCreated: []
  }

  do {
    try {
      const block = await api.getBlock(blockNum++, true)
      logblocks && console.log('block', JSON.stringify(block, null, 2))

      await parseTransactions(block.transactions, db, api, options)
    } catch (error) {
      console.error(error)
      return { error }
    }
  } while (blockNum <= endBlock)

  args.hasConsole &&
    console.log(`Summary Report of Block Range [${startBlock}, ${endBlock}]\n`)

  tallySummary(db)
  return db
}

module.exports = {
  blockQuery
}
