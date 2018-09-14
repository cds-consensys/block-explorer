const Actor = artifacts.require('ExploreTest')
const { blockQuery } = require('../../src/explorer')

const { promisify } = require('util')
const getBalance = promisify(web3.eth.getBalance.bind(web3.eth))

contract('TestExplorer blockQuery', ([acc1, acc2, acc3, ...rest]) => {
  let contract
  const args = {
    FROMCURRENTBLOCK: 1000,
    // uncomment to 'attach console'
    // hasConsole: true,

    // uncomment to enable transaction logging
    // '--logtrans': true,

    // uncomment for `truffle develop testing`
    '--net': 'testing'

    // uncomment for testing agains local ganache
    // '--net': 'local'
  }
  const oneEther = web3.toWei(1, 'ether')
  const twoEther = web3.toWei(2, 'ether')

  before(async () => {
    contract = await Actor.new()
    await contract.send(twoEther, { from: acc1 })
  })

  it('contract should have an initial balance of 2 ether', async () => {
    const balance = (await contract.getBalance()).toNumber(10)
    assert.equal(twoEther, balance)
  })

  xit('should detect transfer funds from contract', async () => {
    const balance = (await contract.getBalance()).toNumber(10)
    assert.equal(twoEther, balance)

    await contract.transferTo(acc2, oneEther)
    const expectedBalanceAcc2 = web3.toWei('101', 'ether')
    const balanceAcc2 = (await getBalance(acc2)).toNumber(10)
    assert.equal(expectedBalanceAcc2, balanceAcc2)

    const db = await blockQuery(args)

    // Can transfers from contracts be detected?
    assert.isFalse(db.internal.sent.isZero())
  })
})
