const expect = require('chai').expect
const explorer = require('./explorer.js')

describe('explorer', () => {
  // Somehow knowing the details of these two blocks...
  //
  // A nice feature to request is to seed a development
  // chain with transactions, and have it running so these
  // types of tests would be easier
  //
  describe('rinkeby tests verify range [2971555, 2971556]', () => {
    let db
    const args = {
      STARTBLOCK: 2971555,
      ENDBLOCK: 2971556,
      '--net': 'rinkeby'
    }

    before(async () => {
      db = await explorer.blockQuery(args)
    })

    it('calculates the total transferred ETH', async () => {
      const expectedAmount = '58052400000000001'
      expect(db.totalTransferred.toString(10)).to.equal(expectedAmount)
    })

    it('counts the number of contracts created', () => {
      expect(db.contractsCreated.length).to.equal(0)
    })

    describe('for Externally Owned Accounts', () => {
      it('calculates the total ETH received', async () => {
        expect(db.totalInExternals.toString(10)).to.equal('0')
        expect(db.pctReceivedByExternals.toString(10)).to.equal('0.00')
      })

      it('calculates the total ETH sent', async () => {
        const expectedAmount = '58052400000000001'
        expect(db.totalOutExternals.toString(10)).to.equal(expectedAmount)
        expect(db.pctSentByExternals.toString(10)).to.equal('100.00')
      })
    })

    describe('for Contract Accounts', () => {
      it('calculates the total ETH received', async () => {
        const expectedAmount = '58052400000000001'
        expect(db.totalInContracts.toString(10)).to.equal(expectedAmount)
        expect(db.pctReceivedByContracts.toString(10)).to.equal('100.00')
      })

      it('calculates the total ETH sent', async () => {
        expect(db.totalOutContracts.toString(10)).to.equal('0')
        expect(db.pctSentByContracts.toString(10)).to.equal('0.00')
      })
    })
  })
})

/*
    accounts: {},

    // Totals for External accounts
    totalInExternals: api.toBigNumber('0'),
    totalOutExternals: api.toBigNumber('0'),

    // Totals for Contract accounts
    totalInContracts: api.toBigNumber('0'),
    totalOutContracts: api.toBigNumber('0'),

    // Total contracts created
    contractsCreated: []

{ ENDBLOCK: 2971556,
  STARTBLOCK: 2971555,
  '--net': 'rinkeby',
  hasConsole: true }
Summary Report of Block Range [2971555, 2971556]

0x2d23f4430be60a26299d0d41649b85526388a638                                   0 in                    58052400000000000 out      Externally Owned account
0xfc4d7ad6ae2c4472de4440109c0df124b063df72                   58052400000000000 in                                    0 out      Contract account
0x33431a099650116f6b3ec06c5744cef033207d91                                   0 in                                    1 out      Externally Owned account
0x96d001e64ad65a5bd9c660801e4d2d14d2bf5155                                   1 in                                    0 out      Contract account
All values in Wei
Total ETH Transferred: 58052400000000001
Total ETH sent by Externally Owned Accounts: 58052400000000001
Total ETH sent by Contract Accounts: 0
Total ETH received by Externally Owned Accounts: 0
Total ETH received by Contract Accounts: 58052400000000001
PCT Sent by Contract Accounts: 0.00
PCT Sent by Externally Owned Accounts: 100.00
PCT Received by Contract Accounts: 100.00
PCT Received by Externally Owned Accounts: 0.00
Total Contracts created: 0
Done in  0.767  secs
*/
