import React from "react";
import gsap from "gsap";
import axios from "axios";
import Web3 from "web3";
// import daiInterface from "../abis/DaiToken.json";
// import dappInterface from "../abis/DappToken.json";
// import farmInterface from "../abis/TokenFarm.json";
import daiPng from "../img/dai.png";
import ethPng from "../img/eth-logo.png";
import dappPng from "../img/dapp1.png";
import Loading from "./Loading";
import VaultSVG from "./VaultSVG";
import Disconnected from "./Disconnected";
import ContextTextbox from "./ContextTextbox";
import { fromWei, interpolate, sleep } from "../services/Helpers";
import Dapps from "./Dapps";
import Mining from "./Mining";

const backURL = "http://ec2-34-207-252-132.compute-1.amazonaws.com:4000/";

const initState = {
  transactInput: "",
  loadingContext: "",
  errorContext: "",
  disconnected: false,
  stakedMouseOver: false,
  daiMouseOver: false,
  ethMouseOver: false,
  dappMouseOver: false,
  dappBalanceAnimPlaying: false,
  mining: {
    txHash: "",
    txContext: "",
  },
}

const initRefs = {
  renders: 0,
  setTokenFarmListener: false,
  dappImg: React.createRef(),
  dappBG: React.createRef(),
  dappBal: React.createRef(),
  rewardBar: React.createRef(),
  rewardText: React.createRef(),
  hitDappAnimPlaying: false,
}

