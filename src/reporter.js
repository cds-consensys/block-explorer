const lJustify = (str, length) => str.padStart(length, ' ')

const logSummary = db => {
  const { internal, external } = db

  const text = `
All values in Wei
Total ETH transferred: ${db.totalTransfer}
  Sent:
    Externally Owned Accounts: ${external.sent} (${external.sentpct} %)
            Contract Accounts: ${internal.sent} (${db.internal.sentpct} %)
  Received:
    Externally Owned Accounts: ${external.received} (${external.receivedpct} %)
            Contract Accounts: ${internal.received} (${internal.receivedpct} %)

Total Contracts created: ${db.contractsCreated.length}
`
  console.log(text)
}

// Todo: if this grows more, find a logger or curses or chalky module
//
module.exports = db => {
  const accounts = Object.keys(db.accounts)
  for (let key of accounts) {
    const account = db.accounts[key]
    const ethIn = lJustify('' + account.ethIn, 30)
    const ethOut = lJustify('' + account.ethOut, 30)
    const accountType = account.isExternalyOwnedAccount
      ? 'Externally Owned'
      : 'Contract'
    console.log(`${key}\t${ethIn} in\t${ethOut} out\t${accountType} account`)
  }

  logSummary(db)
}
