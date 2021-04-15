import chai, { assert } from "chai";
import chaiAP from "chai-as-promised";
import { toWei } from "../src/services/Helpers";

const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

chai.use(chaiAP).should();

contract("TokenFarm", ([ owner, investor0, investor1]) => {
  let daiToken, dappToken, tokenFarm;

  before(async () => {
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);
  })

  describe("Mock DAI deployment", async () => {
    it("deployed with expected name", async () => {
      const name = await daiToken.name();
      chai.assert.equal(name, "Mock DAI Token", "Dai contract has correct name");
    });
  });

  describe("Mock DAPP deployment", async () => {
    it("deployed with expected name", async () => {
      const name = await dappToken.name();
      chai.assert.equal(name, "DApp Token", "Dapp contract has correct name");
    });
  });

  describe("Token Farm deployment", async () => {
    it("deployed with expected name", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, "Dapp Token Farm", "farm contract has correct name");
    });
  });

  describe("Initializing balances", async () => {
    it("initialized balances", async () => {
      await dappToken.transfer(tokenFarm.address, toWei(1000000));
      await daiToken.transfer(investor0, toWei(100));
      await daiToken.transfer(investor1, toWei(100));
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), toWei(1000000), "farm initial dapp balance correct");
      balance = await daiToken.balanceOf(investor0);
      assert.equal(balance.toString(), toWei(100), "investor0 initial dai balance correct");
      balance = await daiToken.balanceOf(investor1);
      assert.equal(balance.toString(), toWei(100), "investor1 initial dai balance correct");
    });
  });

  describe("Token Farm Deposit", async () => {
    it("transfers funds", async () => {
      await daiToken.approve(tokenFarm.address, toWei(100), { from: investor0 });
      await tokenFarm.stakeTokens(toWei(100), { from: investor0 });
      let result = await tokenFarm.stakingBalance(investor0);
      assert.equal(result.toString(), toWei(100), "invertor0 staking funds incremented");
    });
    it("updates staker data", async () => {
      let result = await tokenFarm.stakers(0);
      assert.equal(result.toString(), investor0, "investor0 added to stakers array");
      result = await tokenFarm.hasStaked(investor0);
      assert.equal(result.toString(), "true", "investor0 added to hasStaked mapping");
    });
  });

  describe("Token Farm Yield", async () => {
    it("distributes dapps", async () => {
      await tokenFarm.issueTokens({ from: owner });
      let result = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(result.toString(), toWei(999900), "farm dapp balance decremented");
      result = await dappToken.balanceOf(investor0);
      assert.equal(result.toString(), toWei(100), "investor0 dapp balance incremented");
    });
    it("blocks access to non-authorized users", async () => {
      await tokenFarm.issueTokens({ from: investor0 }).should.be.rejected;
    });
  });

  describe("Token Farm Withdrawal", async () => {
    it("transfers funds", async () => {
      await tokenFarm.unstakeTokens(toWei(100), { from: investor0 });
      let result = await tokenFarm.stakingBalance(investor0);
      assert.equal(result.toString(), toWei(0), "investor0 farm staking balance decremented");
      result = await daiToken.balanceOf(investor0);
      assert.equal(result.toString(), toWei(100), "investor0 dai balance incremented");
    });
    it("updates staker data", async () => {

    });
  });
});