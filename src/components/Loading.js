import React from "react";

const speed = 3;
const rotateResizeRatio = 2;

export default ({ context, x0, y0, x1, y1 }) => {
  const spinnerRef = React.useRef();
  const contextRef = React.useRef();
  let { current: t } = React.useRef(0);

  React.useEffect(() => {
    const spinnerFrame = (t0, t1) => {
      const dt = (t1 - t0)/1000;
      t += dt;
      if (spinnerRef.current) {
        const baseAngle = speed*rotateResizeRatio*t;
        const frontAngle = baseAngle + 1 - Math.sin(speed*(t - .1));
        const backAngle = baseAngle + Math.sin(speed*t) - 1.2;
        const [ x0, y0 ] = polarToCartesian(frontAngle);
        const [ x1, y1 ] = polarToCartesian(backAngle);
        const largeArcFlag = (frontAngle - backAngle + Math.PI*2) % (Math.PI*2) > Math.PI ? "1" : "0";
        const d = ["M", x0, y0, "A 40 40 0", largeArcFlag, "0", x1, y1];
        spinnerRef.current.setAttribute("d", d.join(" "));
      }
      if (contextRef.current && context) {
        if (t % 4 < 1) {
          contextRef.current.textContent = context + "      ";
        } else if (speed*t % 4 < 2) {
          contextRef.current.textContent = context + " .    ";
          contextRef.current.style.paddingLeft = "1px";
        } else if (speed*t % 4 < 3) {
          contextRef.current.textContent = context + " . .  ";
        } else {
          contextRef.current.textContent = context + " . . .";
        }
      }
      requestAnimationFrame(t2 => spinnerFrame(t1, t2));
    }
    requestAnimationFrame(t0 => spinnerFrame(t0, t0));
  },[]);

  const polarToCartesian = angle => {
    return [
      50 + 40*Math.cos(angle),
      50 + 40*Math.sin(angle)
    ];
  }
  return(
    <div 
      id="loading"
      style={{left: x0, top: y0, width: x1 - x0, height: y1 - y0}}
    >
      <svg
        viewBox="0 0 100 100"
        width="100"
        height="100"
      >
        <path d="M 90 50 A 40 40 0 1 0 10 50" fill="none" stroke="rgb(50, 50, 50)" strokeWidth="10" ref={spinnerRef} />
      </svg>
      <p ref={contextRef}>{context}</p>
    </div>
  );
}