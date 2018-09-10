const lJustify = (str, length) => str.padStart(length, ' ')

// Todo: if this grows more, find a logger or curses or chalky module
//
const display = db => {
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

  console.log('All values in Wei')
  console.log(`Total ETH Transferred: ${db.totalTransferred}`)
  console.log(
    `Total ETH sent by Externally Owned Accounts: ${db.totalOutExternals}`
  )
  console.log(`Total ETH sent by Contract Accounts: ${db.totalOutContracts}`)
  console.log(
    `Total ETH received by Externally Owned Accounts: ${db.totalInExternals}`
  )
  console.log(`Total ETH received by Contract Accounts: ${db.totalInContracts}`)
  console.log(`PCT Sent by Contract Accounts: ${db.pctSentByContracts}`)
  console.log(`PCT Sent by Externally Owned Accounts: ${db.pctSentByExternals}`)
  console.log(`PCT Received by Contract Accounts: ${db.pctReceivedByContracts}`)
  console.log(
    `PCT Received by Externally Owned Accounts: ${db.pctReceivedByExternals}`
  )
  console.log(`Total Contracts created: ${db.contractsCreated.length}`)
}

module.exports = {
  display
}
