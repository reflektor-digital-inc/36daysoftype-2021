<template>
  <div ref="pageHeading" class="PageHeading">
    <SplitLines
      ref="subtitle"
      class="PageHeading__subtitle"
      v-html="subtitle"
    />

    <div class="PageHeading__container">
      <SplitLines
        ref="title"
        class="PageHeading__title"
        v-html="title"
      />

      <div class="PageHeading__desc-container">
        <hr ref="hr">
        <div class="PageHeading__desc-copy">
          <SplitLines
            ref="copy"
            class="PageHeading__copy1"
            v-html="description"
          />
          <SplitLines
            ref="copy2"
            class="PageHeading__copy1"
            v-html="description2"
          />
          <SplitLines
            v-if="description3"
            ref="copy3"
            class="PageHeading__copy"
            v-html="description3"
          />
          <div ref="button">
            <PillButton

              :label="buttonLabel"
              :route="buttonRoute"
              :plus-icon="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import PillButton from '@components/PillButton/PillButton.vue';
  import SplitLines from '@components/SplitLines/SplitLines.vue';
  import gsap from 'gsap';

  export default {
    name : 'PageHeading',
    components : { PillButton, SplitLines },
    props : {
      title : {
        type : String,
        default : ''
      },
      subtitle : {
        type : String,
        default : ''
      },
      description : {
        type : String,
        default : ''
      },
      description2 : {
        type : String,
        default : ''
      },
      description3 : {
        type : String,
        default : null
      },
      buttonLabel : {
        type : String,
        default : ''
      },
      buttonRoute : {
        type : String,
        default : ''
      }
    },
    unmounted() {
      this.tl.kill();
      this.tl = null;
    },
    mounted() {
      this.enter();
    },
    methods : {
      enter() {
        const e1 = gsap.effects.fadeAndTransform(this.$refs.hr, { duration : 1 });
        const e2 = gsap.effects.fadeAndTransform(this.$refs.button, { duration : 1 });

        this.tl = gsap.timeline({ paused : true });
        this.tl.add(this.$refs.subtitle.play(), 0.1);
        this.tl.add(this.$refs.title.play(), '>-=0.7');
        this.tl.add(this.$refs.copy.play(), '>-=0.6');
        this.tl.add(this.$refs.copy2.play(), '>-=0.6');
        if (this.description3) {
          this.tl.add(this.$refs.copy3.play(), '>-=0.6');
        }
        this.tl.add(e1, '-=1.5');
        this.tl.add(e2, '-=1.5');
      },
      leave() {
        this.tl.clear();
      }
    }
  };
</script>

<style lang="scss">
  .PageHeading {
    // display: inline-block;
    pointer-events: none;

    padding: 25px;
    @include breakpoint($mobile) {
      padding: 10px;
    }
    &__subtitle {
      position: absolute;
      margin: 0;
      @include coign-pro-semibold(467, 0, 0.73);
      opacity: 0.1;
      margin-bottom: 1.5rem;
      .SplitParent {
        margin-top: -0.02em;
        padding-top: 0.02em;
      }
      @include breakpoint($phone) {
        @include coign-pro-semibold(269, 0, 0.7);
        margin-bottom: 0.5rem;
      }
    }
    &__title {
      display: inline-block;
      margin: 0;
      margin-bottom: 2rem;
      @include gosha(120, 0, 1);
      @include breakpoint($phone) {
        @include gosha(64, 0, 1);
      }
      .SplitChild {
        padding-bottom: 0.1em;
        margin-top: -0.1em;
      }
      span {
        margin-left: 7.55rem;
        @include breakpoint($mobile) {
          margin-left: 5.3rem;
        }
        @include breakpoint($phone) {
          margin-left: 3.3rem;
        }
      }
    }
    &__container {
      display: inline-block;
      padding: 0 1.3rem;
      margin-top: 5.5rem;
      @include breakpoint($mobile) {
        padding: 0 0.8rem;
        margin-top: 3.3rem;
      }
    }
    &__copy1 {
      display: inline-block;
      @include fk-grotesk-neue-regular(14, 0, 1.57);
      margin-bottom: 1.5rem;
      @include breakpoint($mobile) {
        margin-bottom: 2rem;
      }
      a {
        @include animated-underline;
      }
    }
    &__copy {
      display: inline-block;
      @include fk-grotesk-neue-regular(14, 0, 1.57);
      margin-bottom: 2.8rem;
      @include breakpoint($mobile) {
        margin-bottom: 2rem;
      }
    }
    &__desc {
      &-copy {
        width: 80%;
        max-width: 420px;
        margin-left: 1.3rem;
        pointer-events: auto;
      }
      &-container {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        // width: auto;
        width: 100%;

        hr {
          display: block;
          border: none;
          border-top: 1px solid $white;
          width: 100%;
          max-width: 72px;
          margin: 0;
          margin-top: 0.6rem;
        }
      }
    }
  }

</style>
