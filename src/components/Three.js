import React from "react";

export default () => {
  return(
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      version="1.1"
      className="three"
    >
      <ellipse
        style={{fill:"none",fillOpacity:1,fillRule:"evenodd",stroke:"rgb(180,180,180)",strokeWidth:5}}
        cx="50"
        cy="50"
        rx="45"
        ry="45" 
      />
      <path
        style={{fill:"none",stroke:"rgb(180,180,180)",strokeWidth:8,strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1}}
        d="m 33.762217,33.680081 c 1.404807,-8.040576 6.972792,-11.626473 14.942037,-11.779316 6.747927,0.241153 21.038217,-1.570114 21.490858,14.125358 -0.725991,15.540178 -12.707421,16.165577 -23.21821,16.847679 10.159654,0.254862 23.006396,-0.08102 22.621206,12.024284 0.03673,13.426488 -10.226481,15.441275 -21.103466,15.749033 -8.86775,0.197579 -16.229576,-3.60353 -17.212369,-12.177094"
      />
    </svg>
  );
}