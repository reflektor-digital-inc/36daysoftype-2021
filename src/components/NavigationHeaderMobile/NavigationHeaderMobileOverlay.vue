<template>
  <div
    class="NavigationHeaderMobileOverlay"
  >
    <router-link
      to="/"
      class="NavigationHeaderMobileOverlay__link"
      @click="linkOnclick"
    >
      Home
    </router-link>
    <router-link
      to="/about"
      class="NavigationHeaderMobileOverlay__link"
      @click="linkOnclick"
    >
      About
    </router-link>
    <a
      class="NavigationHeaderMobileOverlay__link"
      @click="handleLettersClick"
    >
      Letters
    </a>
    <router-link
      to="/contact"
      class="NavigationHeaderMobileOverlay__link"
      @click="linkOnclick"
    >
      Contact
    </router-link>
    <router-link
      to="/market"
      class="NavigationHeaderMobileOverlay__link"
      @click="linkOnclick"
    >
      NFT Collection
    </router-link>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';

  export default {
    name : 'NavigationHeaderMobileOverlay',
    methods : {
      ...mapMutations({
        closeNavigationOverlay : 'overlays/closeNavigationOverlay'
      }),
      linkOnclick() {
        this.closeNavigationOverlay();
      },
      handleLettersClick() {
        this.linkOnclick();
        if (!this.$route.path.includes('letter')) {
          this.$router.push('/letter/a');
        }
      }
    }
  };
</script>

<style lang="scss">
  .NavigationHeaderMobileOverlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    pointer-events: auto;
    background-color: $black;
    color: white;
    z-index: 10;
    &__link {
      z-index: 12;
      margin-bottom: calc-vh(50, 667);
    }
  }
</style>
