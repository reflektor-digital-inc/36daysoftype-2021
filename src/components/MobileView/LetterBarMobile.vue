<template>
  <div
    ref="letterbar"
    class="LetterBarMobile"
  >
    <div
      ref="letters"
      class="LetterBarMobile__letters"
      :style="{ paddingLeft: windowHalfWidth + 'px', paddingRight: windowHalfWidth - 40 + 'px'}"
    >
      <div
        v-for="letters in letterData"
        :key="letters.char"
        :class="['LetterBarMobile__route', { 'LetterBarMobile__route--unlocked' : unlockedLetters[letters.char] }]"
        @click="handleLetterClick(letters.path)"
      >
        <span>{{ letters.char }}</span>
      </div>
    </div>
  </div>
  <div class="LetterBarMobile__background" />
  <!-- Unloack Rings -->
  <div
    ref="ring1"
    class="LetterBarMobile__ring"
    :style="{
      width : `${diamondSize - 38}px`,
      height : `${diamondSize - 38}px`
    }"
  />
  <div
    ref="ring2"
    class="LetterBarMobile__ring"
    :style="{
      width : `${diamondSize - 28}px`,
      height : `${diamondSize - 28}px`
    }"
  />
  <div
    ref="glow"
    class="LetterBarMobile__glow"
    :style="{
      width : `${diamondSize - 42}px`,
      height : `${diamondSize - 42}px`
    }"
  />
  <!-- Unlock ring end -->
  <div
    ref="diamond"
    class="LetterBarMobile__thumbnail"
    :style="{
      width : `${diamondSize + 6}px`,
      height : `${diamondSize + 6}px`
    }"
    @click="onThumbnailClick"
  >
    <div
      ref="diamondInner"
      class="LetterBarMobile__thumbnail-image"
      :style="{
        width : `${diamondSize}px`,
        height : `${diamondSize}px`,
        backgroundImage : `url('/thumbnails/thumbnail_letters.png')`,
        backgroundPosition: `-${thumbnailPosition}px`
      }"
    />
  </div>
  <div v-if="isScrolling" class="LetterBarMobile__bar">
    <!--  -->
  </div>
