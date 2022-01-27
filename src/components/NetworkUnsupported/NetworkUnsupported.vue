<template>
  <div class="NetworkUnsupported">
    <p class="NetworkUnsupported__text">
      This network ({{ walletChainName }}) is currently<br>
      not supported on our site.<br><br>
      Please switch to {{ supportedChainName }} to continue<br>
      using the market.
    </p>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import { NETWORKS } from '../../settings/settings.app';

  export default {
    name : 'NetworkUnsupported',
    computed : {
      ...mapState({
        walletChainId : state => state.nft.wallet.chainId,
        walletChainName : state => state.nft.wallet.chainName,
        walletSupportedChainId : state => state.nft.wallet.supportedChainId
      }),
      supportedChainName() {
        return NETWORKS[this.walletSupportedChainId];
      }
    }
  };
</script>

<style lang="scss">
  .NetworkUnsupported {
    @include full-size;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba($black, 0.8);
    color: $white;
    z-index: $super-overlay-z;
    pointer-events: auto;

    &__text {
      @include fk-grotesk-neue-bold(36);
      text-align: center;
    }
  }
</style>