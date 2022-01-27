<template>
  <GenericButton
    :label="label"
    :class="rootElClasses"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot name="icon">
      <svg
        ref="icon"
        viewBox="0 0 20 17"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        preserveAspectRatio="xMidYMid meet"
        class="VideoSoundToggleButton__icon"
      >
        <g
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <g
            transform="translate(-152.000000, -959.000000)"
            stroke="#FFFFFF"
          >
            <g transform="translate(152.176825, 959.000000)">
              <polygon
                class="VideoSoundToggleButton__icon-speaker"
                points="9.499 16.487 2.003 12.5 0.5 12.5 0.5 4.5 3.502 4.5 9.499 0.512"
              />
              <path
                v-for="path of paths"
                ref="volumeLines"
                :key="path.d"
                v-bind="path"
                class="VideoSoundToggleButton__icon-volume-lines"
              />
            </g>
          </g>
        </g>
      </svg>
    </slot>
  </GenericButton>
</template>

<script>
  import GenericButton from '@components/GenericButton/GenericButton';

  export default {
    name : 'VideoSoundToggleButton',
    components : { GenericButton },
    props : {
      label : {
        type : String,
        default : ''
      },
      isVideoMuted : {
        type : Boolean,
        required : true
      },
      isVideoPlaying : {
        type : Boolean,
        required : true
      }
    },
    computed : {
      rootElClasses() {
        return `VideoSoundToggleButton
        VideoSoundToggleButton--${this.isVideoMuted ? 'muted' : 'sound-active'}`;
      }
    },
    watch : {
      isVideoPlaying : {
        handler(playing) {
          if (playing) {
            (this.isVideoMuted ? this.playSoundOffAnimation() : this.playSoundOnAnimation());
          }
          else {
            this.pauseAllAnimations();
          }
        }
      },
      isVideoMuted : {
        handler(muted) {
          (muted ? this.playSoundOffAnimation() : this.playSoundOnAnimation());
        }
      }
    },
    created() {
      // SVG paths that represent volume lines. Ordered from left to right.
      this.paths = [
        {
          d : 'M12.5,5 L12.5,12'
        },
        {
          d : 'M15.5,3 L15.5,14'
        },
        {
          d : 'M18.5,1 L18.5,16'
        }
      ];
    },
    mounted() {
      this.createSoundOnTimeline();
      this.createSoundOffTimeline();
    },
    beforeUnmount() {
      if (this.soundOnTimeline) {
        this.soundOnTimeline.kill();
        this.soundOnTimeline = null;
      }
      if (this.soundOffTimeline) {
        this.soundOffTimeline.kill();
        this.soundOffTimeline = null;
      }
    },
    methods : {
      pauseAllAnimations() {
        if (this.soundOnTimeline) {
          this.soundOnTimeline
            .pause()
            .seek(this.isVideoMuted ? 0 : 'end');
        }
        if (this.soundOffTimeline) {
          this.soundOffTimeline
            .pause()
            .seek(this.isVideoMuted ? 'end' : 0);
        }
      },
      playSoundOnAnimation() {
        (!this.soundOnTimeline && this.createSoundOnTimeline());
        if (this.soundOffTimeline && this.soundOffTimeline.isActive()) {
          this.soundOffTimeline.pause('end', false);
        }
        this.soundOnTimeline.play(0);
      },
      playSoundOffAnimation() {
        (!this.soundOffTimeline && this.createSoundOffTimeline());
        if (this.soundOnTimeline && this.soundOnTimeline.isActive()) {
          this.soundOnTimeline.pause('end', false);
        }
        this.soundOffTimeline.play(0);
      },
      createSoundOnTimeline() {
        const { volumeLines } = this.$refs;
        this.soundOnTimeline = new TimelineMax({
          repeat : -1,
          paused : true
        });
        this.soundOnTimeline
          .staggerFromTo(volumeLines, 0.5, { autoAlpha : 0 }, {
            autoAlpha : 1,
            ease : Sine.easeOut
          }, 0.3)
          .addLabel('end');

        (!this.isVideoMuted && this.soundOnTimeline.play());
      },
      createSoundOffTimeline() {
        const { volumeLines } = this.$refs;
        this.soundOffTimeline = new TimelineMax({ paused : true });
        this.soundOffTimeline
          .staggerFromTo(volumeLines.reverse(), 0.5, { autoAlpha : 1 }, {
            autoAlpha : 0,
            ease : Sine.easeIn
          }, 0.3)
          .addLabel('end');

        (this.isVideoMuted && this.soundOffTimeline.play());
      },
      handleMouseEnter() {
        (this.isVideoMuted ? this.playSoundOnAnimation() : this.playSoundOffAnimation());
      },
      handleMouseLeave() {
        if (this.isVideoPlaying) {
          (this.isVideoMuted ? this.playSoundOffAnimation() : this.playSoundOnAnimation());
        }
        else {
          this.pauseAllAnimations();
        }
      }
    }
  };
</script>

<style lang="scss">

  .VideoSoundToggleButton {
    @include no-select;
    &__icon {
      height: auto;
      width: 20px;
    }
    &__icon-volume-lines {
      opacity: 0;
    }
    &__icon, &__icon-speaker, &__icon-volume-lines {
      .global__theme--dark & {
        stroke: $white;
      }
      .global__theme--light & {
        stroke: $black;
      }
    }
  }
</style>
