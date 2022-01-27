import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { NETWORKS } from '../../settings/settings.app';
import { formatEthers } from './format';
import ReflektorNFT from '../../../artifacts/contracts/ReflektorNFT.sol/ReflektorNFT.json';

class Wallet {
  constructor({ events }) {
    this.accountAddress = null;
    this.accountBalance = 0;
    this.provider = null;
    this.signer = null;
    this.currentChainId = null;
    this.previousChainId = null;
    this.currentChainName = '';
    this.connected = false;
    this.isMetaMask = false;
    this.walletConnectProvider = null;

    this.supportedChainId = import.meta.env.DEV ?
      parseInt(import.meta.env.VITE_SUPPORTED_CHAIN_DEV) :
      parseInt(import.meta.env.VITE_SUPPORTED_CHAIN_PROD);
    this.contractAddress =  import.meta.env.VITE_CONTRACT_ADDRESS;

    this.onConnect = events.onConnect || (() => {});
    this.onAccountsChange = events.onAccountsChange || (() => {});
    this.onChainChange = events.onChainChange || (() => {});
  }

  /**
   * connectToWallet
   * @param {string} wallet 'metamask' or 'walletconnect'
   */
  async connectToWallet(wallet) {
    try {
      await this.initProvider(wallet);
      this.initSigner();
      await this.initConnectionInfo();
      await this.getAccountBalance();
      this.connected = true;
      this.currentChainName = NETWORKS[this.currentChainId] ? NETWORKS[this.currentChainId] : 'Unknown';
      this.onConnect({
        accountAddress : this.accountAddress,
        accountBalance : this.accountBalance,
        chainId : this.currentChainId,
        chainName : this.currentChainName,
        supportedChainId : this.supportedChainId,
        connected : this.connected
      });
    }
    catch (err) {
      throw new Error(err);
    }
  }

  async initProvider(wallet) {
    switch (wallet) {
      case 'walletconnect' : {
        this.walletConnectProvider = new WalletConnectProvider({
          qrcode : true,
          rpc : {
            4 : 'https://rinkeby-light.eth.linkpool.io/',
            137 : 'https://polygon-rpc.com/',
            1337 : 'http://localhost:8545/'
          }
        });
        await this.walletConnectProvider.enable();
        this.provider = new ethers.providers.Web3Provider(this.walletConnectProvider);
        break;
      }
      default : {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await this.provider.provider.enable();
        this.isMetaMask = true;
        break;
      }
    }
  }

  initSigner() {
    if (!this.provider) return;
    this.signer = this.provider.getSigner();
  }

  async initConnectionInfo() {
    if (!this.provider) return;
    const chain = await this.provider.getNetwork();
    if (this.currentChainId) this.previousChainId = this.currentChainId;
    this.currentChainId = chain.chainId;
    this.accountAddress = window.ethereum.selectedAddress;
  }

  listenToChainChange() {
    if (!window.ethereum) return;
    window.ethereum.on('chainChanged', this.handleChainChange.bind(this));
  }

  listenToAccountsChange() {
    if (!window.ethereum) return;
    window.ethereum.on('accountsChanged', this.handleAccountsChange.bind(this));
  }

  async handleChainChange(chainId) {
    await this.initProvider(this.isMetaMask ? 'metamask' : 'walletconnect');
    this.initSigner();
    await this.initConnectionInfo();

    // Need to parse to an int because
    // MetaMask API returns the chainId
    // as a hex
    this.currentChainId = parseInt(chainId, 16);
    this.currentChainName = NETWORKS[this.currentChainId] ? NETWORKS[this.currentChainId] : 'Unknown';
    this.onChainChange({
      chainId : this.currentChainId,
      chainName : this.currentChainName,
      previousChainId : this.previousChainId
    });
  }

  async handleAccountsChange(accounts) {
    this.accountAddress = accounts[0];
    await this.getAccountBalance();
    this.onAccountsChange({
      accountAddress : this.accountAddress,
      accountBalance : this.accountBalance
    });
  }

  /**
   * purchaseNFT
   * @param {Number} letterIndex Index of the letter
   * @returns Purchase transaction
   */
  async purchaseNFT(letterIndex) {
    if (!this.connected) return;

    const contract = new ethers.Contract(
      this.contractAddress,     // The Market contract address
      ReflektorNFT.abi,         // import the NFT
      this.signer
    );

    const transaction = await contract.mint(letterIndex, { value : 14255000 });

    // minting
    const tx = await transaction.wait();
    // minted

    return tx;
  }

  checkMetaMaskInstalled() {
    return (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask);
  }

  async getAccountBalance() {
    if (!this.provider) return 0;
    const balance = formatEthers(await this.provider.getBalance(this.accountAddress));
    this.accountBalance = balance;
    return this.accountBalance;
  }

  // TODO: Implement this
  // eslint-disable-next-line
  async checkLetterOwnership(letterIndex) {
    return false;
  }

  async checkIfUserHasNFT() {
    if (!this.connected) return;

    const contract = new ethers.Contract(
      this.contractAddress,     // The Market contract address
      ReflektorNFT.abi,         // import the NFT
      this.provider
    );

    const result = await contract.checkIfUserHasNFT();
    return result;
  }

  async getNftHolders(letterIndex) {
    if (!this.connected) return;

    const contract = new ethers.Contract(
      this.contractAddress,     // The Market contract address
      ReflektorNFT.abi,         // import the NFT
      this.provider
    );

    const nftHolders = await contract.nftHolders(letterIndex);
    return nftHolders;
  }

  resetProperties() {
    this.accountAddress = null;
    this.accountBalance = 0;
    this.provider = null;
    this.signer = null;
    this.currentChainId = null;
    this.previousChainId = null;
    this.currentChainName = '';
    this.connected = false;
    this.isMetaMask = false;
    this.walletConnectProvider = null;
  }

  async disconnect() {
    window.ethereum.removeListener('chainChanged', this.handleChainChange.bind(this));
    window.ethereum.removeListener('accountsChanged', this.handleAccountsChange.bind(this));
    this.provider.removeAllListeners();
    if (this.provider.close) this.provider.close();
    if (this.walletConnectProvider) {
      this.walletConnectProvider.disconnect();
      this.walletConnectProvider.close();
    }
    this.resetProperties();
    this.connected = false;
  }
}

export default Wallet;
