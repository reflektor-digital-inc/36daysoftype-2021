<template>
  <div class="NFTModal">
    <div class="NFTModal__backdrop" @click="closeNftModal" />
    <div ref="modal" class="NFTModal__modal">
      <h2 v-if="breakpointPhone" class="NFTModal__details-name">
        {{ currentNft.name }}
      </h2>
      <div class="NFTModal__preview">
        <video
          class="NFTModal__preview-video"
          :src="currentNft.previewVideo"
          :controls="false"
          autoplay
          muted
          loop
        />
      </div>
      <div class="NFTModal__close" @click="closeNftModal">
        <span />
        <span />
      </div>
      <div class="NFTModal__details">
        <h2 v-if="!breakpointPhone" class="NFTModal__details-name">
          {{ currentNft.name }}
        </h2>
        <p class="NFTModal__details-desc">
          {{ description }}
        </p>
        <div v-if="!currentNft.sold" class="NFTModal__details-row">
          <p class="NFTModal__details-group">
            <span>Owner:</span>
            {{ currentNft.owner }}
          </p>
          <p class="NFTModal__details-group">
            <span>Price:</span>
            {{ currentNft.price }} MATIC
          </p>
        </div>
        <div class="NFTModal__actions">
          <div v-if="showWalletConnectButtons" class="NFTModal__actions-btns">
            <PillButton
              label="MetaMask"
              class="NFTModal__actions-btn"
              small
              @click="handleMetaMask"
            />
            <PillButton
              label="WalletConnect"
              class="NFTModal__actions-btn"
              small
              @click="handleWalletConnect"
            />
          </div>
          <template v-if="currentNft.sold">
            <div class="NFTModal__details-column">
              <p class="NFTModal__details-group">
                <span>Sold for {{ currentNft.price }}</span>
                <IconMatic class="NFTModal__details-icon" />
              </p>
              <p class="NFTModal__details-group">
                <span>Etherscan:</span>
                <a
                  class="NFTModal__details-link"
                  target="_blank"
                  :href="polyscanUrl"
                >
                  {{ reducedTransactionId }}
                </a>
              </p>
            </div>
          </template>
          <PillButton
            v-if="showPurchaseButton"
            label="Purchase for"
            is-purchase-btn
            :price="currentNft.price"
            :disabled="walletNetworkUnsupported"
            :class="['NFTModal__actions-btn', {'NFTModal__actions-btn--disabled' : walletNetworkUnsupported}]"
            :on-click="purchaseNFT"
          />
          <Countdown
            v-if="showCountDown"
            label="The Marketplace is coming soon."
            :date="openDate"
            :time="openTime"
            is-vertical-layout
          />
          <div v-if="showMessages" class="NFTModal__message">
            <NFTModalMessage
              v-if="walletNetworkUnsupported && !currentNft.sold"
              message="This Network is not supported. Please switch back to the Polygon Mainnet."
              type="error"
              link="#"
              link-label="Click here switch networks"
            />
            <NFTModalMessage
              v-if="!walletConnected && !currentNft.sold && !isMobileDevice"
              message="You need to connect your wallet in order to be able to complete this transaction."
              type="error"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations } from 'vuex';
  import IconMatic from '@assets/svgs/icon-matic.svg';
  import gsap from 'gsap';
  import PillButton from '../PillButton/PillButton.vue';
  import NFTModalMessage from '../NFTModalMessage/NFTModalMessage.vue';
  import Countdown from '../Countdown/Countdown.vue';
  import { reduceAddress } from '../../utils/nft/format';
  import { NFT_OPENING } from '../../config/settings';

  export default {
    name : 'NFTModal',
    components : { PillButton, NFTModalMessage, IconMatic, Countdown },
    computed : {
      ...mapGetters({
        breakpointPhone : 'windowSize/breakpointPhone',
        breakpointTablet : 'windowSize/breakpointTablet'
      }),
      ...mapState({
        walletConnected : state => state.nft.wallet.connected,
        walletNetworkUnsupported : state => state.nft.wallet.networkUnsupported,
        currentNft : state => state.nft.currentNft,
        countdownIsOver : state => state.countdown.isCountdownOver
      }),
      description() {
        return 'Voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasimemo architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur seramos todos quantum.';
      },
      owner() {
        return '0x540D67e6a017fE7592f895fA0E4B6CD910D935CF';
      },
      transactionId() {
        return '0xe84148953b1d9b54903c2032c126767e8ad8bf47908a7f36b8fce76930ab9d27';
      },
      reducedTransactionId() {
        return reduceAddress(this.transactionId);
      },
      polyscanUrl() {
        return `https://etherscan.io/tx/${this.transactionId}`;
      },
      isMobileDevice() {
        return this.breakpointPhone || this.breakpointTablet;
      },
      showWalletConnectButtons() {
        return this.countdownIsOver && !this.isMobileDevice && !this.walletConnected && !this.currentNft.sold;
      },
      showPurchaseButton() {
        return this.countdownIsOver && !this.isMobileDevice && this.walletConnected && !this.currentNft.sold;
      },
      openDate() {
        return NFT_OPENING.date;
      },
      openTime() {
        return NFT_OPENING.time;
      },
      showCountDown() {
        return !this.isMobileDevice && !this.countdownIsOver;
      },
      showMessages() {
        return !this.isMobileDevice && this.countdownIsOver;
      }
    },
    async beforeUnmount() {
      this.closePurchaseConfirm();
      // this.resetCurrentNft();
      await this.tl?.reverse();
      this.tl.kill();
    },
    mounted() {
      this.tl = gsap.timeline();
      this.tl.fromTo(this.$refs.modal, { scale : 0.6 }, { scale : 1, duration : 0.4, ease : 'back(1.1)' });
    },
    methods : {
      ...mapMutations({
        openPurchaseConfirm : 'nft/openPurchaseConfirm',
        closePurchaseConfirm : 'nft/closePurchaseConfirm',
        closeNftModal : 'nft/closeNftModal',
        resetCurrentNft : 'nft/resetCurrentNft',
        openNftMobilePopup : 'nft/openNftMobilePopup'
      }),
      async handleMetaMask() {
        if (this.walletConnected) return;
        await this.$wallet.connectToWallet('metamask');
      },
      async handleWalletConnect() {
        if (this.walletConnected) return;
        await this.$wallet.connectToWallet('walletconnect');
      },
      async purchaseNFT() {
        if (!this.isMobileDevice) {
          if (this.currentNft.sold || !this.walletConnected || !this.currentNft.tokenId) return;
          if (this.$wallet.isMetaMask) {
            // For MetaMask, we don't need the confirm modal.
            const tx = await this.$wallet.purchaseNFT(this.currentNft.letterIndex); // eslint-disable-line
          }
          else {
            // This opens a confirmation modal for the user
            // to confirm the purchase. That modal is the
            // `PurchaseConfirm` component, which on confirm
            // will perform transaction through the NFT Contract.
            this.openPurchaseConfirm();
          }
        }
        else {
          this.openNftMobilePopup();
        }
      }
    }
  };
