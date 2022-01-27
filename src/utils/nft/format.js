import { ethers } from 'ethers';

export const getNumberFromBigNumber = (bn) => {
  const etherValue = ethers.utils.formatEther(bn);
  return parseFloat(etherValue) * Math.pow(10, 18);
};

export const formatEthers = bn => ethers.utils.formatEther(bn);

export const reduceAddress = (address) => {
  const firstSection = address.substring(0, 6);
  const lastSection = address.substring(address.length - 4, address.length);
  return `${firstSection}...${lastSection}`;
};
