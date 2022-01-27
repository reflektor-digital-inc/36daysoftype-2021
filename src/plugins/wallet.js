import store from '../store/store';
import Wallet from '../utils/nft/wallet';

export default {
  install : (app) => {
    const onConnect = ({
      accountAddress,
      chainId,
      chainName,
      supportedChainId,
      connected,
      accountBalance
    }) => {
      store.commit('nft/setWalletAccountAddress', accountAddress);
      store.commit('nft/setWalletChainId', chainId);
      store.commit('nft/setWalletChainName', chainName);
      store.commit('nft/setWalletSupportedChainId', supportedChainId);
      store.commit('nft/setWalletConnected', connected);
      store.commit('nft/setWalletAccountBalance', accountBalance);
    };
    
    const onChainChange = ({
      chainId,
      chainName,
      previousChainId
    }) => {
      store.commit('nft/setWalletChainId', chainId);
      store.commit('nft/setWalletChainName', chainName);
      store.commit('nft/setWalletPreviousChainId', previousChainId);
    };

    const onAccountsChange = ({
      accountAddress,
      accountBalance
    }) => {
      store.commit('nft/setWalletAccountAddress', accountAddress);
      store.commit('nft/setWalletAccountBalance', accountBalance);
    };

    app.config.globalProperties.$wallet = new Wallet({
      events : {
        onConnect,
        onChainChange,
        onAccountsChange
      }
    });
    app.config.globalProperties.$wallet.listenToChainChange();
    app.config.globalProperties.$wallet.listenToAccountsChange();
  }
};