export default {
  state : {
    wallet : {
      connected : false,
      chainId : 0,
      chainName : '',
      previousChainId : 0,
      supportedChainId : 0,
      accountAddress : '',
      accountBalance : 0,
      networkUnsupported : false
    },
    walletProviderModal : {
      isOpen : false
    },
    purchaseConfirm : {
      isOpen : false
    },
    allNfts : [],
    currentNft : {
      tokenId : '', // this is the letter
      letterIndex : null,
      name : '',
      previewImage : '',
      previewVideo : '',
      price : 0,
      sold : false,
      owner : ''
    },
    nftModal : {
      isOpen : false
    },
    mobilePopup : {
      isOpen : false
    }
  },
  mutations : {
    setWalletConnected(state, value) {
      state.wallet.connected = value;
    },
    setWalletChainId(state, value) {
      state.wallet.chainId = value;
    },
    setWalletChainName(state, value) {
      state.wallet.chainName = value;
    },
    setWalletPreviousChainId(state, value) {
      state.wallet.previousChainId = value;
    },
    setWalletSupportedChainId(state, value) {
      state.wallet.supportedChainId = value;
    },
    setWalletAccountAddress(state, value) {
      state.wallet.accountAddress = value;
    },
    setWalletAccountBalance(state, value) {
      state.wallet.accountBalance = value;
    },
    setWalletNetworkUnsupported(state, value) {
      state.wallet.networkUnsupported = value;
    },
    openWalletProviderModal(state) {
      state.walletProviderModal.isOpen = true;
    },
    closeWalletProviderModal(state) {
      state.walletProviderModal.isOpen = false;
    },
    openPurchaseConfirm(state) {
      state.purchaseConfirm.isOpen = true;
    },
    closePurchaseConfirm(state) {
      state.purchaseConfirm.isOpen = false;
    },
    resetWallet(state) {
      state.wallet.connected = false;
      state.wallet.chainId = '';
      state.wallet.accountAddress = '';
      state.wallet.accountBalance = 0;
      state.walletProviderModal.isOpen = false;
    },
    setCurrentNft(state, nft) {
      state.currentNft.tokenId = nft.tokenId;
      state.currentNft.letterIndex = nft.letterIndex;
      state.currentNft.name = nft.name;
      state.currentNft.previewImage = nft.previewImage;
      state.currentNft.previewVideo = nft.previewVideo;
      state.currentNft.price = nft.price;
      state.currentNft.sold = nft.sold;
      state.currentNft.owner = nft.owner;
    },
    resetCurrentNft(state) {
      state.currentNft.tokenId = '';
      state.currentNft.letterIndex = null;
      state.currentNft.name = '';
      state.currentNft.previewImage = '';
      state.currentNft.previewVideo = '';
      state.currentNft.price = 0;
      state.currentNft.sold = false;
      state.currentNft.owner = '';
    },
    setAllNfts(state, nfts) {
      state.allNfts = [...nfts];
    },
    openNftModal(state) {
      state.nftModal.isOpen = true;
    },
    closeNftModal(state) {
      state.nftModal.isOpen = false;
    },
    openNftMobilePopup(state) {
      state.mobilePopup.isOpen = true;
    },
    closeNftMobilePopup(state) {
      state.mobilePopup.isOpen = false;
    }
  }
};
