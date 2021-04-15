import React from "react";
import Web3 from "web3";
import Header from "./Header";
import "./App.css";
import Main from "./Main";
import daiAbi from "../abis/DaiToken.json";
import dappAbi from "../abis/DappToken.json";
import farmAbi from "../abis/TokenFarm.json";
import Loading from "./Loading";

const App = () => {
  const [state, setState] = React.useState({
    accounts: [],
    daiToken: {},
    dappToken: {},
    tokenFarm: {},
    daiBalance: "0",
    dappBalance: "0",
    ethBalance: "0",
    stakedDai: "0",
    loading: true,
  });
  React.useEffect(() => {
    const initWeb3 = async () => {
      await loadWeb3();
      await loadBlockchainData();
    }; initWeb3();
  }, []);

  const loadBlockchainData = async () => {
    const newState = {...state};
    const web3 = window.web3;
    // account data
    const accounts = await web3.eth.getAccounts();
    newState.accounts = accounts;
    const ethBalance = await web3.eth.getBalance(accounts[0]);
    newState.ethBalance = ethBalance;
    const networkId = await web3.eth.net.getId();
    // dai data
    const daiNetworkAbi = daiAbi.networks[networkId];
    if (daiNetworkAbi) {
      const dai = new web3.eth.Contract(daiAbi.abi, daiNetworkAbi.address);
      newState.daiToken = dai;
      const daiBalance = await dai.methods.balanceOf(accounts[0]).call();
      newState.daiBalance = daiBalance.toString();
    } else {
      window.alert("Dai Token contract not found on current network");
    }
    // dapp data
    const dappNetworkAbi = dappAbi.networks[networkId];
    if (dappNetworkAbi) {
      const dapp = new web3.eth.Contract(dappAbi.abi, dappNetworkAbi.address);
      newState.dappToken = dapp;
      const dappBalance = await dapp.methods.balanceOf(accounts[0]).call();
      newState.dappBalance = dappBalance.toString();
    } else {
      window.alert("Dapp Token contract not found on current network");
    }
    // token farm data
    const farmNetworkAbi = farmAbi.networks[networkId];
    if (farmNetworkAbi) {
      const farm = new web3.eth.Contract(farmAbi.abi, farmNetworkAbi.address);
      newState.tokenFarm = farm;
      const stakingBalance = await farm.methods.stakingBalance(accounts[0]).call();
      newState.stakedDai = stakingBalance.toString();
    } else {
      window.alert("Farm Network Protocol not found on current network");
    }
    // update state
    setTimeout(() => {
      newState.loading = false;
      setState(newState);
    }, 1000);
  }

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  }

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
      <Main state={state} setState={setState} />
    </>
  );
}

export default App;
