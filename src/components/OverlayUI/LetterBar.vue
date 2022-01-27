<template>
  <div
    class="LetterBar"
  >
    <div class="LetterBar__container">
      <transition name="fade">
        <SplitLines
          v-if="letterUnlocked"
          ref="unlockText"
          class="LetterBar__unlock-text"
        >
          <p>
            Easter Egg Found!
          </p>
        </SplitLines>
      </transition>
      <Icons
        class="LetterBar__icon LetterBar__icon-previous"
        @click="previousLetter"
      >
        <IconArrow class="LetterBar__icon-arrow" width="11" />
      </Icons>
      <router-link
        v-for="(letters, index) in letterData"
        :id="`LetterBar-${letters.char}`"
        :ref="letters.char"
        :key="letters.char"
        :to="letters.path"
        :class="['LetterBar__route', { 'LetterBar__route--unlocked' : unlockedLetters[letters.char] }]"
        @mouseover="onBarMouseover && onLetterMouseover(index)"
        @mouseout="onBarMouseleave"
      >
        <span>{{ letters.char }}</span>
      </router-link>

      <div
        ref="diamond"
        class="LetterBar__thumbnail"
        :style="{
          width : `${diamondSize + 6}px`,
          height : `${diamondSize + 6}px`
        }"
      >
        <div
          ref="diamondInner"
          class="LetterBar__thumbnail-image"
          :style="{
            width : `${diamondSize}px`,
            height : `${diamondSize}px`,
            backgroundImage : `url('/thumbnails/thumbnail_letters.png')`,
            backgroundPosition: `-${thumbnailPosition}px`
          }"
        />
      </div>
      <div
        ref="fxWrapper"
        class="LetterBar__thumbnail-fx-wrapper"
        :style="{
          width : `${diamondSize + 6}px`,
          height : `${diamondSize + 6}px`
        }"
      >
        <div
          ref="ring1"
          class="LetterBar__thumbnail-fx LetterBar__thumbnail-fx-ring"
          :style="{
            width : `${diamondSize - 38}px`,
            height : `${diamondSize - 38}px`
          }"
        />
        <div
          ref="ring2"
          class="LetterBar__thumbnail-fx LetterBar__thumbnail-fx-ring"
          :style="{
            width : `${diamondSize - 28}px`,
            height : `${diamondSize - 28}px`
          }"
        />
        <div
          ref="glow"
          class="LetterBar__thumbnail-fx LetterBar__thumbnail-fx-glow"
          :style="{
            width : `${diamondSize - 42}px`,
            height : `${diamondSize - 42}px`
          }"
        />
      </div>
      <Icons
        class="LetterBar__icon LetterBar__icon-next"
        @click="nextLetter"
      >
        <IconArrow class="LetterBar__icon-arrow" width="11" />
      </Icons>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  import { LETTERS_STRING } from '@settings/settings.ui';
  import gsap from 'gsap';
  import { audiospriteSpriteNames } from '@utils/AudiospriteAudioController.js';
  import IconArrow from '@assets/svgs/arrow.svg';
  import Icons from '@components/Icons/Icons.vue';
  import SplitLines from '@components/SplitLines/SplitLines.vue';

  export default {
    name : 'LetterBar',
    components : { Icons, IconArrow, SplitLines },
    data() {
      return {
        diamondSize : 180,
        thumbnailPosition : 0,
        closeTimeline : '',
        entered : false,
        transitionTimeout : '',
        letterBarHover : false,
        letterUnlocked : false,
        letterBarLocked : false
      };
    },
    computed : {
      ...mapState({
        unlockedLetters : state => state.easterEgg.letterUnlock,
        isLoading : state => state.loader.isLoading
      }),
      letterData() {
        const letterArray = LETTERS_STRING.split('');
        return letterArray.map(letter => ({
          path : `/letter/${letter.toLowerCase()}`,
          char : letter.toUpperCase()
        }));
      },
      letterIndex() {
        const i = LETTERS_STRING.indexOf(this.letter.toUpperCase());
        return i;
      },
      letter() {
        const path = this.$route.path;
        const letter = path.split('/')[2];
        return letter;
      },
      activeLetter() {
        const curLetter = this.letterData.filter(letter => letter.path === this.$route.path);
        const curLetterIndex = this.letterData.findIndex(letter => letter === curLetter[0]);
        return { curLetter, curLetterIndex };
      }
    },
    watch : {
      unlockedLetters : {
        deep : true,
        handler(val) {
          this.$nextTick(() => {
            this.handleLetterUnlock(val);
          });
        }
      }
    },
    mounted() {
      // this.$refs.unlockText.pause();
      const thumbnails = [this.$refs.diamond, this.$refs.diamondInner];
      this.thumbnailOpenTimeline = gsap.timeline({ paused : true });
      this.thumbnailOpenTimeline.fromTo(
        thumbnails,
        { opacity : 0 },
        {
          opacity : 1,
          duration : 0.1
        }
      );
      this.thumbnailOpenTimeline.fromTo(
        thumbnails,
        { clipPath : 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' },
        {
          ease : 'power2.inOut',
          duration : 0.4,
          clipPath : 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
        },
        '<'
      );
    },
    unmounted() {
      this.thumbnailOpenTimeline.kill();
      this.thumbnailOpenTimeline = null;
      this.clearUnlockTl();
    },
    methods : {
      nextLetter() {
        const { curLetterIndex } = this.activeLetter;
        const index = curLetterIndex + 1;
        const next = this.letterData[index > this.letterData.length - 1 ? 0 : index];
        if (next) {
          this.$router.push(next.path);
        }
      },
      previousLetter() {
        const { curLetterIndex } = this.activeLetter;
        const index = curLetterIndex - 1;
        const prev = this.letterData[index < 0 ? this.letterData.length - 1 : index];
        if (prev) {
          this.$router.push(prev.path);
        }
      },
      handleContact() {
        this.$router.push('/contact');
      },
      getLetterEl(char) {
        return document.getElementById(`LetterBar-${char}`);
      },
      clearUnlockTl() {
        this.unlockTl?.kill();
        this.unlockTl = null;
      },
      handleLetterUnlock(val) {
        if (this.letter.toUpperCase() in val) {
          const letterEl = this.getLetterEl(this.letter.toUpperCase());

          if (!letterEl) {
            return;
          }

          clearTimeout(this.transitionTimeout);
          const unlockId = this.$sfx.play(audiospriteSpriteNames.unlock);
          this.$sfx.setVolume(unlockId, 0.2);

          const xPos = this.onLetterMouseover(this.letterIndex);
          this.letterBarLocked = true;
          this.letterUnlocked = true;
          this.thumbnailOpenTimeline.play();

          this.clearUnlockTl();
          this.unlockTl = gsap.timeline();

          gsap.set(this.$refs.fxWrapper, { x : xPos });

          this.unlockTl.fromTo(
            this.$refs.fxWrapper,
            {
              autoAlpha : 0
            },
            {
              autoAlpha : 1,
              duration : 1
            },
          );
          this.unlockTl.fromTo(
            this.$refs.ring1,
            {
              scale : 1.2
            },
            {
              scale : 1,
              duration : 0.5,
              ease : 'power2.inOut'
            },
            0.1
          );
          this.unlockTl.fromTo(
            this.$refs.ring2,
            {
              scale : 1.5
            },
            {
              scale : 1,
              duration : 0.5,
              ease : 'power2.inOut'
            },
            0.3
          );

          this.unlockTl.fromTo(
            this.$refs.glow,
            {
              autoAlpha : 0
            },
            {
              autoAlpha : 0.8,
              duration : 1.2
            },
            '-=0.4'
          ).to(
            this.$refs.glow,
            {
              autoAlpha : 0,
              duration : 2,
              onComplete : () => {
                this.letterUnlocked = false;
                this.letterBarLocked = false;
                this.thumbnailOpenTimeline.reverse();
              }
            },
          );
          this.unlockTl.to(
            this.$refs.ring1,
            {
              scale : 0,
              duration : 1,
              ease : 'power2.inOut'

            },
            '-=0.2'
          );
          this.unlockTl.to(
            this.$refs.ring2,
            {
              scale : 0,
              duration : 1,
              ease : 'power2.inOut'
            },
            '-=0.8'
          );
        }
      },
      onLetterMouseover(index) {
        const letterEl = this.getLetterEl(LETTERS_STRING[index]);
        if (!this.letterBarLocked || !letterEl) {
          clearTimeout(this.transitionTimeout);
          const letterPosition = letterEl.getBoundingClientRect();
          const thumbnail = this.$refs.diamond;
          if (letterPosition) {
            this.thumbnailOpenTimeline.play();
            const xPos = letterPosition.x + letterPosition.width / 2;
            gsap.to(thumbnail, {
              x : `${xPos}`,
              duration : 0.4,
              ease : 'power2.out'
            });
            this.thumbnailPosition = index * this.diamondSize;
            return xPos;
          }
        }
        return 0;
      },
      onBarMouseover() {
        if (!this.letterBarLocked) {
          this.thumbnailOpenTimeline.play();
          this.letterBarHover = true;
        }
      },
      onBarMouseleave() {
        if (!this.letterBarLocked) {
          this.transitionTimeout = setTimeout(() => {
            this.letterBarHover = false;
            this.thumbnailOpenTimeline.reverse();
          }, 300);
        }
      }
    }
  };
</script>

<style lang="scss">
  $route-padding: 0.5em;
  $route-padding-narrow: 0.4em;

  .LetterBar {
    @include full-size(fixed);
    pointer-events: none;
    overflow: hidden;

    &__container {
      width: 100%;
      position: absolute;
      left: 50%;
      bottom: 5%;
      transform: translate(-50%, -100%);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }

    &__icon {
      position: relative;
      bottom: 0;
      pointer-events: auto;
      &-next {
        left: 4vw;
        padding-top: 1rem;
      }
      &-previous {
        left: -4vw;
        padding-bottom: 1rem;
        transform: rotate(180deg);
      }
      &-contact {
        padding-top: 1rem;
        right: 5vw;
      }
      &-previous, &-next {
        &:hover {
          .LetterBar__icon-arrow {
            animation: arrow 0.4s $easeInOutCirc;
          }
        }
      }
    }
    &__route {
      @include fk-display-regular(16, 0, 1);
      padding: 0 $route-padding;
      padding-top: calc($route-padding * 2);
      color: $white;
      position: relative;
      z-index: 7;
      cursor: pointer;
      opacity: 50%;

      &--unlocked {
        transition: opacity 0.3s;
        opacity: 100%;
      }

      & span {
        position: relative;
        text-shadow: 1px 1px 4px rgba($black, 0.3);
        transition: text-shadow 0.3s;
        pointer-events: none;
      }
      & svg {
        pointer-events: none;
      }
      &:hover {
        color: $white;
        & span {
          text-shadow: 0 0 8px $white, 1px 1px 4px rgba($black, 0.3);
        }
        .LetterBar__thumbnail {
          opacity: 1;
        }
      }
      &.router-link-active {
        font-weight: bold;
        & span {
          text-shadow: 1px 1px 4px rgba($black, 0.3), 0 0 8px $white;
        }
        &::after {
          content: '';
          position: absolute;
          bottom: -1em;
          left: 50%;
          border-radius: 50%;
          width: 5px;
          height: 5px;
          background: white;
          transform: translate(-50%, -50%);
        }
      }
    }
    &__thumbnail-fx {
      position: absolute;
      transform: translate(-50%, -50%);
      left: 50%;
      top: 50%;
      &-wrapper {
        opacity: 0;
        position: absolute;
        transform: translate(-50%, -100%) rotate(45deg);
        left: 0;
        z-index: 2;
        top: 0;
      }
      &-glow {
        transition: 0.3s opacity;
        box-shadow: 0 0 20px white;
        mix-blend-mode: lighten;
        pointer-events: none;
        will-change: auto;
      }
      &-ring {
        background-position: center;
        border-width: 2px;
        border-style: solid;
        border-image-source: linear-gradient(135deg, #cc13ea 25%, #2708a6 80%);
        border-image-slice: 1;
        pointer-events: none;
        will-change: auto;
      }
    }
    &__thumbnail {
      position: absolute;
      transform: translate(-50%, -100%);
      left: 0;
      opacity: 0;
      transition: 0.3s opacity;
      background-position: center;
      clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
      background-image: linear-gradient(135deg, #cc13ea 25%, #2708a6 80%);
      z-index: 3;
      top: 0;
      &-image {
        position: absolute;
        left: 50%;
        top: 50%;
        clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
        transform: translate(-50%, -50%);
        transition: 0.3s opacity;
        background-size: cover;
        background-position: center;
        pointer-events: none;
        z-index: 5;
      }
    }
    &__unlock-text {
      will-change: auto;
      @include fk-display-regular(16, 0, 1.3);
      position: absolute;
      color: $white;
      bottom: -100%;
      left: 50%;
      text-align: center;
      transform: translate(-50%, 50%);
    }
    @include breakpoint($desktop-narrow) {
      &__route {
        padding: 0 $route-padding-narrow;
        padding-top: calc($route-padding * 2);
      }
      &__icon {
        &-next {
          left: 2vw;
        }
        &-previous {
          left: -2vw;
        }
        &-contact {
          left: -3vw;
        }
      }
    }
  }

  @keyframes arrow {
    0% {
      opacity: 1;
      transform: translateX(0);
    }
    49% {
      transform: translateX(0.5em);
    }
    50% {
      opacity: 0;
      transform: translateX(-1em);
    }
  }
</style>