</script>

<style lang="scss">
  .NFTModal {
    @include full-size(fixed);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 15;

    &__modal {
      margin-top: $nav-header-height;
      max-height: calc(100% - $nav-header-height);
      position: relative;
      display: flex;
      width: 80vw;
      max-width: 1200px;
      padding: 100px;
      background-color: $black;
      border: 1px solid;
      border-image-source: $popsicle-gradient;
      border-image-slice: 1;
      pointer-events: auto;
      z-index: 2;
      @include breakpoint(max-height 600px) {
        padding: 50px;
      }
      @include breakpoint($tablet) {
        padding: 50px;
      }
      @include breakpoint($phone) {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        max-height: unset;
        margin-top: 0;
        flex-direction: column;
        padding: 0;
        padding: 40px 20px;
      }
      @include breakpoint($phone-small) {
        padding: 10px 20px 20px;
      }
    }

    &__actions {
      width: 100%;
      &-btns {
        margin-bottom: 20px;
      }
      &-btn {
        @include fk-grotesk-neue-regular(14, 0, math.div(22, 11));
        display: block;
        margin-top: 10px;
        color: $black;
        background-color: $white;
        &--disabled {
          opacity: 0.5;
        }
      }
    }

    &__close {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 18px;
      height: 18px;
      cursor: pointer;
      span:first-child {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 18px;
        height: 1px;
        background-color: $white;
        transform-origin: center;
        transform: translate(-50%, -50%) rotate(45deg);
        transition: background-color 0.2s;
      }
      span:last-child {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 18px;
        height: 1px;
        background-color: $white;
        transform-origin: center;
        transform: translate(-50%, -50%) rotate(-45deg);
        transition: background-color 0.2s;
      }
      &:hover span {
        background-color: $active-pink;
      }
      @include breakpoint($phone) {
        width: 45px;
        height: 45px;
        border: 1px solid rgba($white, 0.5);
        border-radius: 50px;
      }
    }

    &__preview {
      flex-shrink: 0;
      width: 430px;
      height: 430px;
      @include breakpoint(max-width 1300px) {
        width: 300px;
        height: 300px;
      }
      @include breakpoint($tablet) {
        width: 270px;
        height: 270px;
      }
      @include breakpoint($phone) {
        width: unset;
        height: unset;
        margin-bottom: 20px;
      }
      @include breakpoint($phone-small) {
        width: unset;
        height: 35vh;
        margin-bottom: 10px;
      }
      &-video {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        @include breakpoint($phone) {
          height: 100%;
          object-fit: contain;
        }
      }
    }

    &__details {
      padding-left: 130px;
      @include breakpoint(max-width 1300px) {
        padding-left: 40px;
      }
      @include breakpoint($phone) {
        padding: 0;
      }
      &-icon {
        margin-bottom: -0.05em;
        & path {
          fill: white;
        }
      }
      &-link {
        text-decoration: underline;
      }
      &-name {
        @include gosha(24, 0, 1);
      }
      &-desc {
        @include fk-grotesk-neue-regular(14, 0, math.div(22, 14));
      }
      &-row {
        @include fk-grotesk-neue-regular(14, 0, math.div(22, 14));
        gap: 20px;
        display: flex;
        flex-wrap: wrap;
        & span {
          @include fk-grotesk-neue-bold(14, 0, math.div(22, 14));
        }
      }
      &-column {
        max-width: 44ch;
        @include fk-grotesk-neue-regular(18, 0, 0.5);
        & span {
          margin-right: 8px;
          @include fk-grotesk-neue-bold(18, 0, 0.7);
        }
      }
    }
    
    &__backdrop {
      @include full-size(fixed);
      pointer-events: auto;
      z-index: 1;
      background: rgba($black, 0.7);
    }

    &__owner {
      margin-bottom: 8px;
    }

    &__etherscan {
      a {
        text-decoration: underline;
      }
    }
  }
</style>
