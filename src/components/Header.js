import React from "react";
import dappPng from "../logo.png";

export default ({ state: { accounts } }) => {

  let accString = `acc: ${accounts[0] || ""}`;
  if (window.innerWidth < 800) {
    accString = accString.substr(0, 7) + "..." + accString.substr(accString.length - 3, 3);
  }
  return(
    <header>
      <img src={dappPng} alt=" dapp farm logo"></img>
      <h1 >Dapp Farmer</h1>
      <p id="account">{accString}</p>
    </header>
  )
}