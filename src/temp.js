const toTokenValue = (str, compress=true) => { // 6 sigfigs or precision up to 1 Gwei
  str = str.toString();
  const firstSigFig = str.match(/[1-9]/);
  if (!firstSigFig || str.length - 9 <= firstSigFig.index) return "0";
  const decShifts = Math.max(0, 18 - str.length);
  str = "0".repeat(decShifts) + str;
  const onesIndex = str.length - 19;
  str = str.substring(0, Math.min(9, Math.max(6, onesIndex + 1) + Math.max(0, decShifts - 5)));
  return str.substring(0, onesIndex + 1) + "." + str.substring(onesIndex + 1);
}

const pow10 = (pow) => {
  if (pow < 0) {
    return "." + "0".repeat(-pow - 1) + "1";
  } else {
    return "1" + "0".repeat(pow);
  }
}

const fromWei = (str) => {
  if (str.length < 18) str = "0".repeat(18 - str.length) + str;
  return str.substr(0, str.length-18) + "." + str.substr(str.length-18);
}

console.log(toTokenValue("1000000000000000"));