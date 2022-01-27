export const ALPHA = '0123456789abcdefghijklmnopqrstuvwxyz';

export const letters = Array.from(ALPHA);

const letterIndexMap = {};
letters.forEach((a, i) => {
  letterIndexMap[a] = i;
});

export default letterIndexMap;
