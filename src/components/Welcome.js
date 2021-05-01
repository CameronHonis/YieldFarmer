import React from "react";
import processImg from "../img/process.png";

export default ({ setState }) => {

  return(
    <div id="welcomeBG">
      <div id="welcomeHeader" />
      <div id="welcomeBody" />
      <div id="welcome">
        <h2>Welcome to Dapp Farmer</h2>
        <div>
          <p id="w0">Our farmers sent you some DAI and some ETH in case you didn't have any</p>
          <p id="w1">All they ask in return is that you test out their equipment and deposit your DAI to start earning DAPP right away</p>
        </div>
        <img src={processImg} alt="process" />
        <p id="w2">You can deposit and withdrawal anytime, free of charge</p> 
        <button 
          id="w3"
          onClick={() => setState(state => ({...state, welcomeScreen: false}))}
        >Start farming!</button>
      </div>
    </div>
  );
}