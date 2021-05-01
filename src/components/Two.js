import React from "react";

export default () => {
  return(
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      version="1.1"
      className="two"
    >
      <g>
        <ellipse
          style={{fill:"none",fillOpacity:1,fillRule:"evenodd",stroke:"rgb(180,180,180)",strokeWidth:5}}
          cx="50"
          cy="50"
          rx="45"
          ry="45" 
        />
        <path
          style={{fill:"none",stroke:"rgb(180,180,180)",strokeWidth:8,strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1}}
          d="M 31.315029,37.589658 C 31.097102,30.134313 40.51278,22.264773 51.233883,22.349668 65.676741,22.232016 69.799747,32.801701 69.504282,36.780454 67.768294,53.495846 48.82365,66.852027 36.368608,76.988064 l 35.745731,0.252538"
        />
      </g>
    </svg>
  );
}