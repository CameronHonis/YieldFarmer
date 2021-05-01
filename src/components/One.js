import React from "react";

export default () => {
  return(
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      version="1.1"
      className="one"
    >
      <g
        id="layer1">
        <ellipse
          style={{fill:"none",fillOpacity:1,fillRule:"evenodd",stroke:"rgb(180,180,180)",strokeWidth:5}}
          cx="50"
          cy="50"
          rx="45"
          ry="45" 
        />
        <path
          style={{fill:"none",stroke:"rgb(180,180,180)",strokeWidth:8,strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1}}
          d="m 32.072343,32.198613 c 7.371298,-1.593261 12.79276,-8.256095 18.561554,-14.015867 l -0.126269,60.609153 -20.960666,0.252538 39.901026,-0.126269"
        />
      </g>
    </svg>
  );
}