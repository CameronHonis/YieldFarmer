import React from "react";
import One from "./One";
import Two from "./Two";
import metamaskImg from "../img/metamask.png";
import kovanGuideImg from "../img/kovanGuide.png";
import blockchainErrorImg from "../img/blockchainError.png";

export default () => {
  return(
    <div id="providerError">
      <img src={blockchainErrorImg} alt="blockchain error" id="blockchainError0" />
      <h2>There was an issue connecting to the blockchain. Follow steps below to continue</h2>
      <div id="pe0">
        <One />
        <h3>Install a wallet</h3>
        <div className="cardHeader" />
        <img src={metamaskImg} alt="metamask icon" id="metamask" />
        <p id="pe0a">Install an ethereum browser wallet. The most popular choice is Metamask available as a free chrome extension.</p>
      </div>
      <div id="pe1">
        <Two />
        <h3>Connect to Kovan Testnet</h3>
        <div className="cardHeader" />
        <img src={kovanGuideImg} alt="kovan steps" id="kovan" />
      </div>
    </div>
  );
}