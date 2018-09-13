const Actor = artifacts.require('ExploreTest')
const { blockQuery } = require('../../src/explorer')

contract('TestExplorer blockQuery', ([acc1, acc2, acc3, ...rest]) => {
  let actor
  const args = {
    FROMCURRENTBLOCK: 1000,
    '--logtrans': false,

    // uncomment for `truffle develop testing`
    '--net': 'testing'

    // uncomment for testing agains local ganache
    // '--net': 'local'
  }
  const oneEther = web3.toWei(1, 'ether')

  before(async () => {
    actor = await Actor.new()
    await actor.send(oneEther, { from: acc1 })
  })

  it('should have an initial balance of 1 ether', async () => {
    const balance = (await actor.getBalance()).toNumber(10)
    assert.equal(oneEther, balance)
  })

  xit('should detect transfer funds from contract', async () => {
    await actor.transferTo(acc2, 9999)
    const balance = (await actor.getBalance()).toNumber(10)
    assert.notEqual(oneEther, balance)

    const db = await blockQuery(args)

    // Can transfers from contracts be detected?
    assert.isFalse(db.totalOutContracts.isZero())
  })
})
