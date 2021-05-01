import React from "react";
import { fromWei, interpolate } from "../services/Helpers";
import dappPng from "../img/dapp1.png";

const dappCount = 8;
const animMaxDuration = 2;
const segment0RelTime = .5;

const initRefs = {
  dapps: [],
  loops: 0,
}
export default ({ state, mainState, disperseDapp, hitDapp }) => {
  let { current: refs } = React.useRef(initRefs);

  React.useEffect(() => {
    const animateDapps = () => {
      refs.loops++;
      if (refs.loops === 1) return;
      // initialize animation
      let dappsInits = [];
      let startTime = performance.now();
      for (let i = 0; i < refs.dapps.length; ++i) {
        const dpRadius = 250*Math.sqrt(Math.random())*Math.random();
        const dpAngle = 2*Math.PI*Math.random();
        dappsInits[i] = {
          rotation: Math.PI/4*Math.random() - Math.PI/8,
          targetPosX: window.innerWidth*.5 + dpRadius*Math.cos(dpAngle),
          targetPosY: 760 + dpRadius*Math.sin(dpAngle),
          targetSizeX: 40 + 40*Math.random(),
          duration: (.75 + .25*Math.random())*animMaxDuration*1000,
        };
        const dappRef = refs.dapps[i];
        dappRef.current.style.visibility = "visible";
      }
      // play animation
      let isFirstDappHit = true;
      const animClock = () => {
        for (let i = 0; i < refs.dapps.length; ++i) {
          const dappRef = refs.dapps[i];
          const animT = (performance.now() - startTime) / dappsInits[i].duration;
          // console.log(animT);
          if (animT <= segment0RelTime) {
            const funcX = animT/segment0RelTime;
            const prog = Math.pow(funcX, .4);
            dappRef.current.style.left = interpolate(window.innerWidth*.5, dappsInits[i].targetPosX, prog) + "px";
            dappRef.current.style.top = interpolate(760, dappsInits[i].targetPosY, prog) + "px";
            const width = interpolate(10, dappsInits[i].targetSizeX, prog);
            dappRef.current.style.width = width + "px";
            const rot = dappsInits[i].rotation;
            dappRef.current.style.transform = "matrix(" + Math.cos(rot) + "," + Math.sin(rot) + "," + (-Math.sin(rot)) + ","
              + Math.cos(rot) + "," + (-width*.5) + "," + (-width*.5) + ")";
          } else if (animT <= 1) {
            const funcX = (animT - segment0RelTime)/(1 - segment0RelTime);
            const prog = funcX*(2*funcX*funcX - funcX);
            dappRef.current.style.left = interpolate(dappsInits[i].targetPosX, window.innerWidth*.5 + 220, prog) + "px";
            dappRef.current.style.top = interpolate(dappsInits[i].targetPosY, 270, prog) + "px";
          } else { // anim end
            dappRef.current.style.visibility = "hidden";
            hitDapp();
            if (isFirstDappHit) {
              isFirstDappHit = false;
              const dappEstBal = parseFloat(fromWei(state.dappEstimatedBalance));
              disperseDapp(dappEstBal, .25*animMaxDuration*1000);
            }
          }
        }
        if (performance.now() < startTime + 1000*animMaxDuration) {
          window.requestAnimationFrame(() => animClock());
        } else {
          for (const dappRef of refs.dapps) {
            dappRef.current.style.visibility = "hidden";
          }
        }
      }
      animClock();
    }
    if (state.dappEstimatedBalance > refs.lastEstimatedBalance) animateDapps();
    refs.lastEstimatedBalance = state.dappEstimatedBalance;
  }, [state]);

  const dapps = [];
  for (let i = 0; i < dappCount; ++i) {
    if (refs.dapps.length < i + 1) {
      refs.dapps.push(React.createRef());
    }
    dapps.push(<img key={i} src={dappPng} alt="dapp" ref={refs.dapps[i]} className="dappReward" />);
  }
  return (
    <div id="dapps">
      {dapps}
    </div>
  );

}