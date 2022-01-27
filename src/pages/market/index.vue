<template>
  <div class="Market">
    <div class="Market__header">
      <SplitLines ref="heading">
        <!-- eslint-disable vue/no-v-html -->
        <h1
          ref="heading"
          class="Market__header-title"
          v-html="headingCopy"
        />
      </SplitLines>
      <div class="Market__header-description--right">
        <SplitLines
          ref="copy"
          class="Market__header-font"
          :options="{ duration : 0.5, stagger : 0.1 }"
        >
          <p class="Market__header-description">
            Get a piece of the action! Finally, each of our fully interactive 36 Days of Type letters are
            available on the Polygon blockchain for you to own. Building on Polygon ensures that our NFTs
            are as energy efficient as possible, while also minimizing costly gas fees.
          </p>
          <br>
          <p class="Market__header-description">
            All 36 NFTs will be pre-minted and are priced on a sliding scale between 1-5 Matic according to their creativity and complexity.
            Purchasing will go live at 12pm EST on February 2nd. We’ll be supporting both WalletConnect and MetaMask as wallet providers.
          </p>
        </SplitLines>
        <div class="Market__link-bar">
          <a
            ref="links"
            target="_blank"
            @click="openMarketModal"
          >
            Read More
          </a>
        </div>
      </div>
    </div>

    <div class="Market__container">
      <ul class="Market__container-items">
        <li
          v-for="asset in allNfts"
          :key="`Asset-${asset.letterKey}`"
          class="Market__container-item"
        >
          <NFTPreview
            v-bind="asset"
            :ref="setRef"
            :on-click="() => openNFTDetails(asset)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState, mapMutations } from 'vuex';
  import gsap from 'gsap';
  import NFTPreview from '@components/NFTPreview/NFTPreview';
  import loadingLogic from '@mixins/loading-logic.js';
  import SplitLines from '@components/SplitLines/SplitLines.vue';

  export default {
    name : 'Market',
    components : {
      NFTPreview,
      SplitLines
    },
    mixins : [loadingLogic],
    data() {
      return {
        assetRefs : []
      };
    },
    computed : {
      ...mapState({
        hasLoaded : state => state.loader.hasLoaded,
        allNfts : state => state.nft.allNfts
      }),
      ...mapGetters({
        breakpointPhone : 'windowSize/breakpointPhone',
        breakpointTablet : 'windowSize/breakpointTablet'
      }),
      headingCopy() {
        return (this.breakpointPhone || this.breakpointTablet) ? 'NFT Marketplace' : 'NFT<br>Marketplace';
      }
    },
    watch : {
      hasLoaded : {
        immediate : true,
        handler(cur) {
          if (cur) {
            this.$nextTick(async () => {
              this.enterTimeline();
            });
          }
        }
      }
    },
    unmounted() {
      this.tl.kill();
      this.tl = null;
    },
    mounted() {
      setTimeout(() => {
        this.$el.style.height = '100%';
      }, 600);
    },
    async beforeRouteLeave(to, from, next) {
      await this.leaveTimeline();
      next();
    },
    methods : {
      ...mapMutations({
        openMarketModal : 'market/openMarketModal',
        closeMarketModal : 'market/closeMarketModal',
        openNftModal : 'nft/openNftModal',
        setCurrentNft : 'nft/setCurrentNft'
      }),
      openNFTDetails(asset = null) {
        if (!asset) return;
        const currentNftName = `#${String(asset.letterTitleIndex).padStart(2, '0')} Letter ${asset.letter.toUpperCase()} \u2013 ${asset.name}`;
        this.setCurrentNft({
          tokenId : asset.letter,
          letterIndex : asset.letterIndex,
          name : currentNftName,
          previewImage : asset.image,
          previewVideo : asset.video,
          price : asset.price,
          sold : asset.sold,
          owner : asset.owner
        });
        this.openNftModal();
      },
      setRef(el) {
        if (el) {
          this.assetRefs.push(el);
        }
      },
      enterTimeline() {
        this.$nextTick(() => {
          this.tl = gsap.timeline();
          this.splitTl = gsap.timeline();
          this.splitTl.add(this.$refs.heading.play());
          this.splitTl.add(this.$refs.copy.play(), '<');
          this.tl.add(this.splitTl.play(), 0.2);
          const e = gsap.effects.fadeAndTransform(this.$refs.links, { duration : 0.5 });
          this.tl.add(e, '-=0.5');
          this.assetRefs.forEach((el, i) => {
            this.tl.add(el.enterTl(), 0.1 * i);
          });
        });
        // this.tl.add(this.timeline.play(), 0.5);
      },
      leaveTimeline() {
        this.tl.clear();
        this.tl.add(this.splitTl.reverse(-0.6));
        const e = gsap.effects.fadeAndTransform(this.$refs.links, { duration : 0.7, yFrom : 0, yTo : 40, opacityFrom : 1, opacityTo : 0 });
        this.tl.add(e);
        this.assetRefs.forEach((el) => {
          this.tl.add(el?.leaveTl(), 1);
        });
        return this.tl.timeScale(3).play();
      }
    }
  };
</script>

<style lang="scss">
  $gap: 20px;

  .Market {
    height: 101%;
    width: 100%;
    padding-top: 180px;
    padding-left: $nav-padding-horizontal;
    padding-right: $nav-padding-horizontal;
    @include breakpoint($phone) {
      padding-top: 120px;
      padding-left: $nav-padding-horizontal-mobile;
      padding-right: $nav-padding-horizontal-mobile;
      overflow-y: scroll;
    }
    &__header {
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      @include breakpoint($mobile) {
        flex-direction: column;
        align-items: flex-start;
      }
      &-title {
        @include gosha(64);
        margin-bottom: 0;
        @include breakpoint($mobile) {
          @include gosha(36);
          margin-bottom: 20px;
        }
      }
      &--font {
        @include fk-grotesk-neue-regular(14, 0, math.div(22, 14));
      }
      &-description {
        @include fk-grotesk-neue-regular(14, 0, math.div(22, 14));
        width: 100%;

        &--right {
          width: 45%;
          max-width: 600px;
          @include breakpoint($mobile) {
            width: 100%;
          }
        }
      }
    }
    &__link-bar {
      display: flex;
      margin-top: px(40);
      position: relative;
      pointer-events: auto;
      cursor: pointer;
      a {
        position: relative;
        @include fk-grotesk-neue-regular(18, 0, 1.2);
        white-space: nowrap;
        margin-right: px(30);
        @include animated-underline;
        padding-bottom: 8px;
      }
    }
    &__heading {
      width: 100%;
      text-align: center;
      padding-top: 100px;
      padding-bottom: 100px;
      margin-bottom: 0;
      color: $white;
      background-color: $black;
    }

    &__container {
      width: 100%;
      padding-top: 50px;
      padding-bottom: 50px;

      &-items {
        width: 100%;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        row-gap: $gap;
        column-gap: $gap;
        justify-content: center;
        flex-wrap: wrap;
        list-style-type: none;
        @include breakpoint($desktop-narrow) {
          grid-template-columns: 1fr 1fr 1fr;
        }
        @include breakpoint($tablet) {
          grid-template-columns: 1fr 1fr;
        }
        @include breakpoint($phone) {
          grid-template-columns: 1fr;
        }
      }
    }
  }
</style>
