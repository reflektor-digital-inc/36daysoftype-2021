<template>
  <div
    v-if="isLoading"
    ref="loader"
    class="LetterLoader__flip-container"
  >
    <div
      :style="{ transform: `scaleX(${angle})`}"
      class="LetterLoader__flipper"
    >
      <div class="LetterLoader__front">
        <span
          class="LetterLoader__loader-letter loader"
        >
          {{ frontLetter }}
        </span>
      </div>
      <div class="LetterLoader__back">
        <span
          class="LetterLoader__loader-letter loader"
        >
          {{ backLetter }}
        </span>
      </div>
    </div>
    <div class="LetterLoader__box" />
  </div>
</template>

<script>
  import _sample from 'lodash/sample';
  import { LETTERS_STRING } from '@settings/settings.ui';

  export default {
    name : 'LetterLoader',
    props : {
      isLoading : {
        type : Boolean,
        required : true
      }
    },
    data() {
      return {
        frontLetter : '',
        backLetter : '',
        angle : 0
      };
    },
    mounted() {
      this.runLoader();
      this.letterArray = LETTERS_STRING;
    },
    unmounted() {
      clearInterval(this.interval);
    },
    methods : {
      runLoader() {
        this.generateRandomLetter();
        this.interval = setInterval(() => {
          this.generateRandomLetter();
          this.rotateLetters();
        }, 500);
      },
      generateRandomLetter() {
        if (this.angle === 0) {
          this.backLetter = _sample(this.letterArray);
          while (this.frontLetter === this.backLetter) {
            this.backLetter = _sample(this.letterArray);
          }
        }
        else {
          this.frontLetter = _sample(this.letterArray);
          while (this.frontLetter === this.backLetter) {
            this.frontLetter = _sample(this.letterArray);
          }
        }
      },
      rotateLetters() {
        if (this.angle === 1) {
          this.angle = 0;
        }
        else {
          this.angle = 1;
        }
      }
    }
  };
</script>

<style lang="scss">
.LetterLoader {
  @mixin clip-frame($width, $height, $border) {
    -webkit-clip-path: polygon(
      0% 100%,
      $border 100%,
      $border $border,
      $width - $border $border,
      $width - $border $height - $border,
      $border $height - $border,
      $border 100%,
      100% 100%,
      100% 0%,
      0% 0%
    );
  }

  &__flip-container {
    @include fk-display-regular(80, 0, 1);
    color: $white;
    z-index: 500;
    perspective: 1000px;
    cursor: pointer;
    transform-style: preserve-3d;
  }
  &__flipper {
    transition: transform 0.5s $easeOutSine;
    transform-style: preserve-3d;
    position: relative;
  }
  &__front,
  &__back {
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    // background: inherit;
  }
  &__front {
    z-index: 2;
    transform: scaleX(0);
  }
  &__back {
    transform: scaleX(1);
  }
  &__loader-letter {
    @include center;
    display: inline-block;
    backface-visibility: hidden;
    background-size: 200% 200%;
    background-image: linear-gradient(135deg, #000 0%, #a021e6 20%, #fe6492 38.13%, #ce42bc 59.06%, #e290c0 72.08%, #bacdff 84.06%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-attachment: fixed;
  }
  &__box {
    @include center;
    position: absolute;
    width: 120px;
    height: 120px;
    animation: spin 4s $easeInOutSine infinite;
    transform-origin: top left;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #000 0%, #a021e6 20%, #fe6492 38.13%, #ce42bc 59.06%, #e290c0 72.08%, #bacdff 84.06%);
    @include clip-frame(120px, 120px, 2px);
    background-size: 200% 200%;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg) translate(-50%, -50%);
    }
    to {
      transform: rotate(360deg) translate(-50%, -50%);
    }
  }
}

</style>
