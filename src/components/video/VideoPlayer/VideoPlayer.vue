<template>
  <div
    :class="rootElClasses"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseEnter"
  >
    <ResizeObserver @notify="handleResize" />
    <div
      ref="contentWrapper"
      class="VideoPlayer__content-wrapper"
    >
      <ResizeObserver @notify="handleResize" />
      <div
        ref="mediaContainer"
        class="VideoPlayer__media-content-container"
      >
        <VerticalSpacer :height="670/1190*100" />
        <video
          ref="video"
          v-bind="playerOptions"
          class="VideoPlayer__video-element"
          @loadedmetadata="handleVideoReady"
          @click="handleVideoClick"
          @play="handleVideoPlaybackStart"
        />
      </div>
      <div
        v-if="!$device.isTouch"
        :class="controlsContainerClasses"
      >
        <!-- PLAY/PAUSE -->
        <VideoPlaybackToggleButton
          :is-video-playing="isPlaying"
          class="VideoPlayer__play-pause-button VideoPlayer__button"
          @click="handlePlayPauseToggle"
        />
        <!-- PROGRESS + SCRUBBER + DURATION DISPLAY -->
        <VideoProgressBar
          :video-duration="videoDuration"
          :video-current-time="videoCurrentTime"
          :video-progress="videoProgress"
          class="VideoPlayer__progress-bar"
          @update:video-current-time="handleProgressBarTimeUpdate"
        />
        <!-- SOUND -->
        <VideoSoundToggleButton
          :is-video-muted="isMuted"
          :is-video-playing="isPlaying"
          class="VideoPlayer__volume-toggle-button VideoPlayer__button"
          @click="handleVolumeToggle"
        />
        <!-- FULLSCREEN -->
        <VideoFullScreenToggleButton
          :is-video-full-screen="isFullScreen"
          class="VideoPlayer__full-screen-toggle-button VideoPlayer__button"
          @click="toggleFullScreen"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import AspectFill       from 'aspect-fill';
  import { mapState }     from 'vuex';
  import VideoPlaybackToggleButton
    from '@components/VideoPlaybackToggleButton/VideoPlaybackToggleButton';
  import VideoSoundToggleButton
    from '@components/VideoSoundToggleButton/VideoSoundToggleButton';
  import VideoFullScreenToggleButton
    from '@components/VideoFullScreenToggleButton/VideoFullScreenToggleButton';
  import VideoProgressBar from '@components/VideoProgressBar/VideoProgressBar';
  import { noop }         from '@utils/basic-functions';
  import IntersectionHelper from '@utils/IntersectionHelper';

  // NOTE 2019-04-16 andrewkim: Uncomment when using storybook
  // import '../../modernizr/modernizr';

  export default {
    name : 'VideoPlayer',
    components : {
      VideoProgressBar,
      VideoFullScreenToggleButton,
      VideoSoundToggleButton,
      VideoPlaybackToggleButton
    },
    props : {
      videoSource : {
        type : String,
        required : true
      },
      videoOptions : {
        type : Object,
        default : () => ({})
      },
      imageSource : {
        type : String,
        default : ''
      }
    },
    data() {
      return {
        videoStyles : {},
        videoProgress : 0,
        videoDuration : 0,
        videoCurrentTime : 0,
        videoPlay : false,
        isFullScreen : false,
        isPlaying : false,
        isMuted : true,
        displayControls : false
      };
    },
    computed : {
      ...mapState({
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      }),
      playerOptions() {
        const defaultOptions = {
          autoplay : true,
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
        let classes = 'VideoPlayer';
        if (this.isFullScreen) {
          classes += ' VideoPlayer--full-screen';
        }
        return classes;
      },
      controlsContainerClasses() {
        return [
          'VideoPlayer__media-controls-container',
          `VideoPlayer__media-controls-container--${this.displayControls ? 'visible' : 'hidden'}`
        ];
      }
    },
    watch : {
      videoPlay() {
        const { video } = this.$refs;
        this.videoPlay ? video.play() : video.pause();
        this.isPlaying = this.videoPlay;
      }
    },
    mounted() {
      this.videoLoop = setInterval(this.handleVideoUpdate, 100);
      this.videoPlay = this.playerOptions.autoplay;
      this.isMuted   = this.playerOptions.muted;
      this.$nextTick(() => {
        this.fullScreenChangeEventName = this.getFullScreenChangeEventName();
        this.$el.addEventListener(this.fullScreenChangeEventName, this.handleFullScreenChange);

        this.intersectionHelper = new IntersectionHelper({
          element : this.$el,
          elementHeight : this.$el.offsetHeight,
          windowHeight : this.windowHeight,
          threshold : 0.5,
          cb : this.handleIntersection
        });
        this.intersectionHelper.observe();
      });
    },
    beforeUnmount() {
      this.$el.removeEventListener(this.fullScreenChangeEventName, this.handleFullScreenChange);

      (this.intersectionHelper && this.intersectionHelper.destroy());

      this.stopControlsTimeout();

      if (this.videoLoop) {
        clearInterval(this.videoLoop);
        this.videoLoop = null;
      }
    },
    methods : {
      handleIntersection(entry) {
        this.videoPlay = entry.isIntersecting;
      },
      startControlsTimeout() {
        this.stopControlsTimeout();
        this.controlsTimeout = setTimeout(() => {
          this.displayControls = false;
        }, 1500);
      },
      stopControlsTimeout() {
        (this.controlsTimeout && clearTimeout(this.controlsTimeout));
      },
      handleMouseEnter() {
        this.displayControls = true;
        this.startControlsTimeout();
      },
      handleMouseLeave() {
        this.displayControls = false;
        this.stopControlsTimeout();
      },
      handleVolumeToggle() {
        const { video } = this.$refs;
        this.isMuted    = video.muted = !this.isMuted;
      },
      handleResize() {
        if (this.videoEl) this.resizeVideo();
      },
      handleVideoUpdate() {
        const { video }                 = this.$refs;
        const { currentTime, duration } = video;

        if (currentTime && duration) {
          this.videoProgress    = currentTime / duration;
          this.videoCurrentTime = this.$padNumberToString(currentTime.toFixed(2));
        }
      },
      handleVideoReady(event) {
        this.videoEl       = event.target;
        this.videoDuration = this.$padNumberToString(this.videoEl.duration.toFixed(2));

        const { videoHeight, videoWidth } = this.videoEl;
        this.videoWidth                   = videoWidth;
        this.videoHeight                  = videoHeight;

        this.videoPlay = this.playerOptions.autoplay;

        this.resizeVideo();
      },
      handleVideoPlaybackStart() {
        this.displayControls = true;
        this.startControlsTimeout();
      },
      handleVideoClick() {
        this.toggleVideoPlayback();
      },
      handlePlayPauseToggle() {
        this.toggleVideoPlayback();
      },
      toggleVideoPlayback() {
        this.videoPlay = !this.videoPlay;
      },
      handleProgressBarTimeUpdate(currentTime) {
        this.videoEl.currentTime = currentTime;
      },
      handleFullScreenChange(event) {
        this.isFullScreen = (event.target.offsetHeight >= this.windowHeight);
      },
      getEnterFullScreen(element) {
        return (
          element.requestFullscreen ||
          element.webkitRequestFullscreen ||
          element.webkitRequestFullScreen ||
          element.msRequestFullscreen ||
          element.mozRequestFullScreen ||
          noop
        );
      },
      exitFullScreen() {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        }
      },
      getFullScreenChangeEventName() {
        switch (this.$ua.browser.name.toLowerCase()) {
          case 'safari':
          case 'mobile safari':
            return 'webkitfullscreenchange';
          case 'edge':
          case 'ie':
            return 'msfullscreenchange';
          case 'firefox':
            return 'mozfullscreenchange';
          default:
            return 'fullscreenchange';
        }
      },
      async toggleFullScreen() {
        try {
          if (this.isFullScreen) {
            this.exitFullScreen();
          }
          else {
            const requestFullScreen = this.getEnterFullScreen(this.$el);
            await requestFullScreen.call(this.$el);
          }
        }
        catch (error) {
          console.error('Fullscreen Toggle Error:', error);
        }
      },
      resizeVideo() {
        if (Modernizr && Modernizr.objectfit) return;

        const { mediaContainer }                                         = this.$refs;
        const { offsetWidth : targetWidth, offsetHeight : targetHeight } = mediaContainer;

        const { width, height } = AspectFill(
          this.videoWidth,
          this.videoHeight,
          targetWidth,
          targetHeight
        );

        this.videoEl.style.width  = `${width}px`;
        this.videoEl.style.height = `${height}px`;
      }
    }
  };
