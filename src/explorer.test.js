const expect = require('chai').expect
const explorer = require('./explorer.js')

describe('explorer', () => {
  // This test was constructed from a two block range using rinkeby etherscan
  //   The 1st block has no transactions
  //   https://rinkeby.etherscan.io/txs?block=2971555
  //
  //   The 2nd block has only on non-cancelled transaction with value '.0580524' ether,
  //   converted to wei is '58052400000000000'
  //   https://rinkeby.etherscan.io/tx/0xcb7a2a20d6d130b90a7346242e5411d888ccc0a512cae0d6c68a0ed0dc42e3d7
  //
  describe('rinkeby tests verify range [2971555, 2971556]', () => {
    let db
    const expectedTotalTransfer = '58052400000000000'
    const args = {
      STARTBLOCK: 2971555,
      ENDBLOCK: 2971556,
      '--net': 'rinkeby'
    }

    before(async () => {
      db = await explorer.blockQuery(args)
      // console.log('db', JSON.stringify(db, null, 2))
    })

    it('calculates the total transferred ETH', async () => {
      expect(db.totalTransfer.toString(10)).to.equal(expectedTotalTransfer)
    })

    it('counts the number of contracts created', () => {
      expect(db.contractsCreated.length).to.equal(0)
    })

    describe('for Externally Owned Accounts', () => {
      it('calculates the total ETH received', async () => {
        expect(db.external.received.toString(10)).to.equal('0')
        expect(db.external.receivedpct.toString(10)).to.equal('0.00')
      })

      it('calculates the total ETH sent', async () => {
        expect(db.external.sent.toString(10)).to.equal(expectedTotalTransfer)
        expect(db.external.sentpct.toString(10)).to.equal('100.00')
      })
    })

    describe('for Contract Accounts', () => {
      it('calculates the total ETH received', async () => {
        expect(db.internal.received.toString(10)).to.equal(
          expectedTotalTransfer
        )
        expect(db.internal.receivedpct.toString(10)).to.equal('100.00')
      })

      it('calculates the total ETH sent', async () => {
        expect(db.internal.sent.toString(10)).to.equal('0')
        expect(db.internal.sentpct.toString(10)).to.equal('0.00')
      })
    })
  })
})
