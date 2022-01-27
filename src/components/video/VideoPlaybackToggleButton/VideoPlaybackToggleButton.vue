<template>
  <GenericButton
    :label="label"
    :class="rootElClasses"
  >
    <slot name="icon">
      <IconPlay
        v-if="!isVideoPlaying"
        class="VideoPlaybackToggleButton
        VideoPlaybackToggleButton__icon
        VideoPlaybackToggleButton__icon--play"
      />
      <IconPause
        v-else
        class="VideoPlaybackToggleButton
        VideoPlaybackToggleButton__icon
        VideoPlaybackToggleButton__icon--pause"
      />
    </slot>
  </GenericButton>
</template>

<script>
  import IconPause from '@assets/svgs/icon-pause.svg';
  import IconPlay from '@assets/svgs/icon-play.svg';
  import GenericButton from '@components/GenericButton/GenericButton';

  export default {
    name : 'VideoPlaybackToggleButton',
    components : {
      GenericButton,
      IconPause,
      IconPlay
    },
    props : {
      label : {
        type : String,
        default : ''
      },
      isVideoPlaying : {
        type : Boolean,
        required : true
      }
    },
    computed : {
      rootElClasses() {
        return `VideoPlaybackToggleButton
        VideoPlaybackToggleButton--${this.isVideoPlaying ? 'playing' : 'paused'}`;
      }
    }
  };
</script>

<style lang="scss">

  .VideoPlaybackToggleButton {
    @include no-select;
    &__icon {
      height: auto;
      width: 12px;
      .global__theme--dark & {
        stroke: $white;
        fill: $white;
      }
      .global__theme--light & {
        stroke: $black;
        fill: $black;
      }
    }
  }

</style>