</script>

<style lang="scss">

  .VideoPlayer {
    position: relative;
    width: 100%;
    height: auto;
    margin: 0 auto;
    .browser__name--safari & {
      &:-webkit-full-screen {
        @include full-size(fixed);
        transform-origin: 50% 50%;
      }
    }
    &--full-screen {
      height: 100%;
      cursor: auto;
    }
    &__content-wrapper {
      width: 100%;
      overflow: hidden;
      .VideoPlayer--full-screen & {
        height: 100%;
      }
    }
    &__video-element {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    &__media-content-container {
      position: relative;
      width: 100%;
      overflow: hidden;
      z-index: 1;
      .VideoPlayer--full-screen & {
        /*height: calc(100% - #{$controls-container-height});*/
        height: 100%;
      }
    }
    &__media-controls-container {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: $controls-container-height;
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      z-index: 2;
      &--visible {
        transition: transform 0.5s $easeOutQuad, opacity 0.7s $easeOutSine;
        opacity: 1;
        transform: translateY(0);
      }
      &--hidden {
        transition: transform 0.5s $easeInQuad, opacity 0.3s $easeInSine;
        opacity: 0;
        transform: translateY(100%);
      }
      .global__theme--dark & {
        background-color: rgba($black, 1);
      }
      .global__theme--light & {
        background-color: rgba($white, 1);
      }
    }
    &__button {
      color: $white;
      position: relative;
      flex-grow: 0;
      flex-shrink: 0;
      width: $button-width;
      height: 100%;
      transition: background-color 0.5s $easeInSine;
      border-radius: 0;
      cursor: none;
      .VideoPlayer--full-screen & {
        cursor: pointer;
      }
      .global__theme--dark & {
        background-color: rgba($black, 1);
      }
      .global__theme--light & {
        background-color: rgba($white, 1);
      }
      &:active {
        transition: background-color 0.5s $easeOutSine;
        .global__theme--dark & {
          background-color: rgba($black, 0.5);
        }
        .global__theme--light & {
          background-color: rgba($white, 0.5);
        }
      }
    }
    &__play-pause-button {
      border-right: 1px solid rgba($white, 0.1);
    }
    &__progress-bar {
      flex: 1 1 80%;
      cursor: none;
      .VideoPlayer--full-screen & {
        cursor: pointer;
      }
    }
    &__volume-toggle-button {
      border-left: 1px solid rgba($white, 0.1);
      border-right: 1px solid rgba($white, 0.1);
    }
    &__full-screen-toggle-button {
      border-right: 1px solid rgba($white, 0.1);
    }
  }

</style>
