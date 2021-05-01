export const fromWei = (str) => {
  if (str.length < 18) str = "0".repeat(18 - str.length) + str;
  return str.substr(0, str.length-18) + "." + str.substr(str.length-18);
}

export const interpolate = (start, end, progress) => {
  return start + (end - start)*progress;
}

export const sleep = async (ms) => {
  await new Promise(resolve => setTimeout(resolve, ms));
}