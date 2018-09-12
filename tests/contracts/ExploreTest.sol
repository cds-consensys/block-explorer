pragma solidity 0.4.24;


contract ExploreTest {

    event LogPaid(address recipient, uint256 amount);

    // Allow receipt of either
    function() public payable {}

    function transferTo(address recipient, uint256 amount) public payable {
        recipient.transfer(amount);
        emit LogPaid(recipient, amount);
    }

    function blockedTransferTo(address recipient, uint256 amount) public payable {
        require(false);
        recipient.transfer(amount);
    }

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }
}
