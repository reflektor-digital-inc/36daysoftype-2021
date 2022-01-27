require('dotenv').config();

const alpha = '0123456789abcdefghijklmnopqrstuvwxyz';
const letters = Array.from(alpha);
const main = async () => {
  const nftContractFactory = await hre.ethers.getContractFactory('ReflektorNFT');

  /**
   * [note]
   * DEPLOY_CONTRACT_BASE_URI should represents either:
   *   - An IPFS gateway.
   *   - Link to a static page served locally.
   */
  const nftContract = await nftContractFactory.deploy(
    letters,
    process.env.DEPLOY_CONTRACT_BASE_URI
  );
  await nftContract.deployed();
  console.log('Contract deployed to:', nftContract.address);
};
  
const runMain = async () => {
  try {
    await main();
    process.exit(0);
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
};
  
runMain();
