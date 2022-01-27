<template>
  <div class="VideoProgressBar">
    <div
      ref="progressBarWrapper"
      class="VideoProgressBar__progress-bar-wrapper"
      @click="handleScrubberClick"
    >
      <div
        ref="progressBar"
        class="VideoProgressBar__progress-bar"
      />
      <div
        ref="scrubber"
        class="VideoProgressBar__progress-scrubber"
        @mousedown="handleScrubStart"
        @drag="handleScrubbing"
        @dragend="handleScrubEnd"
        @mouseup="handleScrubEnd"
      />
    </div>
    <div class="VideoProgressBar__video-time-container">
      <div class="VideoProgressBar__current-time">
        {{ videoCurrentTime }}
      </div>
      <span class="VideoProgressBar__time-separator">/</span>
      <div class="VideoProgressBar__total-time">
        {{ videoDuration }}
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name : 'VideoProgressBar',
    props : {
      videoCurrentTime : {
        type : [Number, String],
        required : true
      },
      videoDuration : {
        type : [Number, String],
        required : true
      },
      videoProgress : {
        type : Number,
        required : true
      }
    },
    watch : {
      videoProgress(progress) {
        const { progressBar, scrubber } = this.$refs;

        TweenMax.to(progressBar, 0.1, {
          transformOrigin : '0 0',
          scaleX : progress,
          force3D : true,
          ease : Sine.easeOut
        });

        TweenMax.to(scrubber, 0.1, {
          transformOrigin : '-50% 0',
          left : `${progress * 100}%`,
          force3D : true,
          ease : Sine.easeOut
        });
      }
    },
    created() {
      this.isScrubbing = false;
    },
    mounted() {
      document.addEventListener('mousemove', this.handleScrubbing);
      document.addEventListener('mouseup', this.handleScrubEnd);
    },
    beforeUnmount() {
      document.removeEventListener('mousemove', this.handleScrubbing);
      document.removeEventListener('mouseup', this.handleScrubEnd);
    },
    methods : {
      handleScrubChange(event) {
        const { progressBarWrapper } = this.$refs;
        const { x, width }           = progressBarWrapper.getBoundingClientRect();
        const offsetX                = (Math.max(0, event.clientX) - x) / width;
        const videoPlaybackPosition  = (Number.parseFloat(this.videoDuration) * offsetX);
        this.$emit('update:video-current-time', videoPlaybackPosition);
      },
      handleScrubStart(event) {
        if (event && event.clientX < 0) return;
        const targetIsScrubber = /(progress-scrubber)/.test(event.target.className);
        if (targetIsScrubber) {
          this.isScrubbing = true;
          this.videoPlay   = false;
          this.handleScrubChange(event);
        }
      },
      handleScrubbing(event) {
        if (!this.isScrubbing) return;
        if (event && event.clientX < 0) return;
        this.handleScrubChange(event);
      },
      handleScrubEnd() {
        if (this.isScrubbing && !this.videoPlay) {
          this.isScrubbing = false;
          this.videoPlay   = true;
        }
      },
      handleScrubberClick(event) {
        if (this.isScrubbing) return;
        const targetIsProgressBar = /(progress-bar-wrapper)/.test(event.target.className);
        if (targetIsProgressBar) {
          const { progressBarWrapper } = this.$refs;
          const videoPlaybackPosition  = (
            Number.parseFloat(this.videoDuration) *
            (event.offsetX / progressBarWrapper.offsetWidth)
          );
          this.$emit('update:video-current-time', videoPlaybackPosition);
        }
      }
    }
  };
</script>

<style lang="scss">

  .VideoProgressBar {
    position: relative;
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding: 0 40px;
    height: 100%;
    cursor: inherit;
    .global__theme--dark & {
      background-color: rgba($black, 1);
    }
    .global__theme--light & {
      background-color: rgba($white, 1);
    }
    &__progress-bar-wrapper {
      position: relative;
      width: 78%;
      height: 3px;
      flex-grow: 1;
      flex-shrink: 1;
      padding: 5px 0;
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 3px;
        pointer-events: none;
        z-index: 1;
        .global__theme--dark & {
          background-color: rgba($white, 0.1);
        }
        .global__theme--light & {
          background-color: rgba($black, 0.1);
        }
      }
    }
    &__progress-bar {
      position: absolute;
      top: 50%;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 3px;
      background: $purple-gradient;
      transform-origin: 0 0;
      transform: translateY(-50%) scaleX(0);
      pointer-events: none;
      z-index: 2;
    }
    &__progress-scrubber {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translate(-50%, -50%);
      width: 15px;
      height: 15px;
      z-index: 3;
      .global__theme--dark & {
        background-color: rgba($white, 1);
      }
      .global__theme--light & {
        background-color: rgba($black, 1);
      }
    }
    &__video-time-container {
      @include fk-display-regular(12, 0.72, 1);
      @include no-select;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      flex-grow: 0;
      flex-shrink: 0;
      margin-left: 24px;
    }
    &__current-time {
      .global__theme--dark & {
        color: rgba($white, 0.63);
      }
      .global__theme--light & {
        color: rgba($black, 0.63);
      }
    }
    &__time-separator {
      margin: 0 5px;
      .global__theme--dark & {
        color: rgba($white, 0.63);
      }
      .global__theme--light & {
        color: rgba($black, 0.63);
      }
    }
    &__total-time {
      .global__theme--dark & {
        color: $white;
      }
      .global__theme--light & {
        color: $black;
      }
    }
  }

</style>
