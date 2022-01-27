<template>
  <div class="ProjectHeading">
    <div class="ProjectHeading__container">
      <div class="ProjectHeading__title-container">
        <SplitLines ref="subtitle">
          <h1 class="ProjectHeading__title">
            Reflektor
          </h1>
        </SplitLines>
        <div class="ProjectHeading__desc-container">
          <hr ref="hr">
          <SplitLines ref="title">
            <h1 class="ProjectHeading__title">
              Digital
            </h1>
          </SplitLines>
        </div>
      </div>
      <div class="ProjectHeading__desc-copy">
        <div class="ProjectHeading__desc-wrapper">
          <SplitLines ref="copy">
            <p>
              Reflektor Digital is an award-winning digital production studio
              that specializes in design, development and experiential activations.
              We've mastered the digital tools to turn heads, win hearts, and change minds.
            </p>
          </SplitLines>
          <br>
          <SplitLines ref="copy2">
            <p>
              We don't carry the weight of a big agency, which gives us the ability to be laser-focused
              on projects we're passionate about, iterate quickly, and invest in our client relationships.
              We take great pride in our work so you can too.
            </p>
          </SplitLines>

          <div ref="links" class="ProjectHeading__link-bar">
            <a href="https://reflektor.digital" target="_blank">
              Our Work
            </a>
            <router-link to="contact">
              Contact Us
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import PillButton from '@components/PillButton/PillButton.vue';
  import gsap from 'gsap';
  import SplitLines from '@components/SplitLines/SplitLines.vue';

  export default {
    name : 'ProjectHeading',
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
      const e1 = gsap.effects.fadeAndTransform(this.$refs.hr, { duration : 0.5 });
      const e2 = gsap.effects.fadeAndTransform(this.$refs.links, { duration : 0.5 });

      this.tl = gsap.timeline();
      this.tl.add(this.$refs.subtitle.play(), 0.5);
      this.tl.add(this.$refs.title.play(), '>-=0.2');
      this.tl.add(this.$refs.copy.play(), '>-=0.3');
      this.tl.add(this.$refs.copy2.play(), '>-=0.3');
      this.tl.add(e1, '-=0.7');
      this.tl.add(e2, '-=0.5');
    },
    methods : {

    }
  };
</script>

<style lang="scss">
  .ProjectHeading {
    padding: 25px;
    height: 100%;
    pointer-events: none;
    @include breakpoint($phone) {
      padding: 10px;
    }
    &__subtitle {
      position: absolute;
      margin: 0;
      @include coign-pro-semibold(467, 0, 0.7);
      opacity: 0.1;
      margin-bottom: 1.5rem;
      @include breakpoint($phone) {
        @include coign-pro-semibold(269, 0, 0.7);
        margin-bottom: 0.5rem;
      }
    }
    &__title {
      margin: 0;
      @include gosha(120, 0, 1);
      @include breakpoint($phone) {
        @include gosha(64, 0, 1);
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
      &-container {
        display: flex;
        flex-direction: column;
        align-content: flex-end;
        text-align: right;
      }
    }

    &__container {
      width: 100%;
      height: 100%;
      padding: 0 1.3rem;
      margin-top: 5.5rem;
      @include breakpoint($mobile) {
        padding: 0 0.8rem;
        margin-top: 3.3rem;
      }
    }
    &__desc {
      &-copy {
        margin-left: 1.3rem;
        width: 84%;
        float: right;
        overflow: hidden;
        hr {
          display: block;
          opacity: 0;
          border: none;
          border-top: 1px solid #fff;
          width: 72px;
          margin: 0;
          margin-top: 0.6rem;
        }
        @include breakpoint($phone) {
          float: none;
          position: relative;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          margin-left: 0;
          width: unset;
        }
        p {
          @include fk-grotesk-neue-regular(14, 0, 1.57);
        }
      }
      &-wrapper {
        width: 80%;
        min-width: 80%;
        max-width: 420px;
        margin-left: 1.3rem;
        margin-bottom: 2.8rem;
        @include breakpoint($mobile) {
          margin-bottom: 2rem;
          margin-left: 2.5rem;
        }
        @include breakpoint($phone) {
          margin-left: 1.3rem;
          min-width: 80%;
        }
      }
      &-container {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        margin-left: 2rem;
        margin-bottom: 1rem;
        @include breakpoint($mobile) {
          margin-left: 0;
        }
        hr {
          display: block;
          border: none;
          border-top: 1px solid $white;
          max-width: 92px;
          width: 100%;
          margin: 0;
          margin-top: -1rem;
          margin-right: 1.5rem;
        }
      }
    }
    &__link-bar {
      display: flex;
      margin-top: px(40);
      position: relative;
      pointer-events: auto;
      cursor: pointer;
      a {
        position: relative;
        @include fk-grotesk-neue-regular(18, 0, 1.2);
        white-space: nowrap;
        margin-right: px(30);
        @include animated-underline;
        padding-bottom: 5px;
      }
    }
  }

</style>
