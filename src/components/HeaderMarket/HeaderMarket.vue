<template>
  <div class="HeaderMarket">
    <Countdown
      v-if="!isCountdownOver"
      label="NFT Marketplace is coming soon"
      :date="date"
      :time="time"
    />
    <template v-else>
      <div v-if="showNftHeader" class="HeaderMarket__nft">
        <div class="HeaderMarket__owner">
          Owned by: <span>{{ owner }}</span>
        </div>
        <PillButton
          :label="nftLabel"
          :white-background="true"
          :is-small-button="true"
          :has-crypto-logo="!isOwnedByReflektor"
          class="HeaderMarket__purchase"
          :on-click="handleNftButtonClick"
        />
      </div>
      <ConnectWalletButton class="HeaderMarket__wallet" />
    </template>
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import ConnectWalletButton from '@components/ConnectWalletButton/ConnectWalletButton.vue';
  import PillButton from '@components/PillButton/PillButton.vue';
  import { reduceAddress } from '@utils/nft/format';
  import Countdown from '../Countdown/Countdown.vue';
  import { NFT_OPENING } from '../../config/settings';

  export default {
    name : 'HeaderMarket',
    components : { ConnectWalletButton, PillButton, Countdown },
    data() {
      return {
        // Set time for the event
        time : NFT_OPENING.time,
        // Set date for the event
        date : NFT_OPENING.date
      };
    },
    computed : {
      ...mapState({
        isCountdownOver : state => state.countdown.isCountdownOver
      }),
      showNftHeader() {
        // TODO : add check for if NFT Modal is also visible

        return this.$route.path.includes('letter');
      },
      isOwnedByReflektor() {
        // TODO : add check of the owner
        return true;
      },
      owner() {
        // TODO : add check of the owner

        const owner = '';
        return this.isOwnedByReflektor ? 'Reflektor Digital' : owner;
      },
      ownerAddress() {
        return '0x123456789abcdfe';
      },
      price() {
        // TODO : use price from letter
        return 1.11;
      },
      nftLabel() {
        return this.isOwnedByReflektor ?
          `Purchase NFT: ${this.price}` :
          `Owner: ${reduceAddress(this.ownerAddress)}`;
      }
    },
    methods : {
      ...mapMutations({
        openNftModal : 'nft/openNftModal'
      }),
      handleNftButtonClick() {
        this.openNftModal();
      }
    }
  };
</script>

<style lang="scss">
  .HeaderMarket {
    display: flex;
    align-items: center;
    &__nft {
      display: flex;
      align-items: center;
      margin-right: calc-vw(20);
    }
    &__owner {
      margin-right: calc-vw(20);
      @include fk-grotesk-neue-regular(18, 0.6, math.div(21, 18));
      span {
        @include fk-grotesk-neue-bold(18, 0.6, math.div(21, 18));
        font-size: calc-vw(18);
      }
      font-size: calc-vw(18);
    }
    &__purchase {
      max-width: 203px;
      & .PillButton__label {
        line-height: 20px;
      }
    }
    &__wallet {
      & .PillButton__label {
        line-height: 20px;
      }
    }
  }

</style>
