import React from "react";
import dcImg from "../img/noConnection.png";

export default () => {
  return(
    <div id="disconnected">
      <div id="dcMessage">
        <p id="dc0">Uh oh! It looks like our server is unresponsive at the moment</p>
        <img src={dcImg} alt="no connection" id="dc1" />
        <p id="dc2">Please try again later</p>
      </div>
    </div>
  );
}