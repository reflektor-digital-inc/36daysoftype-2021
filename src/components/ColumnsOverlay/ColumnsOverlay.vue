<template>
  <div class="ColumnsOverlay">
    <div class="global__common-center-container ColumnsOverlay__columns-wrapper">
      <div
        v-for="column of columns"
        :key="column"
        class="ColumnsOverlay__column"
      />
    </div>
  </div>
</template>

<script>

  /**
   * @module ColumnsOverlay
   * @description This component will display a overlay on a page that displays columns and gutters.
   */
  import { mapGetters } from 'vuex';

  export default {
    name : 'ColumnsOverlay',
    computed : {
      ...mapGetters([
        'breakpointPhone'
      ]),
      columns() {
        return (this.breakpointPhone ? 20 : 40);
      }
    }
  };
</script>

<style lang="scss">

  .ColumnsOverlay {
    @include full-size(fixed);
    z-index: 10000;
    pointer-events: none;
    &__columns-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-flow: row nowrap;
    }
    &__column {
      background-color: rgba($white, 0.3);
      flex: 1 1 2.5%;
      height: 100%;
      &:nth-child(odd) {
        background-color: rgba($very-soft-red, 0.3);
      }
    }
  }

</style>
