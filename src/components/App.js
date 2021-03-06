import React from "react";
import Web3 from "web3";
import Header from "./Header";
import "./App.css";
import Main from "./Main";
import daiAbi from "../abis/DaiToken.json";
import dappAbi from "../abis/DappToken.json";
import farmAbi from "../abis/TokenFarm.json";
import Loading from "./Loading";
import ProviderError from "./ProviderError";
import axios from "axios";
import Welcome from "./Welcome";
import Mining from "./Mining";
import { sleep } from "../services/Helpers";

const backURL = "https://dappfarmer.com";

const initState = {
  web3: null,
  accounts: [],
  netId: -1,
  visits: -1,
  daiToken: {},
  dappToken: {},
  tokenFarm: {},
  daiBalance: "0",
  dappBalance: "0",
  dappEstimatedBalance: "0",
  ethBalance: "0",
  stakedDai: "0",
  loading: true,
  providerError: false,
  blockchainError: false,
  welcomeScreen: false,
  welcomePackageHash: "",
};

const App = () => {
  const [state, setState] = React.useState(initState);
  const { current: refs } = React.useRef({
    lastState: initState,
    renders: 0,
  });

  React.useEffect(() => {
    if (refs.renders === 1) initBlockchain();
  }, [state]);

  const initBlockchain = async () => {
    const loadProvider = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setState(state => ({...state, web3: new Web3(window.ethereum), accounts, providerError: false}));
        } else {
          throw new Error();
        }
      } catch(err) {
        setState(state => ({...state, web3: null, providerError: true}));
        await sleep(2000);
        await loadProvider();
      }        
    }
    // init web3
    await loadProvider();
    // init listeners
    window.ethereum.on("accountsChanged", accounts => {
      setState(state => ({...state, accounts}));
    });
    window.ethereum.on("chainChanged", () => {
      if (refs.lastState.web3) {
        state.web3.eth.net.getId().then(netId => setState(state => ({...state, netId})));
      }
    });
  }

  React.useEffect(() => {
    if (refs.renders === 1) initBlockchain();
  }, [state]);

  React.useEffect(() => {
    if (JSON.stringify(state.accounts) === JSON.stringify(refs.lastState.accounts)) return;
    const getVisits = async () => {
      try {
        const res = (await axios.get(backURL + "visit/" + state.accounts[0])).data;
        if (res.visits === 1) {
          setState(state => ({...state, visits: res.visits, welcomeScreen: true, welcomePackageHash: res.daiHash}));
        } else {
          setState(state => ({...state, visits: res.visits}));
        }
      } catch(err) {}
    }
    getVisits();
  }, [state.accounts]);

  React.useEffect(() => {
    console.log("web3");
    const pollUserData = async () => {
      console.log("polling network data");
      const netId = await state.web3.eth.net.getId();
      const accounts = await state.web3.eth.getAccounts();
      console.log(netId, accounts);
      if (accounts[0]) {
        console.log("account changed");
        const ethBalance = await state.web3.eth.getBalance(accounts[0]);
        console.log(ethBalance);
        setState(state => ({...state, netId, accounts, ethBalance}));
      }
      await sleep(1000);
      pollUserData();
    }
    if (state.web3 && state.web3 !== refs.lastState.web3) pollUserData();
  }, [state.web3]);

  React.useEffect(() => {
    console.log("netId");
    if (state.netId === refs.lastState.netId) return;
    console.log("netId changed");
    // contracts
    if (state.netId in daiAbi.networks && state.netId in dappAbi.networks && state.netId in farmAbi.networks) {
      console.log("setting tokens");
      const daiToken = new state.web3.eth.Contract(daiAbi.abi, daiAbi.networks[state.netId].address);
      const dappToken = new state.web3.eth.Contract(dappAbi.abi, dappAbi.networks[state.netId].address);
      const tokenFarm = new state.web3.eth.Contract(farmAbi.abi, farmAbi.networks[state.netId].address);
      setState(state => ({...state, daiToken, dappToken, tokenFarm}));
    } else {
      // blockchain error
      setState(state => ({...state, blockchainError: true}));
    }
  }, [state.netId]);

  React.useEffect(() => {
    console.log("init web3");
    console.log(
      "methods" in state.daiToken, 
      "methods" in state.dappToken, 
      "methods" in state.tokenFarm,
      state.daiToken === refs.lastState.daiToken, 
      state.dappToken === refs.lastState.dappToken,
      state.tokenFarm === refs.lastState.tokenFarm, 
      JSON.stringify(state.accounts) === JSON.stringify(refs.lastState.accounts)
    );
    if (!("methods" in state.daiToken)
    || !("methods" in state.dappToken)
    || !("methods" in state.tokenFarm)
    || (state.daiToken === refs.lastState.daiToken 
    && state.dappToken === refs.lastState.dappToken
    && state.tokenFarm === refs.lastState.tokenFarm 
    && JSON.stringify(state.accounts) === JSON.stringify(refs.lastState.accounts))) return;
    const updateContractsData = async () => {
      console.log("a1");
      setState(state => ({...state, loading: true}));
      const daiBalance = (await state.daiToken.methods.balanceOf(state.accounts[0]).call()).toString();
      console.log("a2");
      const dappBalance = (await state.dappToken.methods.balanceOf(state.accounts[0]).call()).toString();
      console.log("a3");
      const stakedDai = (await state.tokenFarm.methods.stakingBalance(state.accounts[0]).call()).toString();
      console.log("a4");
      setState(state => ({...state, daiBalance, dappBalance, stakedDai, loading: false}));
    }
    updateContractsData();
  }, [state.accounts, state.daiToken, state.dappToken, state.tokenFarm]);

  React.useEffect(() => {
    console.log("accounts");
  },[state.accounts]);

  React.useEffect(() => {
    console.log("daiToken");
  }, [state.daiToken]);

  React.useEffect(() => {
    console.log("dappToken");
  }, [state.dappToken]);

  React.useEffect(() => {
    console.log("tokenFarm");
  }, [state.tokenFarm]);

  React.useEffect(() => {
    if (!state.dappToken || state.dappToken === refs.lastState.dappToken) return;
    // add dappToken listener
    console.log("dappListener");
    const updateDapp = async () => {
      console.log("updateDapp");
      const dappBalance = (await state.dappToken.methods.balanceOf(state.accounts[0]).call()).toString();
      console.log("c2");
      setState(state => ({...state, dappBalance }));
    }
    state.dappToken.events.Transfer({filter: {_to: state.accounts[0]}}).on("data", updateDapp);
    state.dappToken.events.Transfer({filter: {_from: state.accounts[0]}}).on("data", updateDapp);
  }, [state.dappToken]);

  React.useEffect(() => {
    if (!state.daiToken || state.daiToken === refs.lastState.daiToken) return;
    // add daiToken listener
    console.log("daiListener");
    const updateDai = async data => {
      console.log("updateDai");
      console.log(state.welcomePackageHash);
      if (refs.lastState.welcomePackageHash === data.transactionHash) {
        setState(state => ({...state, welcomePackageHash: ""}));
      }
      console.log("b");
      const daiBalance = (await state.daiToken.methods.balanceOf(state.accounts[0]).call()).toString();
      console.log("b2");
      setState(state => ({...state, daiBalance }));
    }
    state.daiToken.events.Transfer({filter: {_to: state.accounts[0]}}).on("data", updateDai);
    state.daiToken.events.Transfer({filter: {_from: state.accounts[0]}}).on("data", updateDai);
  }, [state.daiToken, state.welcomePackageHash]);

  React.useEffect(() => {
    console.log("set lastState");
    refs.lastState = state;
  }, [state]);

  refs.renders++;
  return (
    <>
      <Header state={state} setState={setState}/>
      {
        state.loading && 
        <Loading 
          context={"Retrieving web3 data"} x0={0} y0={80} 
          x1={window.innerWidth} y1={window.innerHeight} 
        />
      }
      {
        (state.providerErrror || state.blockchainError) &&
        <ProviderError />
      }
      {
        state.welcomeScreen &&
        <Welcome setState={setState} />
      }
      {
        state.welcomePackageHash &&
        <Mining txHash={state.welcomePackageHash} txContext={"Welcome Package"} />
      }
      <Main state={state} setState={setState} />
    </>
  );
}

export default App;
//sg-53828150