const percentages = (portion, whole) =>
  portion
    .dividedBy(whole)
    .times(100)
    .toFixed(2)
    .toString(10)

class Ledger {
  constructor(api) {
    this.api = api
    this.db = {
      // Data store of interesting accumulated data
      // account -> accountbook.
      // The book accumulates payouts and pay-ins as well as account type: Externally
      // Owned, or contract
      //
      accounts: {},

      // The total amount of Wei transferred in the specified range
      totalTransfer: api.fnBigZero(),

      // Totals for external accounts
      external: {
        received: api.fnBigZero(),
        sent: api.fnBigZero()
      },

      // Totals for Contract accounts
      internal: {
        received: api.fnBigZero(),
        sent: api.fnBigZero()
      },

      // Total contracts created
      contractsCreated: []
    }
  }

  addContract(address) {
    this.db.contractsCreated.push(address)
  }

  async addAccount(account) {
    if (account in this.db.accounts) return

    const code = await this.api.getCode(account)
    const isExternalyOwnedAccount = code === '0x' || code === '0x0'

    const entry = {
      isExternalyOwnedAccount,
      ethOut: this.api.fnBigZero(),
      ethIn: this.api.fnBigZero()
    }
    this.db.accounts[account] = entry
  }

  async addTransaction(accFrom, accTo, value, options) {
    const { hasConsole, logtrans } = options
    const { db } = this

    // make sure accounts are in system
    await this.addAccount(accFrom)
    await this.addAccount(accTo)

    // update accumulators
    db.accounts[accFrom].ethOut = db.accounts[accFrom].ethOut.plus(value)
    db.accounts[accTo].ethIn = db.accounts[accTo].ethIn.plus(value)
    db.totalTransfer = db.totalTransfer.plus(value)

    if (db.accounts[accTo].isExternalyOwnedAccount) {
      db.external.received = db.external.received.plus(value)
    } else {
      db.internal.received = db.internal.received.plus(value)
    }

    if (db.accounts[accFrom].isExternalyOwnedAccount) {
      db.external.sent = db.external.sent.plus(value)
    } else {
      db.internal.sent = db.internal.sent.plus(value)
    }
  }

  finalize() {
    const { db } = this
    db.internal.sentpct = percentages(db.internal.sent, db.totalTransfer)
    db.external.sentpct = percentages(db.external.sent, db.totalTransfer)

    db.internal.receivedpct = percentages(
      db.internal.received,
      db.totalTransfer
    )
    db.external.receivedpct = percentages(
      db.external.received,
      db.totalTransfer
    )
  }
}
module.exports = api => new Ledger(api)
