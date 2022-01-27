require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

const contract = require('../src/artifacts/contracts/ReflektorNFT.sol/ReflektorNFT.json');

const contractInterface = contract.abi;

// https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html#provider-object
const provider = ethers.provider;

// const tokenURI = "https://bafkreifvtwuiypleu4vv7edh4zclmymp5ixh44xxmd3hb2imiqa7mp2c3a.ipfs.dweb.link/";
const privateKey = `0x${process.env.PRIVATE_KEY}`;
const wallet = new ethers.Wallet(privateKey);

wallet.provider = provider;
const signer = wallet.connect(provider);

// https://docs.ethers.io/v5/api/contract/contract
const NftFactory = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractInterface,
  signer
);

const main = () => {
  console.log('Waiting 5 blocks for confirmation...');
  NftFactory
    .mintNFT(process.env.PUBLIC_KEY, tokenURI)
    .then(tx => tx.wait(5))
    .then(receipt => console.log(`Your transaction is confirmed, its receipt is: ${receipt.transactionHash}`))

    .catch(e => console.log('something went wrong', e));
};

main();