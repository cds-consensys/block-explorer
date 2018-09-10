pragma solidity 0.4.24;


contract ExploreTest {

    // Allow receipt of either
    function() public payable {}

    function sendTo(address _address, uint256 amount) public payable {
        _address.transfer(amount);
    }

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }
}
