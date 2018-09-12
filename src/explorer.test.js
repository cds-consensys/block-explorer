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
    const expectedTotalTransferred = '58052400000000000'
    const args = {
      STARTBLOCK: 2971555,
      ENDBLOCK: 2971556,
      '--net': 'rinkeby'
    }

    before(async () => {
      db = await explorer.blockQuery(args)
    })

    it('calculates the total transferred ETH', async () => {
      expect(db.totalTransferred.toString(10)).to.equal(
        expectedTotalTransferred
      )
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
        expect(db.totalOutExternals.toString(10)).to.equal(
          expectedTotalTransferred
        )
        expect(db.pctSentByExternals.toString(10)).to.equal('100.00')
      })
    })

    describe('for Contract Accounts', () => {
      it('calculates the total ETH received', async () => {
        expect(db.totalInContracts.toString(10)).to.equal(
          expectedTotalTransferred
        )
        expect(db.pctReceivedByContracts.toString(10)).to.equal('100.00')
      })

      it('calculates the total ETH sent', async () => {
        expect(db.totalOutContracts.toString(10)).to.equal('0')
        expect(db.pctSentByContracts.toString(10)).to.equal('0.00')
      })
    })
  })
})
