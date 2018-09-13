const Actor = artifacts.require('ExploreTest')
const { blockQuery } = require('../../src/explorer')
contract('ExploreTest', ([acc1, acc2, acc3, ...rest]) => {
  const args = {
    FROMCURRENTBLOCK: 1000,
    '--logtrans': false,
    '--net': 'testing'
  }

  it('should get a database object from explorer', async () => {
    const db = await blockQuery(args)
    assert.isTrue('totalTransfer' in db)
  })
})
