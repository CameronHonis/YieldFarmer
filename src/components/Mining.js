import React from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
// import { MotionPathHelper } from "gsap/MotionPathHelper";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import pickaxeImg from "../img/pickaxe2.png";
import block0Img from "../img/block0.png";
import block1Img from "../img/block1.png";
gsap.registerPlugin(MotionPathPlugin, CustomEase);

const animDuration = 3;

const initRefs = {
  pickaxe: React.createRef(),
  block0: React.createRef(),
  block1: React.createRef(),
  shard0: React.createRef(),
  shard1: React.createRef(),
  shard2: React.createRef(),
}

export default ({ txHash, txContext="transaction" }) => {
  let { current: refs } = React.useRef(initRefs);

  React.useEffect(() => {
    CustomEase.create("s0", "M0, 0 C .5,.2 .5,1 1,1");
    CustomEase.create("shardEase", "M 0,0 C 0.34815957,-0.39131802 0.18189854,0.06052142 1.0016949,-1");
    const tl = gsap.timeline({repeat: -1});
    tl.set(refs.pickaxe.current, {left: "calc(50vw + 100px)", top: "calc(50vh - 150px)",
      transform: "matrix(.866, .5, -.5, .866, -64, -64)"}, 0);
    tl.set(refs.block0.current, {opacity: 0, transform: "matrix(1, 0, 0, 1, -64, -64)", 
      left: "calc(50vw - 200px)", top: "calc(50vh - 50px)"}, 0);
    tl.set(refs.block1.current, {opacity: 0, top: "calc(50vh - 50px)"}, 0);
    tl.set(refs.shard0.current, {visibility: "hidden"}, 0);
    tl.set(refs.shard1.current, {visibility: "hidden"}, 0);
    tl.set(refs.shard2.current, {visibility: "hidden"}, 0);
    // pickaxe
    // cock back
    tl.to(refs.pickaxe.current, {left: "calc(50vw + 115px)", top: "calc(50vh - 150px)",
      transform: "matrix(.707, .707, -.707, .707, -64, -64)", duration: .3*animDuration}, .1*animDuration);
    // swing forward
    tl.to(refs.pickaxe.current, {left: "calc(50vw + 75px)", top: "calc(50vh - 130px)",
      transform: "matrix(1, 0, 0, 1, -64, -64)", duration: .06*animDuration, 
      ease: "power1.in"}, .4*animDuration);
    // bounce from impact
    tl.to(refs.pickaxe.current, {left: "calc(50vw + 115px)", top: "calc(50vh - 150px",
      transform: "matrix(.707, .707, -.707, .707, -64, -64)", duration: .135*animDuration,
      ease: "power2.out"}, .465*animDuration);
    // correct back to resting pos
    tl.to(refs.pickaxe.current, {left: "calc(50vw + 100px)", top: "calc(50vh - 150px)",
      transform: "matrix(.866, .5, -.5, .866, -64, -64)", duration: .2*animDuration,
      ease: "power1.out"}, .6*animDuration);

    // block0
    // slide new block to center
    tl.to(refs.block0.current, {opacity: 1, left: "50vw", ease: "power2.out", duration: .2*animDuration}, .2*animDuration);
    // swap block to mined block
    tl.set(refs.block0.current, {opacity: 0}, .46*animDuration);

    // block1
    // swap block from block0
    tl.set(refs.block1.current, {opacity: 1, left: "50vw"}, .46*animDuration);
    // shake right
    tl.to(refs.block1.current, {left: "calc(50vw + 10px)", top: "calc(50vh - 52px)", 
      transform: "matrix(.99, .1, -.1, .99, -64, -64)", duration: .05*animDuration}, .46*animDuration);
    // shake left
    tl.to(refs.block1.current, {left: "calc(50vw - 5px)", top: "calc(50vh - 52px)",
      transform: "matrix(.998, -.03, .03, .998, -64, -64)", duration: .03*animDuration}, .51*animDuration);
    //settle upright
    tl.to(refs.block1.current, {left: "50vw", top: "calc(50vh - 50px)", 
      transform: "matrix(1, 0, 0, 1, -64, -64)", duration: .05*animDuration}, .54*animDuration);
    // slide block to right
    tl.to(refs.block1.current, {left: "calc(50vw + 200px)", opacity: 0, duration: .3*animDuration, ease: "power2.in"},
      .6*animDuration);

    // shard0
    tl.set(refs.shard0.current, {visibility: "visible", left: "calc(50vw + 30px)", top: "calc(50vh - 85px)"}, 
      .46*animDuration);
    const shard0Path = {
      path: "M 0,0 C 69,-98 100,100 100,100",
      align: "self",
      alignOrigin: [.5, .5]
    };
    tl.to(refs.shard0.current, {motionPath: shard0Path, ease: "shardEase", duration: .15*animDuration, 
      background: "rgba(50,50,50,0)"}, .46*animDuration);
    // shard1
    tl.set(refs.shard1.current, {visibility: "visible", left: "calc(50vw + 20px)", top: "calc(50vh - 85px)"},
      .46*animDuration);
    const shard1Path = {
      path: "M 0,0 C -50,-98 -70,100 -70,100",
      align: "self",
      alignOrigin: [.5, .5],
    };
    tl.to(refs.shard1.current, {motionPath: shard1Path, ease: "shardEase", duration: .15*animDuration,
      background: "rgba(50,50,50,0)"}, .46*animDuration);
    // shard2
    tl.set(refs.shard2.current, {visibility: "visible", left: "calc(50vw + 35px)", top: "calc(50vh - 80px)"},
      .46*animDuration);
    const shard2Path = {
      path: "M 0,0 C 23,-114 28,100 28,100",
      align: "self",
      alignOrigin: [.5, .5],
    };
    tl.to(refs.shard2.current, {motionPath: shard2Path, ease: "shardEase", duration: .15*animDuration,
      background: "rgba(50,50,50,0)"}, .46*animDuration);
  }, []);

  return(
    <div id="mining" >
      <div id="miningCard">
        <img src={pickaxeImg} alt="pickaxe" id="pickaxe" ref={refs.pickaxe} />
        <img src={block0Img} alt="block0" id="block0" ref={refs.block0} />
        <img src={block1Img} alt="block1" id="block1" ref={refs.block1} />
        <div id="shard0" className="shard" ref={refs.shard0} />
        <div id="shard1" className="shard" ref={refs.shard1} />
        <div id="shard2" className="shard" ref={refs.shard2} />
        <p id="miningP0">{"Mining " + txContext + "..."}</p>
        <p id="miningP1">{"Transaction hash: " + txHash}</p>
      </div>
    </div>
  );
}