import React from "react";
import Web3 from "web3";
import daiPng from "../dai.png";
import ethPng from "../eth-logo.png";
import dappPng from "../logo.png";
import Loading from "./Loading";
import VaultSVG from "./VaultSVG";

export default ({ state, setState }) => {
  const [mainState, setMainState] = React.useState({
    transactInput: "",
    loadingContext: "",
    errorContext: ""
  });

  React.useEffect(() => {
    if (state.tokenFarm && state.tokenFarm.events) {
      state.tokenFarm.events.IssuedTokens({})
        .on("data", event => {
          console.log(event);
          updateRewardsBalance();
        });
    }
  }, [state.tokenFarm]);

  const updateTransactionBalances = async () => {
    const daiBalance = await state.daiToken.methods.balanceOf(state.accounts[0]).call();
    const stakedDai = await state.tokenFarm.methods.stakingBalance(state.accounts[0]).call();
    const ethBalance = await window.web3.eth.getBalance(state.accounts[0]);
    setState({...state, daiBalance, stakedDai, ethBalance });
  }

  const updateRewardsBalance = async () => {
    const dappBalance = await state.dappToken.methods.balanceOf(state.accounts[0]).call();
    setState({...state, dappBalance });
  }

  const validateNumberInput = str => {
    const strArr = str.split("");
    const rtnStrArr = [];
    const accepted = new Set(["1","2","3","4","5","6","7","8","9","0","."]);
    let decimalCount = 0;
    let decimalPlaces = 0;
    for (let i = 0; i < strArr.length; ++i) {
      if (!accepted.has(strArr[i])) continue;
      if (strArr[i] === ".") {
        decimalCount++;
        if (decimalCount > 1) continue;
      }
      if (strArr[i] !== "." && decimalCount) {
        decimalPlaces++;
        if (decimalPlaces > 18) continue;
      }
      rtnStrArr.push(strArr[i]);
    }
    return rtnStrArr.join("").substr(0, 25); 
    //^^ 25 derived from 24 max sigfigs in circulation + 1 (for decimal)
  }

  const toTokenValue = (str, compress=true) => {
    try {
      // compressed is 6 sig-figs
      str = Web3.utils.fromWei(str, "Ether");
      if (!compress) return str;
      const strNum = parseFloat(str);
      if (strNum === 0) return "0";
      const pow10Shift = Math.floor(Math.log10(strNum));
      const mult0 = Math.pow(10, -pow10Shift + 6);
      const mult1 = Math.pow(10, pow10Shift - 6);
      const shiftedRoundedNum = Math.round(strNum * mult0);
      const rtnStr = (shiftedRoundedNum * mult1).toString();
      const eMatch = rtnStr.match("e");
      if (eMatch) { // js converted to scientific notation
        let sciNotCoeff = "", decimal = false;
        for (let i = Math.min(7, eMatch.index) - 1; i >= 0; --i) {
          if (rtnStr[i] === "0" && !decimal) continue;
          if (rtnStr[i] === ".") {
            decimal = true;
            if (!sciNotCoeff.length) continue;
          }
          sciNotCoeff = rtnStr[i] + sciNotCoeff;
        }
        return sciNotCoeff + rtnStr.substr(rtnStr.length - 3, rtnStr.length);
      } else { // conventional decimal layout
        if (rtnStr[6] === ".") {
          return rtnStr.substr(0, 6);
        } else {
          return rtnStr.substr(0, 7);
        }
      }
    } catch(err) {
      return "xx";
    }
  }

  const stakeTokens = amount => {
    setMainState({...mainState, loadingContext: "processing transaction"});
    state.daiToken.methods
    .approve(state.tokenFarm._address, amount)
    .send({ from: state.accounts[0] })
    .on("receipt", () => {
      state.tokenFarm.methods.stakeTokens(amount)
      .send({ from: state.accounts[0] })
      .on("receipt", () => {
        setMainState({...mainState, transactInput: "", loadingContext: ""});
        updateTransactionBalances();
      });
    });
  }

  const unstakeTokens = amount => {
    setMainState({...mainState, loadingContext: "processing transaction"});
    state.tokenFarm.methods
      .unstakeTokens(amount)
      .send({ from: state.accounts[0] })
      .on("receipt", () => {
        setMainState({...mainState, transactInput: "", loadingContext: ""});
        updateTransactionBalances();
      });
  }

  const setError = errorStr => {
    setMainState({...mainState, errorContext: errorStr});
  }

  const depositClick = () => {
    if (mainState.errorContext) return;
    const amount = parseFloat(mainState.transactInput);
    if (isNaN(amount)) {
      setError("Invalid amount");
    } else if (amount === 0) {
      setError("Amount must be greater than 0");
    } else if (amount > parseFloat(Web3.utils.fromWei(state.daiBalance))) {
      setError("Amount exceeds balance");
    } else {
      // valid transaction
      stakeTokens(Web3.utils.toWei(mainState.transactInput, "ether"));
    }
  }

  const withdrawalClick = () => {
    if (mainState.errorContext) return;
    const amount = parseFloat(mainState.transactInput);
    if (isNaN(amount)) {
      setError("Invalid amount");
    } else if (amount === 0) {
      setError("Amount must be greater than 0");
    } else if (amount > parseFloat(Web3.utils.fromWei(state.stakedDai))) {
      setError("Amount exceeds staked balance");
    } else {
      // valid transaction
      unstakeTokens(Web3.utils.toWei(mainState.transactInput, "ether"));
    }
  }

  return(
    <>
    {
      mainState.loadingContext &&
      <Loading context={mainState.loadingContext} x0={0} y0={0} x1={window.innerWidth} y1={window.innerHeight} />
    }
    <section id="main">
      <h2 id="balancesTitle">Balances</h2>
      <div id="balancesLine"></div>
      <div id="balances">
        <>
          <img src={dappPng} alt="dapp logo" id="dappBalIcon" />
          <p id="dappBal">{toTokenValue(state.dappBalance)}</p>
          <div id="dappBalBG" />
        </>
        <>
          <img src={daiPng} alt="dai logo" id="daiBalIcon" />
          <p id="daiBal">{toTokenValue(state.daiBalance)}</p>
          <div id="daiBalBG" />
        </>
        <>
          <img src={ethPng} alt="ethereum logo" id="ethBalIcon" />
          <p id="ethBal">{toTokenValue(state.ethBalance)}</p>
          <div id="ethBalBG" />
        </>
      </div>
      <div id="transaction">
        <div id="transactionFitted">
          <h2 id="transactionTitle">Transact Tokens</h2>
          <input 
            placeholder="Enter Amount"
            onChange={e => {
              setMainState({...mainState, transactInput: validateNumberInput(e.target.value), errorContext: ""})
            }}
            value={mainState.transactInput} >
          </input>
          <div id="currencyDropdown">
            <img src={daiPng} alt="dai logo" />
            <p>DAI</p>
          </div>
          <div id="staked">
            <VaultSVG />
            <p>{toTokenValue(state.stakedDai)}</p>
          </div>
          <div id="transactButtons" >
            <button 
              id="deposit"
              onClick={() => depositClick()}
            >Deposit</button>
            <button
              id="withdrawal"
              onClick={() => withdrawalClick()}
            >Withdrawal</button>
          </div>
          <p id="transactError">{mainState.errorContext}</p>
        </div>
        <div id="claimBar" />
        <p id="claimBarContext">Rewards available in... </p>
      </div>
    </section>
    </>
  );
}