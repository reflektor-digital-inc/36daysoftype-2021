<template>
  <GenericButton
    :label="label"
    :class="rootElClasses"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot name="icon">
      <svg
        class="VideoFullScreenToggleButton__icon"
        viewBox="0 0 34 34"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <g
            transform="translate(-190.000000, -950.000000)"
            stroke="#FFFFFF"
          >
            <g transform="translate(190.176825, 951.000000)">
              <polygon
                opacity="0.102"
                points="0.5 0.499 32.499 0.499 32.499 32.5 0.5 32.5"
                class="VideoFullScreenToggleButton__icon-border"
              />
              <polyline
                ref="cornerTopLeft"
                class="VideoFullScreenToggleButton__icon-corner
                VideoFullScreenToggleButton__icon-corner--top-left"
                opacity="0.302"
                points="0.5 6.5 0.5 0.499 6.5 0.499"
              />
              <polyline
                ref="cornerTopRight"
                class="VideoFullScreenToggleButton__icon-corner
                VideoFullScreenToggleButton__icon-corner--top-right"
                opacity="0.302"
                points="32.499 6.5 32.499 0.499 26.5 0.499"
              />
              <polyline
                ref="cornerBottomRight"
                class="VideoFullScreenToggleButton__icon-corner
                VideoFullScreenToggleButton__icon-corner--bottom-right"
                opacity="0.302"
                points="32.499 26.5 32.499 32.5 26.5 32.5"
              />
              <polyline
                ref="cornerBottomLeft"
                class="VideoFullScreenToggleButton__icon-corner
                VideoFullScreenToggleButton__icon-corner--bottom-left"
                opacity="0.302"
                points="0.5 26.5 0.5 32.5 6.5 32.5"
              />
              <polygon
                points="13.5 13.5 19.5 13.5 19.5 19.5 13.5 19.5"
                class="VideoFullScreenToggleButton__icon-center-square"
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
    name : 'VideoFullScreenToggleButton',
    components : { GenericButton },
    props : {
      label : {
        type : String,
        default : ''
      },
      isVideoFullScreen : {
        type : Boolean,
        required : true
      }
    },
    computed : {
      rootElClasses() {
        return `VideoFullScreenToggleButton
        ${this.isVideoFullScreen && 'VideoFullScreenToggleButton--full-screen'}`;
      }
    },
    mounted() {
      const {
        cornerTopLeft,
        cornerTopRight,
        cornerBottomRight,
        cornerBottomLeft
      } = this.$refs;

      const movementVal = 75;
      const duration = 0.3;

      this.hoverAnimation = new TimelineMax({ paused : true });
      this.hoverAnimation
        .fromTo(cornerTopLeft, duration, { yPercent : 0, xPercent : 0 }, {
          yPercent : movementVal,
          xPercent : movementVal,
          ease : Quad.easeInOut
        })
        .fromTo(cornerTopRight, duration, { yPercent : 0, xPercent : 0 }, {
          yPercent : movementVal,
          xPercent : -movementVal,
          ease : Quad.easeInOut
        }, 0)
        .fromTo(cornerBottomRight, duration, { yPercent : 0, xPercent : 0 }, {
          yPercent : -movementVal,
          xPercent : -movementVal,
          ease : Quad.easeInOut
        }, 0)
        .fromTo(cornerBottomLeft, duration, { yPercent : 0, xPercent : 0 }, {
          yPercent : -movementVal,
          xPercent : movementVal,
          ease : Quad.easeInOut
        }, 0)
        .addLabel('end');
    },
    methods : {
      handleMouseEnter() {
        (this.isVideoFullScreen ? this.hoverAnimation.play() : this.hoverAnimation.reverse());
      },
      handleMouseLeave() {
        (this.isVideoFullScreen ? this.hoverAnimation.reverse() : this.hoverAnimation.play());
      }
    }
  };
</script>

<style lang="scss">

  .VideoFullScreenToggleButton {
    @include no-select;
    &__icon {
      width: 33px;
      height: auto;
    }
    &__icon, &__icon-corner, &__icon-center-square, &__icon-border {
      .global__theme--dark & {
        stroke: $white;
      }
      .global__theme--light & {
        stroke: $black;
      }
    }
  }

</style>
