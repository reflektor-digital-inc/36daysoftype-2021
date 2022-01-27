<template>
  <div class="ConnectWalletModal">
    <div
      ref="bg"
      class="ConnectWalletModal__bg"
      @click="closeWalletProviderModal"
    />
    <div ref="modal" class="ConnectWalletModal__modal">
      <!-- <template v-if="getWallet"> -->
      <h3 ref="getWallet" class="ConnectWalletModal__get-wallet">
        GET A WALLET
      </h3>
      <p ref="walletCopy" class="ConnectWalletModal__get-wallet-copy">
        Your wallet is the gateway to all things Ethereum, the technology that makes it possible to collect, create, and curate Non Fungible Tokens.
      </p>
      <!-- </template> -->
      <div class="ConnectWalletModal__providers">
        <button
          v-for="(provider) in providers"
          :key="`Provider-${provider.name}`"
          :class="getWalletProviderClasses(provider.key)"
          @click="!getWallet ? provider.onClick() : noWalletClick(provider.link)"
        >
          <div class="ConnectWalletModal__provider-logo">
            <img :src="provider.logo" alt="MetaMask Logo">
          </div>
          <p class="ConnectWalletModal__provider-name">
            {{ provider.name }}
          </p>
        </button>
      </div>

      <div v-if="!getWallet" class="ConnectWalletModal__no-wallet">
        <ul>
          <li>
            <a @click="toggleGetWallet">I don't have a wallet</a>
          </li>
        </ul>
      </div>

      <div v-else class="ConnectWalletModal__no-wallet">
        <ul>
          <li>
            <a @click="toggleGetWallet">Go back</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  import MetaMaskLogo from '@assets/images/metamask-logo.jpg';
  import WalletConnectLogo from '@assets/images/walletconnect-logo.png';
  import gsap from 'gsap';

  export default {
    name : 'ConnectWalletModal',
    data() {
      return {
        getWallet : false
      };
    },
    computed : {
      providers() {
        return {
          metamask : {
            name : `${this.getWallet ? 'Get ' : ''}MetaMask Wallet`,
            key : 'metamask',
            logo : MetaMaskLogo,
            onClick : this.connectToMetaMask,
            link : 'https://metamask.io/'
          },
          walletconnect : {
            name : `${this.getWallet ? 'Get ' : ''}WalletConnect`,
            key : 'walletconnect',
            logo : WalletConnectLogo,
            onClick : this.connectToWalletConnect,
            link : 'https://walletconnect.com/'
          }
        };
      }
    },
    watch : {
      getWallet(cur) {
        // gsap.to(this.$refs.modal, { height : !cur ? 244 : 415 });
        if (cur) {
          gsap.to(
            [this.$refs.getWallet, this.$refs.walletCopy],
            {
              height : function (i, target) {
                target.style.height = 'auto';
                const height = target.offsetHeight; //record the natural height
                target.style.height = '0px'; //now reset it to 0
                return height; //return the natural height
              },
              onComplete : function () {
                gsap.set(this.target, { height : 'auto' });
              },
              autoAlpha : 1,
              marginBottom : '30px',
              duration : 0.7, ease : 'power2.inOut'
            }
          );
        }
        else {
          gsap.to(
            [this.$refs.getWallet, this.$refs.walletCopy],
            {
              autoAlpha : 0,
              height : 0,
              margin : 0,
              duration : 0.7,
              ease : 'power2.inOut'
            }
          );
        }
      }
    },
    mounted() {
      this.tl = gsap.timeline();

      this.tl
        .fromTo(this.$refs.modal, { scale : 0 }, { scale : 1, duration : 0.4, ease : 'back(1.1)' });
      gsap.set(
        [this.$refs.getWallet, this.$refs.walletCopy],
        { height : 0, autoAlpha : 0, margin : 0 }
      );
    },
    beforeUnmount() {
      this.tl?.reverse();
    },
    methods : {
      ...mapMutations({
        closeWalletProviderModal : 'nft/closeWalletProviderModal',
        setWalletConnected : 'nft/setWalletConnected',
        setWalletAccountAddress : 'nft/setWalletAccountAddress',
        setWalletAccountBalance : 'nft/setWalletAccountBalance',
        setWalletChainId : 'nft/setWalletChainId'
      }),
      toggleGetWallet() {
        this.getWallet = !this.getWallet;
      },
      noWalletClick(url) {
        window.open(url, '_blank').focus();
      },
      async connectToMetaMask() {
        if (this.$wallet.connected) {
          return;
        }
        await this.$wallet.connectToWallet('metamask');
        this.closeWalletProviderModal();
      },
      async connectToWalletConnect() {
        if (this.$wallet.connected) {
          return;
        }
        await this.$wallet.connectToWallet('walletconnect');
        this.closeWalletProviderModal();
      },
      getWalletProviderClasses(providerKey) {
        const metamaskNotInstalled = providerKey === 'metamask' && typeof window.ethereum === 'undefined';
        return [
          'ConnectWalletModal__provider',
          {
            'ConnectWalletModal__provider--disabled' : metamaskNotInstalled
          }
        ];
      }
    }
  };
</script>

<style lang="scss">
  .ConnectWalletModal {
    @include full-size(fixed);
    z-index: $super-overlay-z;

    &__bg {
      @include full-size;
      background-color: rgba($black, 0.8);
      pointer-events: auto;
    }

    &__modal {
      position: absolute;
      width: 315px;
      top: #{$nav-header-height + math.div($nav-padding-vertical, 2)};
      right: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: $black;
      padding: 30px;
      z-index: 2;
      pointer-events: auto;
      border: 1px solid;
      border-image-source: $popsicle-gradient;
      border-image-slice: 1;
    }

    &__provider {
      display: flex;
      padding: 0;
      align-items: center;
      cursor: pointer;
      margin-bottom: 20px;
      background: $black;
      border: 1px solid $white;
      z-index: 10;
      &:hover {
        opacity: 0.7;
      }
      &--disabled {
        opacity: 0.4;
        pointer-events: none;
      }
      &-logo {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 56px;
        height: 56px;
        background-color: $white;
        border: 2px solid $white;

        &::after {
          content: '';
          width: 50px;
          height: 51px;
          position: absolute;
          border: 1px solid $black;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      &-name {
        width: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 0;
        margin-bottom: 0;
        padding-left: 20px;
        padding-right: 20px;
        color: $white;
        @include fk-grotesk-neue-regular(14, -0.1, math.div(22, 14));
      }
    }

    &__no-wallet {
      margin-top: 10px;
      ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        a {
          display: inline-block;
          text-decoration: underline;
          @include fk-grotesk-neue-regular(14, -0.1, math.div(14, 22));
          cursor: pointer;
        }
      }
    }
    &__get-wallet {
      @include fk-display-regular(24, 0, math.div(29, 24));
      &-copy {
        @include fk-grotesk-neue-regular(14, -0.1, math.div(22, 14));
        text-align: center;
        margin-bottom: 30px;
      }
    }
  }
</style>