</template>
<script>
  import { mapGetters, mapState } from 'vuex';
  import { LETTERS_STRING } from '@settings/settings.ui';
  import gsap from 'gsap';
  import { audiospriteSpriteNames } from '@utils/AudiospriteAudioController.js';
  import { Draggable } from 'gsap/Draggable';
  import { InertiaPlugin } from '~/vendor/gsap-club/src/InertiaPlugin';

  gsap.registerPlugin(InertiaPlugin);
  gsap.registerPlugin(Draggable);

  export default {
    name : 'LetterBarMobile',
    data() {
      return {
        innerRadius : 13,
        diamondSize : 180,
        thumbnailPosition : 0,
        thumbnailUrl : '',
        thumbnailLink : '',
        thumbnailChar : '',
        isScrolling : false,
        endTimeout : ''
      };
    },
    computed : {
      ...mapState({
        unlockedLetters : state => state.easterEgg.letterUnlock,
        windowSize : state => state.windowSize.width
      }),
      ...mapGetters({
        windowHalfWidth : 'windowSize/windowHalfWidth'
      }),
      letterData() {
        const letterArray = LETTERS_STRING.split('');
        return letterArray.map(letter => ({
          path : `/letter/${letter.toLowerCase()}`,
          char : letter.toUpperCase()
        }));
      },
      getUrl() {
        return this.thumbnailUrl;
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
          this.handleLetterUnlock(val);
        }
      },
      windowHalfWidth() {
        this.centerLetter(this.$route);
      },
      $route : {
        immediate : true, // will fire on mount
        handler : 'routeChanged'
      }
    },
    mounted() {
      this.draggable = Draggable.create('.LetterBarMobile__letters', {
        type : 'x',
        bounds : this.$refs.letterbar,
        edgeResistance : 1,
        inertia : true,
        snap : endValue => Math.round(endValue / 40) * 40,
        onThrowUpdate : () => {
          this.onStartScroll(this.$refs.letters?.getBoundingClientRect().x);
        },
        onThrowComplete : () => {
          this.endTimeout = setTimeout(() => this.onEndScroll(), 3000);
        },
        onDrag : () => {
          this.onAllDragEvents();
        }
      });

      const thumbnails = [this.$refs.diamond, this.$refs.diamondInner];
      this.thumbnailOpenTimeline = gsap.timeline({ paused : true });
      this.thumbnailOpenTimeline.to(
        thumbnails,
        {
          opacity : 1,
          duration : 0.1
        }
      );
      this.thumbnailOpenTimeline.to(
        thumbnails,
        {
          ease : 'power2.out',
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
      routeChanged(route) {
        setTimeout(() => this.centerLetter(route), 200);
      },
      centerLetter(route) {
        const scrollDiv = this.$refs.letterbar;
        const letters = this.letterData;
        const letterPath = route?.path;
        const letterPositon = letters.findIndex(value => value.path === letterPath);
        scrollDiv.scrollLeft = letterPositon * 40;
        gsap.to('.LetterBarMobile__letters', {
          x : 0
        });
      },
      onStartScroll(x) {
        this.isScrolling = true;
        this.thumbnailOpenTimeline.play();
        const scrolledLetterData = this.letterData[Math.round(Math.abs(x) / 40)];
        this.thumbnailPosition = Math.round(Math.abs(x) / 40) * 180;
        this.thumbnailLink = scrolledLetterData.char.toLowerCase();
      },
      onAllDragEvents() {
        const scrollBar = this.$refs.letters;
        const scrollX = scrollBar.getBoundingClientRect().x;
        this.onStartScroll(scrollX);
      },
      onEndScroll() {
        this.isScrolling = false;
        this.thumbnailOpenTimeline.reverse();
      },
      onThumbnailClick() {
        this.$router.push(this.thumbnailLink);
      },
      clearUnlockTl() {
        this.unlockTl?.kill();
        this.unlockTl = null;
      },
      handleLetterClick(path) {
        if (this.draggable[0].isDragging) return;

        this.$router.push(path);
      },
      handleLetterUnlock(val) {
        if (this.letter.toUpperCase() in val) {
          clearTimeout(this.transitionTimeout);
          const unlockId = this.$sfx.play(audiospriteSpriteNames.unlock);
          this.$sfx.setVolume(unlockId, 0.2);

          this.onStartScroll(this.letterIndex);
          this.clearUnlockTl();
          this.unlockTl = gsap.timeline();
          this.thumbnailPosition = this.letterIndex * 180;
          this.unlockTl.fromTo(
            [this.$refs.ring1, this.$refs.ring2],
            {
              autoAlpha : 0
            },
            {
              autoAlpha : 1,
              duration : 0.4
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
                this.onEndScroll();
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
      }
    }
  };
</script>

<style lang="scss">
  $route-padding: 0.5em;

  .LetterBarMobile {
    position: absolute;
    bottom: 0;
    &__background {
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0),
        rgba(0, 0, 0, 0.3),
      );
      z-index: -1;
      pointer-events: none;
      height: 300px;
      position: fixed;
      bottom: 0;
      width: 100%;
    }

    -webkit-mask-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0)
    );
    mask-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0)
    );
    width: 100%;
    height: 80px;
    pointer-events: auto;
    overflow-x: hidden;
    overflow-y: hidden;
    scroll-behavior: smooth;
    &__letters {
      position: absolute;
      bottom: 10px;
      justify-content: start;
      height: 50px;
      display: flex;
    }
    &__route {
      @include fk-display-regular(18, 0, 1);
      vertical-align: middle;
      width: 40px;
      text-align: center;
      position: relative;
      color: $white;
      opacity: 50%;

      &--unlocked {
        transition: opacity 0.3s;
        opacity: 100%;
      }

      & span {
        position: relative;
        cursor: pointer;
        left: -50%;
        transform: translate(-50%);
      }
      &:hover {
        color: $white;
        & span {
          text-shadow: 0 0 8px $white;
        }
        .LetterBarMobile__thumbnail {
          opacity: 1;
        }
      }
      &.router-link-active {
        font-weight: bold;
        & span {
          position: relative;
          text-shadow: 1px 1px 4px rgba($black, 0.3), 0 0 8px $white;
          color: white;
        }
      }
    }
    &__bar {
      position: absolute;
      border-radius: 50%;
      width: 5px;
      height: 5px;
      left: 50%;
      bottom: 20px;
      transform: translate(-50%);
      background: $white;
    }
    &__thumbnail {
      position: absolute;
      color: black;
      bottom: 0;
      left: 50%;
      background-image: linear-gradient(135deg, #cc13ea 25%, #2708a6 80%);
      transform: translate(-50%, -80px);
      clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
      pointer-events: auto;
      transition: clip-path 0.1s;
      &-image {
        position: absolute;
        left: 50%;
        top: 50%;
        clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
        transform: translate(-50%, -50%) scale(1);
        background-position: center;
        background-size: cover;
        transition: clip-path 0.1s;
      }
    }
    &__glow {
      opacity: 0;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, -105px) rotate(45deg);
      transition: 0.3s opacity;
      box-shadow: 0 0 20px white;
      mix-blend-mode: lighten;
      pointer-events: none;
    }
    &__ring {
      opacity: 0;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -97px) rotate(45deg);
      transition: 0.3s opacity;
      background-position: center;
      border-width: 2px;
      border-style: solid;
      border-image-source: linear-gradient(135deg, #cc13ea 25%, #2708a6 80%);
      border-image-slice: 1;
      pointer-events: none;

      &:nth-child(2n) {
        bottom: 0;
      }
      &:nth-child(odd) {
        bottom: 5px;
      }
    }
  }
</style>
