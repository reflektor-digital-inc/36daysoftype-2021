<template>
  <div
    ref="app"
    class="App"
    @touchmove="onTouchMove"
  >
    <router-view
      v-slot="{ Component }"
    >
      <component
        :is="Component"
        ref="sectionView"
        :key="$route.name"
        class="vue-router__section"
      />
    </router-view>
    <OverlayUI />
  </div>
</template>

<script>
  import appBase from '@mixins/app-base';
  import fetchNftAssets from '@mixins/fetch-nft-assets';
  import OverlayUI from '@components/OverlayUI/OverlayUI.vue';
  import { mapMutations, mapState } from 'vuex';
  import gsap from 'gsap';
  import { FADE_AND_TRANSFORM, SPLIT_LINES } from '@settings/settings.effects';

  export default {
    components : { OverlayUI },
    mixins : [appBase, fetchNftAssets],
    computed : {
      ...mapState({
        hasLoaded : state => state.loader.hasLoaded
      })
    },
    watch : {
      hasLoaded() {
        // alert();
      }
    },
    beforeMount() {
      const unlockedEasterEgg = this.$cookies.get('unlockedLetters');
      if (unlockedEasterEgg) this.updateUnlockStatus(unlockedEasterEgg);
      gsap.registerEffect(FADE_AND_TRANSFORM);
      gsap.registerEffect(SPLIT_LINES);
    },
    mounted() {
      this.$refs.app.touch;
    },
    methods : {
      ...mapMutations({
        updateUnlockStatus : 'easterEgg/updateUnlockStatus'
      }),
      onTouchMove(e) {
        e.preventDefault();
      }
    }
  };
</script>

<style lang="scss">
:root {
  --tp-folder-foreground-color: #fff;
  --tp-label-foreground-color: #fff;
}

.tp-dfwv {
  width: 320px !important;
}

.tp-rotv {
  opacity: 0.8;
  overflow-y: scroll;
  max-height: 98vh;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }
  &:hover {
    opacity: 1;
  }
}

.vue-router__section {
  width: 100%;
  height: 100%;
}

.App {
  width: 100%;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
}
</style>
