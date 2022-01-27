<template>
  <div class="NonFunctionals">
    <BuildInformation class="NonFunctionals__child-component" />
    <RotateDevice
      v-if="showRotateDevice"
      class="NonFunctionals__child-component"
    />
    <WindowTooSmall
      v-if="windowTooSmall"
      class="NonFunctionals__child-component"
    />
    <Unsupported
      v-if="unsupported"
      class="NonFunctionals__child-component"
    />
  </div>
</template>

<script>
  import BuildInformation from '~/src/components/NonFunctionals/BuildInformation/BuildInformation';
  import RotateDevice from '~/src/components/NonFunctionals/RotateDevice/RotateDevice';
  import WindowTooSmall from '~/src/components/NonFunctionals/ScreenTooSmall/ScreenTooSmall';
  import Unsupported from '~/src/components/NonFunctionals/Unsupported/Unsupported';

  export default {
    name : 'NonFunctionals',
    components : {
      BuildInformation,
      RotateDevice,
      WindowTooSmall,
      Unsupported
    },
    props : {
      showRotateDevice : {
        type : Boolean,
        required : true
      },
      windowTooSmall : {
        type : Boolean,
        required : true
      },
      unsupported : {
        type : Boolean,
        required : true
      }
    }
  };
</script>

<style lang="scss">

  .NonFunctionals {
    @include full-size(fixed);
    z-index: 100000;
    background-color: rgba($white, 0);
    pointer-events: none;
    &__child-component {
      pointer-events: all;
    }
  }

</style>
