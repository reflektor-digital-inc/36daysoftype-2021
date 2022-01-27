<template>
  <div class="InfoIcons">
    <button class="InfoIcons__icon-container" @click="handleAboutClick">
      <AboutIcon
        :height="50"
        class="InfoIcons__icon-svg"
      />
    </button>
    <button class="InfoIcons__icon-container" @click="handleSourceClick">
      <SourceIcon
        :height="50"
        class="InfoIcons__icon-svg"
      />
    </button>
    <button class="InfoIcons__icon-container" @click="handleDownloadClick">
      <DownloadIcon
        :height="50"
        class="InfoIcons__icon-svg"
      />
    </button>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  import AboutIcon from '@assets/svgs/ui/about.svg';
  import SourceIcon from '@assets/svgs/ui/source.svg';
  import DownloadIcon from '@assets/svgs/ui/download.svg';

  export default {
    name : 'InfoIcons',
    components : {
      AboutIcon,
      SourceIcon,
      DownloadIcon
    },
    mounted() {
      //
    },
    created() {
      //
    },
    methods : {
      ...mapMutations({
        openAboutModal : 'modal/openAboutModal'
      }),
      handleAboutClick() {
        this.openAboutModal();
      },
      handleSourceClick() {
        console.info('source');
      },
      handleDownloadClick() {
        console.info('download');
      }
    }
  };
</script>

<style lang="scss">
  $icon-size: 26px;

  .InfoIcons {
    position: absolute;
    right: 6px;
    top: 168px;
    /* height: 100%; */
    width: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &__icon-container {
      box-sizing: content-box;
      margin: 6px 0;
      padding: 5px;
      border: 2px solid $white;
      width: $icon-size;
      height: $icon-size;
      border-radius: 50%;
      background: none;
      cursor: pointer;
      opacity: 1;

      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;

      transition: opacity 0.3s;
      &:hover {
        opacity: 0.5;
      }
    }
    &__icon-svg {
      transform: scale(0.8);
    }
  }
</style>
