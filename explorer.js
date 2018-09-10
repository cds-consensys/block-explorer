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

    // Todo: Investigate how to determine when a contract sends ether in a transaction
    // what does the transaction look like?
    //
    if (value.isZero()) {
      if (accTo === '0x0' || accTo === '0x') {
        // Todo: Contract creation. This seems to work on local with ganache,
        // need test data to see what it is on main and other networks
        //
        // on localnet with ganache 0x0 !== 0x00
        const hexNonce = nonce === 0 ? 0x00 : api.toHex(nonce)
        const contract = api.getContractAddress(accFrom, hexNonce)
        if (logcontracts) {
          /* console.log('block', tx.blockNumber)
           * console.log('sender, nonce', accFrom, hexNonce)
           * console.log(
           *   'contract address: ',
           *   api.getContractAddress(accFrom, hexNonce)
           * ) */
          console.log(`${header}: Contract created: ${contract}`)
        }
        db.contractsCreated.push(contract)
      }

      // No ETH transfer detected; short-circuit loop
      continue
    }

    // Todo: Not sure what circumstances transaction.to is null
    // No ETH transfer detected; short-circuit loop
    if (accTo === null) continue

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

const tallySummary = db => {
  db.pctSentByContracts = db.totalOutContracts
    .dividedBy(db.totalTransferred)
    .times(100)
    .toString(10)

  db.pctSentByExternals = db.totalOutExternals
    .dividedBy(db.totalTransferred)
    .times(100)
    .toString(10)

  db.pctReceivedByContracts = db.totalInContracts
    .dividedBy(db.totalTransferred)
    .times(100)
    .toFixed(2)
    .toString(10)

  db.pctReceivedByExternals = db.totalInExternals
    .dividedBy(db.totalTransferred)
    .times(100)
    .toFixed(2)
    .toString(10)
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
    const block = await api.getBlock(blockNum++, true)
    logblocks && console.log('block', JSON.stringify(block, null, 2))

    await parseTransactions(block.transactions, db, api, options)
  } while (blockNum <= endBlock)

  args.hasConsole &&
    console.log(`Summary Report of Block Range [${startBlock}, ${endBlock}]\n`)

  tallySummary(db)
  return db
}

module.exports = {
  blockQuery
}
