<template>
  <div class="GlobalLoader">
    <div v-if="isActive" class="GlobalLoader__bg" />

    <transition name="fade">
      <LetterLoader
        class="GlobalLoader__overlay"
        :is-loading="isActive"
      />
    </transition>
  </div>
</template>

<script>
  import LetterLoader from '@components/LetterLoader/LetterLoader.vue';

  export default {
    name : 'GlobalLoader',
    components : { LetterLoader },
    props : {
      isActive : {
        type : Boolean,
        default : true,
        required : true
      }
    },
    mounted() {
      //
    },
    created() {
      //
    },
    methods : {
      //
    }
  };
</script>

<style lang="scss">

  .GlobalLoader {

    &__bg {
      @include full-size;
      z-index: 10;
      background-color: black;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &__overlay {
      @include full-size;
      z-index: 10;
      background-color: black;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &__temp {
      // position: absolute;
      // left: 30px;
      // top: 30px;
      color: white;
    }
  }

</style>
