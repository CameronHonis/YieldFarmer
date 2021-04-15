// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "./DappToken.sol";
import "./DaiToken.sol";

// Protocol for rewarding stakers
contract TokenFarm {
  string public name = "Dapp Token Farm";
  address public owner;
  DappToken public dappToken;
  DaiToken public daiToken;

  mapping(address => uint128) public stakingBalance;
  mapping(address => bool) public hasStaked;
  address[] public stakers;

  constructor(DappToken _dappToken, DaiToken _daiToken) {
    dappToken = _dappToken;
    daiToken = _daiToken;
    owner = msg.sender;
  }

  function stakeTokens(uint128 _amount) public {
    require(_amount > 0, "amount staked cannot be less than or equal to 0");
    // transfer mock dai to this address
    daiToken.transferFrom(msg.sender, address(this), _amount);
    // update staking data
    stakingBalance[msg.sender] += _amount;
    if (!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }
    hasStaked[msg.sender] = true;
  }

  function unstakeTokens(uint128 _amount) public {
    uint128 balance = stakingBalance[msg.sender];
    require(balance >= _amount, "withdrawal amount exceeds staking balance");
    daiToken.transfer(msg.sender, _amount);
    stakingBalance[msg.sender] -= _amount;
  }

  event IssuedTokens (
    uint256 indexed date
  );
  function issueTokens() public {
    require(msg.sender == owner, "cannot issue tokens unless caller is owner of contract");
    for (uint256 i = 0; i < stakers.length; ++i) {
      address recipient = stakers[i];
      uint balance = stakingBalance[recipient];
      if (balance > 0) {
        dappToken.transfer(recipient, balance);
      }
    }
    emit IssuedTokens(block.timestamp);
  }
}