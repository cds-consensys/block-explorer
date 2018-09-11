const Actor = artifacts.require('ExploreTest')
const { blockQuery } = require('../../src/explorer')

contract('BxTest', ([acc1, acc2, acc3, ...rest]) => {
  let actor
  const args = {
    FROMCURRENTBLOCK: 1000,
    '--logtrans': false,
    '--net': 'testing'
  }

  before(async () => {
    actor = await Actor.new()
    await actor.send(1000, { from: acc1 })
    const result = await actor.sendTo(acc2, 500)
  })

  it('should find the total funds transferred', async () => {
    const db = await blockQuery(args)
    assert.equal(db.totalTransferred.toNumber(10), 1000)
  })

  it('should find the Contract account', async () => {
    const db = await blockQuery(args)
    assert.isFalse(db.accounts[actor.address].isExternalyOwnedAccount)
  })

  it('should find the Externally owned account', async () => {
    const db = await blockQuery(args)
    assert.isTrue(db.accounts[acc1].isExternalyOwnedAccount)
  })

  it('should find the number of contracts created', async () => {
    const db = await blockQuery(args)

    // Todo Verify this:
    // There should be 2 contracts "created" because of the migrations
    // plus 1 for our actor
    const expectedContracts = 3
    assert.equal(
      db.contractsCreated.length,
      expectedContracts,
      'one contract should be created'
    )
  })
})
