<template>
  <div class="AudioPlayer">
    <button @click="handlePrevious">
      PREV
    </button>
    <button @click="handleNext">
      NEXT
    </button>
  </div>
</template>
<script>
  import { Howl } from 'howler';
  import DreamBells from '@assets/audio/Dream_Bells.ogg';

  export default {
    name : 'AudioPlayer',
    data() {
      return {
        playlist : [DreamBells],
        index : 0,
        howl : undefined
      };
    },
    computed : {
      //
    },
    mounted() {
      this.autoplay(0, this.playlist);
    },
    created() {
      //
    },
    methods : {
      autoplay(i, list) {
        this.index = i;
        this.howl?.unload();
        this.howl = new Howl({
          src : [list[i]],
          preload : true,
          onend : () => {
            if ((i + 1) === list.length) {
              this.autoplay(0, list);
            }
            else {
              this.autoplay(i + 1, list);
            }
          }
        });

        this.howl.play();
      },
      handlePrevious() {
        if (this.howl) {
          if (this.index === 0) {
            this.autoplay(this.playlist.length - 1, this.playlist);
          }
          else {
            this.autoplay(this.index - 1, this.playlist);
          }
        }
      },
      handleNext() {
        if (this.howl) {
          if (this.index === this.playlist.length - 1) {
            this.autoplay(0, this.playlist);
          }
          else {
            this.autoplay(this.index + 1, this.playlist);
          }
        }
      }
    }
  };
</script>

<style lang="scss">

  .AudioPlayer {
    z-index: 99999999999;
    position: absolute;
    bottom: 5%;
    right: 10%;
    transform: translate(-50%, -50%);
  }

</style>
