<template>
  <div class="AboutModal">
    <transition name="fade">
      <div class="AboutModal__overlay">
        <AboutContent />
        <!-- <button class="AboutModal__exit" @click="closeAboutModal">
          X
        </button> -->
      </div>
    </transition>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  import AboutContent from '@components/AboutContent/AboutContent.vue';

  export default {
    name : 'AboutModal',
    components : { AboutContent },
    props : {
      isActive : {
        type : Boolean,
        required : true
      }
    },

    methods : {
      ...mapMutations({
        closeAboutModal : 'modal/closeAboutModal'
      })
    }
  };
</script>

<style lang="scss">

  .AboutModal {
    &__overlay {
      @include full-size;
      z-index: 8;
      background-color: black;
      overflow-y: scroll;
      pointer-events: auto;
    }
    &__exit {
      @include button-no-styles;
      position: fixed;
      z-index: 12;
      right: 25px;
      top: 10px;
      box-sizing: content-box;
      margin: 6px 0;
      padding: 5px;
      border: 2px solid $white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: none;
      cursor: pointer;
      opacity: 1;
      color: white;
      font-size: 20px;

      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;

      transition: opacity 0.3s;
      &:hover {
        opacity: 0.5;
      }
    }
  }

</style>
