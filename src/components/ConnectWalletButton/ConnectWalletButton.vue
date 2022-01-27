<template>
  <div
    class="ConnectWalletButton"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  >
    <PillButton
      :label="showDisconnectButton ? disconnectLabel : label"
      :colored="true"
      :is-small-button="true"
      class="ConnectWalletButton__btn"
      :style="{ width : '225px' }"
      @click="handleClick"
    />
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import PillButton from '@components/PillButton/PillButton.vue';
  import { reduceAddress } from '../../utils/nft/format';

  export default {
    name : 'ConnectWalletButton',
    components : { PillButton },
    data() {
      return {
        showDisconnectButton : false
      };
    },
    computed : {
      ...mapState({
        walletConnected : state => state.nft.wallet.connected,
        walletAccountAddress : state => state.nft.wallet.accountAddress
      }),
      label() {
        return this.walletConnected ?
          'Account: ' + reduceAddress(this.walletAccountAddress) :
          'Connect Wallet';
      },
      disconnectLabel() {
        return 'Disconnect Wallet';
      }
    },
    methods : {
      ...mapMutations({
        openWalletProviderModal : 'nft/openWalletProviderModal',
        resetWallet : 'nft/resetWallet'
      }),
      handleClick() {
        if (this.walletConnected) {
          this.disconnectWallet();
        }
        else {
          this.connectWallet();
        }
      },
      async connectWallet() {
        if (this.$wallet.connected) {
          return;
        }
        // await this.$wallet.connectToWallet();
        this.openWalletProviderModal();
      },
      async disconnectWallet() {
        this.$wallet.disconnect();
        this.resetWallet();
      },
      handleMouseOver() {
        if (this.walletConnected) {
          this.showDisconnectButton = true;
        }
      },
      handleMouseLeave() {
        this.showDisconnectButton = false;
      }
    }
  };
</script>

<style lang="scss">
  .ConnectWalletButton {
    position: relative;
    height: 120%;
    &__btn {
      width: 100%;

      &-disconnect {
        position: absolute;
        top: 120%;
        left: 0;
      }
      &-disconnect::before {
        content: '';
        position: absolute;
        height: 20%;
        width: 100%;
        top: -20%;
        // border:1px solid green; /* for demo purposes */
      }
    }
  }
</style>
