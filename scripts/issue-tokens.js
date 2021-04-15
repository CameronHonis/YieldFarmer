const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(callback) {
  let tokenFarm = await TokenFarm.deployed();
  const receipt = await tokenFarm.issueTokens();
  console.log("tokens issued");
  console.log(receipt);
  callback();
}