require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

const { API_KEY } = process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

// eslint-disable-next-line no-undef
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    // eslint-disable-next-line no-console
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const baseConfig = {
  solidity : '0.8.4',
  paths : {
    artifacts : './artifacts'
  }
};

let networks = {
  hardhat : {
    chainId : 1337
  }
};

if (API_KEY) {
  networks = {
    ...networks,
      // polygon mainnet
    matic : {
      url : 'https://rpc-mumbai.maticvigil.com'
    }
  };
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  ...baseConfig,
  networks : {
    ...networks
  }
};