export default ({ state, setState }) => {
  const [mainState, setMainState] = React.useState(initState);
  let { current: refs } = React.useRef(initRefs);

  React.useEffect(() => {
    if (refs.renders !== 1) return; // exclusive to initial render

    let textLoopId = 0;
    const textLoop = async (timeLeft, totalTime, loopId) => {
      if (textLoopId !== loopId) return;
      if (timeLeft === 0) {
        timeLeft = totalTime;
        setState(state => {
          // simulate tokenFarm contract yield
          const currDapp = parseFloat(Web3.utils.fromWei(state.dappBalance));
          const stakedDai = parseFloat(Web3.utils.fromWei(state.stakedDai));
          const newDapp = currDapp + stakedDai;
          const newState = {
            ...state,
            dappEstimatedBalance: Web3.utils.toWei(newDapp.toFixed(18)),
          };
          return newState;
        });
      }
      refs.rewardText.current.textContent = "Staking rewards available in " + timeLeft;
      await sleep(1000);
      textLoop(timeLeft - 1, totalTime, loopId);
    }

    const setRewardsProgress = async () => {
      textLoopId++;
      try {
        const res = await axios.get(backURL);
        setMainState(mainState => ({...mainState, disconnected: false}));
        if (!refs.rewardBar.current && !refs.rewardText.current) return;
        refs.rewardBar.current.style.width = 600*res.data[0]/res.data[1] + "px";
        refs.rewardText.current.textContent = "Staking rewards available in " + Math.floor(res.data[1] - res.data[0]);
        const barTL = gsap.timeline({repeat: -1});
        barTL.to(refs.rewardBar.current, { width: "0px", duration: .5 });
        barTL.to(refs.rewardBar.current, { width: "610px", duration: res.data[1] - .5, ease: "none" });
        barTL.time(res.data[0]);
        textLoop(Math.floor(res.data[1] - res.data[0]), res.data[1], textLoopId);
      } catch(err) {
        setMainState(mainState => ({...mainState, disconnected: true}));
      }
    }

    const initServerSync = async () => {
      try {
        const res = await axios.get(backURL);
        while (true) { // server sync loop
          setRewardsProgress();
          await sleep(1000*res.data[1]);
        }
      } catch(err) {
        setMainState(mainState => ({...mainState, disconnected: true}));
        await sleep(5000);
        initServerSync();
      }

    }
    initServerSync();
  }, [mainState, state]);

  React.useEffect(() => { // state.tokenFarm
    if (refs.renders !== 1) return; // exclusive to initial render
    if (state.tokenFarm && state.tokenFarm.events) {
      state.tokenFarm.events.IssuedTokens({})
      .on("data", event => {
        updateRewardsBalance();
      });
    }
  }, [state.tokenFarm]);

  React.useEffect(() => { // state.dappBalance
    if (!refs.dappImg.current) return;
    if (!refs.dappBG.current) return;
    if (!refs.dappBal.current) return;
    const dappBal = parseFloat(fromWei(state.dappBalance));
    disperseDapp(dappBal, 0);
    setState(state => {
      if (state.dappEstimatedBalance > state.dappBalance) {
        return {...state, dappEstimatedBalance: state.dappBalance};
      } else return state;
    });
    refs.lastDappBalance = state.dappBalance;
  }, [state.dappBalance]);

  React.useEffect(() => {
    const dappBal = parseFloat(fromWei(state.dappBalance));
    disperseDapp(dappBal, 0);
  }, [state.dappBalanceAnimPlaying]);

  const disperseDapp = (newBalance, disperseTime) => {
    newBalance = parseFloat(newBalance);
    if (mainState.dappRewardAnimPlaying) return;
    setMainState({...mainState, dappRewardAnimPlaying: true});
    const startBalance = parseFloat(fromWei(state.dappBalance));
    const startTime = performance.now();
    const disperseDappClock = () => {
      const funcX = (performance.now() - startTime) / disperseTime;
      const prog = Math.min(1, funcX);
      const currBalance = interpolate(startBalance, newBalance, prog);
      refs.dappBal.current.textContent = toTokenValue(Web3.utils.toWei(currBalance.toFixed(18)));
      if (funcX < 1) {
        window.requestAnimationFrame(() => disperseDappClock());
      } else {
        finalSetBalance();
      }
    }
    const finalSetBalance = () => {
      refs.dappBal.current.textContent = toTokenValue(Web3.utils.toWei(newBalance.toFixed(18)));
      setMainState({...mainState, dappRewardAnimPlaying: false});
    }
    if (disperseTime > 0) {
      disperseDappClock();
    } else {
      finalSetBalance();
    }
  }

  const hitDapp = () => {
    if (refs.renders === 1) return;
    if (refs.hitDappAnimPlaying) return;
    refs.hitDappAnimPlaying = true;
    gsap.to(refs.dappImg.current, {width: "130px", height: "130px", duration: .1});
    gsap.to(refs.dappBG.current, {width: "145px", height: "145px", duration: .1});
    gsap.to(refs.dappBal.current, {fontSize: "30px", top: "335px", duration: .1});
    setTimeout(() => {
      gsap.to(refs.dappImg.current, {width: "110px", height: "110px", duration: .1});
      gsap.to(refs.dappBG.current, {width: "125px", height: "125px", duration: .1});
      gsap.to(refs.dappBal.current, {fontSize: "25px", top: "325px", duration: .1});
      refs.hitDappAnimPlaying = false;
    }, 100);
  }

  const updateTransactionBalances = async () => {
    const daiBalance = await state.daiToken.methods.balanceOf(state.accounts[0]).call();
    const stakedDai = await state.tokenFarm.methods.stakingBalance(state.accounts[0]).call();
    const ethBalance = await state.web3.eth.getBalance(state.accounts[0]);
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

  const toTokenValue = (str, compress=true) => { // 6 sigfigs or precision up to 1 Gwei
    str = str.toString();
    const firstSigFig = str.match(/[1-9]/);
    if (!firstSigFig || str.length - 9 <= firstSigFig.index) return "0";
    const decShifts = Math.max(0, 18 - str.length);
    str = "0".repeat(decShifts) + str;
    const onesIndex = str.length - 19;
    str = str.substring(0, Math.min(9, Math.max(6, onesIndex + 1) + Math.max(0, decShifts - 5)));
    return str.substring(0, onesIndex + 1) + "." + str.substring(onesIndex + 1);
  }

  const stakeTokens = amount => {
    setMainState({...mainState, loadingContext: "processing transaction"});
    state.daiToken.methods
    .approve(state.tokenFarm._address, amount)
    .send({ from: state.accounts[0] })
    .on("transactionHash", () => {
      state.tokenFarm.methods.stakeTokens(amount)
      .send({ from: state.accounts[0] })
      .on("transactionHash", txHash => {
        setMainState(mainState => ({
          ...mainState, 
          loadingContext: "", 
          mining: {
            txHash,
            txContext: "Deposit",
          }
        }));
      })
      .on("receipt", txReceipt => {
        setMainState(mainState => ({...mainState, transactInput: "", mining: {txHash: "", txContext: ""}}));
        updateTransactionBalances();
      })
      .on("error", err => {
        setMainState(mainState => ({...mainState, transactInput: "", loadingContext: ""}));
      });
    })
    .on("error", err => {
      setMainState(mainState => ({...mainState, transactInput: "", loadingContext: ""}));
    });
  }

  const unstakeTokens = amount => {
    setMainState({...mainState, loadingContext: "processing transaction"});
    state.tokenFarm.methods
    .unstakeTokens(amount)
    .send({ from: state.accounts[0] })
    .on("transactionHash", txHash => {
      setMainState(mainState => ({
        ...mainState,
        loadingContext: "",
        mining: {
          txHash,
          txContext: "Withdrawal",
        }
      }));
    })
    .on("receipt", txReceipt => {
      setMainState(mainState => ({...mainState, transactInput: "", mining: {txHash: "", txContext: ""}}));
      updateTransactionBalances();
    })
    .on("error", err => {
      setMainState(mainState => ({...mainState, transactInput: "", loadingContext: ""}));
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

  refs.renders++;
  return(
    <>
    {
      mainState.loadingContext &&
      <Loading context={mainState.loadingContext} x0={0} y0={0} x1={window.innerWidth} y1={window.innerHeight} />
    }
    {
      mainState.disconnected &&
      <Disconnected />
    }
    {
      mainState.mining.txHash &&
      <Mining txHash={mainState.mining.txHash} txContext={mainState.mining.txContext} />
    }
    <section id="main">
      <h2 id="balancesTitle">Balances</h2>
      <div id="balancesLine"></div>
      <div id="balances">
        <>
          <img src={dappPng} className="tokenIcon" alt="dapp logo" id="dappBalIcon" ref={refs.dappImg} />
          <p id="dappBal" className="balanceValue" ref={refs.dappBal}></p>
          <div 
            id="dappBalBG" 
            className="tokenIconBG"
            ref={refs.dappBG} 
            onMouseOver={e => setMainState({...mainState, dappMouseOver: true})}
            onMouseLeave={e => setMainState({...mainState, dappMouseOver: false})}
          >
            { mainState.dappMouseOver
              && <ContextTextbox text="Dapp Balance" originX="50%" originY="0%" width={150} height={50} /> }
          </div>
        </>
        <>
          <img src={daiPng} alt="dai logo" id="daiBalIcon" className="tokenIcon" />
          <p id="daiBal" className="balanceValue">{toTokenValue(state.daiBalance)}</p>
          <div 
            id="daiBalBG" 
            className="tokenIconBG"
            onMouseOver={e => setMainState({...mainState, daiMouseOver: true})}
            onMouseLeave={e => setMainState({...mainState, daiMouseOver: false})}
          >
            { mainState.daiMouseOver
              && <ContextTextbox text="Dai Balance" originX="50%" originY="0%" width={130} height={50} /> }
          </div>
        </>
        <>
          <img src={ethPng} alt="ethereum logo" id="ethBalIcon" className="tokenIcon" />
          <p id="ethBal" className="balanceValue">{toTokenValue(state.ethBalance)}</p>
          <div 
            id="ethBalBG" 
            className="tokenIconBG"
            onMouseOver={e => setMainState({...mainState, ethMouseOver: true})}
            onMouseLeave={e => setMainState({...mainState, ethMouseOver: false})}
          >
            { mainState.ethMouseOver
              && <ContextTextbox text="Ether Balance" originX="50%" originY="0%" width={150} height={50} /> }
          </div>
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
          <div 
            id="staked"
            onMouseOver={e => setMainState({...mainState, stakedMouseOver: true})}
            onMouseLeave={e => setMainState({...mainState, stakedMouseOver: false})}
          >
            <VaultSVG />
            <p>{toTokenValue(state.stakedDai)}</p>
            { mainState.stakedMouseOver
            && <ContextTextbox text="staked" originX="50%" originY="0" width={90} height={50} /> }
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
        <div id="rewardBar" ref={refs.rewardBar} />
        <p id="rewardBarContext" ref={refs.rewardText}>Rewards available in... </p>
      </div>
      <Dapps state={state} mainState={mainState} setMainState={setMainState} 
        disperseDapp={disperseDapp} hitDapp={hitDapp} />
    </section>
    </>
  );
}