import React from "react";

export default ({ text, originX, originY, width, height, fontSize="20px" }) => {
  const triPoss = [
    [50 - 100*10/width, 100 - 100*11/height],
    [50 + 100*10/width, 100 - 100*11/height],
    [50, 100],
  ];
  return(
    <div className="contextTextbox">
      <svg className="contextTextboxArrow"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{position: "absolute", transform: "translate(-50%, -100%)", left: originX,
        top: originY, width, height}}
      >
        <path
          d={"M " + triPoss[0][0] + "," + triPoss[0][1] + " " + triPoss[1][0] + "," + 
          triPoss[1][1] + " " + triPoss[2][0] + "," + triPoss[2][1] + " Z"}
          style={{fill: "rgb(50,50,50)", stroke: "none"}}
        />
        <rect
          x="0"
          y="0"
          ry={100 * 10/height}
          rx={100 * 10/width}
          width="100"
          height={100 - 100 * 10/height}
          style={{fill: "rgb(50,50,50)", stroke: "none"}}
        />
      </svg>
      <div
        className="contextTextbox"
        style={{position: "absolute", transform: "translate(-50%, calc(-100% - 10px))",
        left: originX, top: originY, width, height: height - 10, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center"}}
      >
        <p className="contextTextboxText"
          style={{left: "90%", color: "white", margin: 0, padding: "5%", fontSize, fontWeight: 600}}
        >{text}</p>
      </div>
    </div>
  );
}