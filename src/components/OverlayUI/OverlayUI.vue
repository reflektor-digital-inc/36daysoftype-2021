<template>
  <div class="OverlayUI">
    <transition name="fade">
      <InformationOverlay v-if="!isNavigationOverlayOpen && displayInformationOverlay" :is-mobile-layout="breakpointPhone" />
    </transition>

    <CongratulationsModal :is-active="isCongratulationsModalOpen && !isIframe" />

    <transition name="fade">
      <NFTModal v-if="nftModalIsOpen" />
    </transition>

    <transition name="fade">
      <AboutMarketModal v-if="isMarketModalOpen" />
    </transition>

    <template v-if="(breakpointTablet || breakpointPhone) && !isIframe">
      <NavigationHeaderMobile v-if="hasLoaded" />
      <LetterBarMobile v-if="showLetterOverlays" />
      <!-- <NFTMobilePopup v-if="nftMobilePopupIsOpen" /> -->
    </template>
    <template v-else-if="!breakpointPhone && !isIframe">
      <LetterBar v-if="showLetterOverlays" />
      <NavigationHeader v-if="hasLoaded" />
      <transition
        name="fade"
      >
        <ConnectWalletModal
          v-if="walletProviderModalIsOpen"
          ref="walletModal"
          class="OverlayUI__wallet"
        />
      </transition>
      <PurchaseConfirm v-if="purchaseConfirmIsOpen" />
    </template>

    <Loader :is-active="isTransitioning || isLoading" />
  </div>
</template>

<script>
  import { mapState, mapMutations, mapGetters } from 'vuex';
  import LetterBar from '@components/OverlayUI/LetterBar.vue';
  import GlobalLoader from '@components/OverlayUI/GlobalLoader.vue';
  import Loader from '@components/Loader/Loader.vue';
  import InfoIcons from '@components/OverlayUI/InfoIcons.vue';
  import ReflektorLogo from '@components/OverlayUI/ReflektorLogo.vue';
  import ReflektorLogoMobile from '@components/MobileView/ReflektorLogoMobile.vue';
  import AboutModal from '@components/OverlayUI/AboutModal.vue';
  import CongratulationsModal from '@components/OverlayUI/CongratulationsModal.vue';
  import InformationOverlay from '@components/InformationOverlay/InformationOverlay.vue';
  import LetterBarMobile from '@components/MobileView/LetterBarMobile.vue';
  import Hamburger from '@components/OverlayUI/Hamburger.vue';
  import NavigationHeader from '@components/NavigationHeader/NavigationHeader.vue';
  import NavigationHeaderMobile from '@components/NavigationHeaderMobile/NavigationHeaderMobile.vue';
  import ConnectWalletModal from '@components/ConnectWalletModal/ConnectWalletModal.vue';
  import PurchaseConfirm from '@components/PurchaseConfirm/PurchaseConfirm.vue';
  import NFTModal from '@components/NFTModal/NFTModal.vue';
  import AboutMarketModal from '@components/AboutMarketModal/AboutMarketModal.vue';
  import NFTMobilePopup from '@components/NFTMobilePopup/NFTMobilePopup.vue';

  export default {
    name : 'OverlayUI',
    components : {
      LetterBar,
      GlobalLoader,
      Loader,
      InfoIcons,
      ReflektorLogo,
      AboutModal,
      InformationOverlay,
      ReflektorLogoMobile,
      LetterBarMobile,
      Hamburger,
      CongratulationsModal,
      NavigationHeader,
      NavigationHeaderMobile,
      ConnectWalletModal,
      PurchaseConfirm,
      NFTModal,
      NFTMobilePopup,
      AboutMarketModal
    },
    data() {
      return {
        showLetterOverlays : false
      };
    },
    computed : {
      ...mapState({
        hasLoaded : state => state.loader.hasLoaded,
        isLoading : state => state.loader.isLoading,
        isTransitioning : state => state.loader.transitionState.isTransitioning,
        isAboutModalOpen : state => state.modal.isAboutModalOpen,
        isCongratulationsModalOpen : state => state.modal.isCongratulationsModalOpen,
        isInfoOverlayOpen : state => state.overlays.isInfoOverlayOpen,
        isNavigationOverlayOpen : state => state.overlays.isNavigationOverlayOpen,
        walletNetworkUnsupported : state => state.nft.wallet.networkUnsupported,
        walletProviderModalIsOpen : state => state.nft.walletProviderModal.isOpen,
        purchaseConfirmIsOpen : state => state.nft.purchaseConfirm.isOpen,
        isIframe : state => state.overlays.isIframe,
        nftModalIsOpen : state => state.nft.nftModal.isOpen,
        nftMobilePopupIsOpen : state => state.nft.mobilePopup.isOpen,
        isMarketModalOpen : state => state.market.isMarketModalOpen
      }),
      ...mapGetters({
        breakpointPhone : 'windowSize/breakpointPhone',
        breakpointTablet : 'windowSize/breakpointTablet'
      }),
      displayInformationOverlay() {
        return !this.isIframe && this.isLetterPage(this.$route);
      },
      isMarketPages() {
        return this.$route.path.includes('market');
      }
    },
    watch : {
      $route : {
        immediate : true,
        handler : 'handleRouteChange'
      }
    },
    mounted() {
      //
    },
    created() {
      //
    },
    methods : {
      ...mapMutations({
        closeInfoOverlay : 'overlays/closeInfoOverlay',
        setWalletNetworkUnsupported : 'nft/setWalletNetworkUnsupported'
      }),
      isLetterPage(route) {
        const name = route.name;
        if (name) {
          return name !== 'index' && name !== 'about' && name !== 'contact' && name.indexOf('market') !== 0;
        }
        else {
          return false;
        }
      },
      handleRouteChange(route) {
        this.closeInfoOverlay();
        this.showLetterOverlays = this.isLetterPage(route);
      }
     
    }
  };
</script>

<style lang="scss">

  .OverlayUI {
    @include full-size(absolute);
    z-index: 99;
    pointer-events: none;
  }

</style>
