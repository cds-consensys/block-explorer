const ExploreTest = artifacts.require('./ExploreTest.sol')

module.exports = deployer => {
  deployer.deploy(ExploreTest)
}
