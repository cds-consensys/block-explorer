const addAccount = async (account, db, api) => {
  if (account in db.accounts) return

  const code = await api.getCode(account)
  const isExternalyOwnedAccount = code === '0x' || code === '0x0'
  db.accounts[account] = {
    isExternalyOwnedAccount,
    ethOut: api.toBigNumber('0'),
    ethIn: api.toBigNumber('0')
  }
}

const parseTransactions = async (
  trans,
  db,
  api,
  { logtrans, hasConsole, logcontracts }
) => {
  const compareAscending = (a, b) => a.transactionIndex - b.transactionIndex
  trans.sort(compareAscending)

  for (let tx of trans) {
    const { from: accFrom, to: accTo, value, nonce } = tx
    const header = `Blk[${tx.blockNumber}]:tx(${tx.transactionIndex})`

    // On Mainnet and Rinkeby, contract creation is detected when
    // to: is null.
    //
    // This is different from ganache which sets to: field as '0x0'
    //
    // Todo: pass current network to this function so this expression is
    // more accurate:
    // if (network in [mainnet, rinkeby] && accTo === null) || (network is ganache && accTo === '0x0')...
    //
    if (accTo === null || accTo === '0x0') {
      const contract = api.getContractAddress(accFrom, nonce)
      if (logcontracts) {
        console.log(`${header}: Contract created: ${contract}`)
      }
      db.contractsCreated.push(contract)
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
    totalTransferred: api.toBigNumber('0'),

    // Totals for External accounts
    totalInExternals: api.toBigNumber('0'),
    totalOutExternals: api.toBigNumber('0'),

    // Totals for Contract accounts
    totalInContracts: api.toBigNumber('0'),
    totalOutContracts: api.toBigNumber('0'),

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
