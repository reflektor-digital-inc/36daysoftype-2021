<template>
  <div class="GradientText" :style="textStyles">
    {{ text }}
  </div>
</template>

<script>

  export default {
    name : 'GradientText',
    props : {
      text : { // v-model or :value passed down from parent
        type : String,
        default : '',
        required : true
      }
    },
    computed : {
      textStyles() {
        const randomDelay = Math.floor(Math.random() * 5);
        return {
          'animation-delay' : `-${randomDelay}s`
        };
      }
    }
  };
</script>

<style lang="scss">
  .GradientText {
    background-image: url('@assets/textures/gradient_background.png');
    background-size: 300%;
    background-position: 0% 0%;
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
    animation: gradient 5s linear infinite;
    animation-delay: -3s;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 0%;
    }
    25% {
      background-position: 50% 50%;
    }
    50% {
      background-position: 100% 100%;
    }
    75% {
      background-position: 50% 25%;
    }
    100% {
      background-position: 0% 0%;
    }
  }
</style>
