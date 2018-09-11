// const Actor = artifacts.require('ExploreTest')
const { blockQuery } = require('../../src/explorer')

contract('Thats just deployed', ([acc1, acc2, acc3, ...rest]) => {
  // let actor
  const args = {
    FROMCURRENTBLOCK: 1000,
    '--net': 'testing'
  }

  it('should find the number of contracts created', async () => {
    const db = await blockQuery(args)
    const expectedContracts = 2
    assert.equal(db.contractsCreated.length, expectedContracts)
  })
})
