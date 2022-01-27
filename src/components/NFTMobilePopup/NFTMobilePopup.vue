<template>
  <div class="NFTMobilePopup">
    <div class="NFTMobilePopup__backdrop" />
    <div class="NFTMobilePopup__modal">
      <h3 class="NFTMobilePopup__modal-heading">
        Continue on Desktop
      </h3>
      <p class="NFTMobilePopup__modal-body">
        Please visit this link on your desktop browser to continue purchasing the NFT.
      </p>
      <p v-if="showMessage" class="NFTMobilePopup__modal-msg">
        Link copied to clipboard.
      </p>
      <PillButton
        label="Copy Link"
        :on-click="handleCopyLink"
      />
      <MobilePopupCloseIcon
        width="45"
        class="NFTMobilePopup__modal-close"
        @click="closeNftMobilePopup"
      />
    </div>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  import PillButton from '@components/PillButton/PillButton';
  import MobilePopupCloseIcon from '@assets/svgs/mobile-popup-close.svg';

  export default {
    name : 'NFTMobilePopup',
    components : { PillButton, MobilePopupCloseIcon },
    data() {
      return {
        showMessage : false,
        showMessageTimeout : null
      };
    },
    beforeUnmount() {
      if (this.showMessageTimeout) clearTimeout(this.showMessageTimeout);
    },
    methods : {
      ...mapMutations({
        closeNftMobilePopup : 'nft/closeNftMobilePopup'
      }),
      handleCopyLink() {
        navigator.clipboard.writeText(window.location.href);
        this.showMessage = true;

        if (this.showMessageTimeout) clearTimeout(this.showMessageTimeout);
        this.showMessageTimeout = setTimeout(() => {
          this.showMessage = false;
        }, 2000);
      }
    }
  };
</script>

<style lang="scss">
  .NFTMobilePopup {
    @include full-size;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;

    &__backdrop {
      @include full-size;
      background-color: $black,;
    }

    &__modal {
      position: relative;
      width: 80%;
      padding: 40px 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-width: 2px;
      border-style: solid;
      border-image-source: linear-gradient(135deg, #cc13ea 25%, #2708a6 80%);
      border-image-slice: 1;
      z-index: 1;

      &-heading {
        @include fk-display-regular(24, 0, math.div(28, 24));
        text-transform: uppercase;
        text-align: center;
        margin-bottom: 0;
      }

      &-body {
        @include fk-grotesk-neue-regular(14, 0, math.div(22, 14));
        text-align: center;
        margin-top: 20px;
        margin-bottom: 40px;
      }

      &-msg {
        @include fk-grotesk-neue-regular(14, 0, math.div(22, 14));
      }

      &-close {
        position: absolute;
        top: 10px;
        right: 10px;
      }
    }
  }
</style>
