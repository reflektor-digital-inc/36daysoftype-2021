<template>
  <div
    :class="rootElClasses"
    @click="handleElClick"
  >
    <ResizeObserver @notify="handleResize" />
    <video
      ref="video"
      v-bind="playerOptions"
      class="BasicVideoPlayer__video"
      @canplay="handleVideoReady"
      @play="handlePlayState"
      @ended="handleMediaStopped"
      @stalled="handleMediaStopped"
      @pause="handleMediaStopped"
    />
    <transition name="fade">
      <div
        v-show="!isPlaying"
        class="BasicVideoPlayer__play-button"
        @click="handlePlayButtonClick"
      />
    </transition>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import AspectFill from 'aspect-fill';

  export default {
    name : 'BasicVideoPlayer',
    props : {
      videoSource : {
        type : String,
        required : true
      },
      videoOptions : {
        type : Object,
        default : () => ({})
      }
    },
    data() {
      return {
        isPlaying : false
      };
    },
    computed : {
      ...mapState({
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      }),
      playerOptions() {
        const defaultOptions = {
          autoplay : false,
          volume : 0.75,
          src : this.videoSource,
          muted : true,
          playsinline : true,
          loop : true,
          controls : this.$device.isTouch
        };
        return {
          ...defaultOptions,
          ...this.videoOptions,
          style : this.videoStyles
        };
      },
      rootElClasses() {
        return [
          'BasicVideoPlayer',
          {
            'BasicVideoPlayer--playing' : this.isPlaying,
            'BasicVideoPlayer--paused' : !this.isPlaying
          }
        ];
      }
    },
    created() {
      this.videoReady = false;
    },
    methods : {
      handleMediaStopped() {
        this.isPlaying = false;
      },
      handlePlayButtonClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.playVideo();
      },
      handleElClick() {
        this.pauseVideo();
      },
      handlePlayState() {
        this.isPlaying = true;
      },
      async playVideo() {
        try {
          const { video } = this.$refs;
          if (this.videoReady && video) {
            await video.play();
          }
        }
        catch (error) {
          console.error('Video Play Error:', error);
        }
      },
      async pauseVideo() {
        try {
          const { video } = this.$refs;
          if (this.videoReady && video && this.isPlaying) {
            await video.pause();
          }
        }
        catch (error) {
          console.error('Video Pause Error:', error);
        }
      },
      async handleVideoPlaybackStart() {
        try {
          const { video } = this.$refs;
          if (this.videoReady && video && !this.isPlaying) {
            await video.play();
            this.isPlaying = true;
          }
        }
        catch (error) {
          console.error('handleVideoPlaybackStart error:', error);
          this.isPlaying = false;
        }
      },
      handleVideoReady(event) {
        const videoEl = event.target;
        const { videoHeight, videoWidth } = videoEl;
        this.videoWidth = videoWidth;
        this.videoHeight = videoHeight;

        this.videoReady = true;

        this.resizeVideo();
      },
      handleResize() {
        const { video } = this.$refs;
        if (video) this.resizeVideo();
      },
      resizeVideo() {
        if (Modernizr && Modernizr.objectfit) return;

        const { video } = this.$refs;
        const { offsetWidth : targetWidth, offsetHeight : targetHeight } = this.$el;

        const { width, height } = AspectFill(
          this.videoWidth,
          this.videoHeight,
          targetWidth,
          targetHeight
        );

        video.style.width = `${width}px`;
        video.style.height = `${height}px`;
      }
    }
  };
</script>

<style lang="scss">

  .BasicVideoPlayer {
    position: relative;
    width: 100%;
    height: 100%;
    video {
      width: 100%;
      height: 100%;
      z-index: 1;
      object-fit: cover;
    }
    &__play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      z-index: 2;
      border: 1px solid $white;
    }
  }

</style>
