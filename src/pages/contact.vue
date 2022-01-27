<template>
  <div class="Contact">
    <div class="Contact__content">
      <div class="Contact__content-headings">
        <SplitLines ref="subtitle" class="Contact__subtitle">
          <div>CONTACT</div>
        </SplitLines>
        <SplitLines ref="title" class="Contact__title">
          <div>Get in touch</div>
        </SplitLines>
      </div>
      <div class="Contact__content-details">
        <div class="Contact__content-detail">
          <SplitLines ref="heading1">
            <h2 class="Contact__content-detail-heading">
              Business inquiries
            </h2>
          </SplitLines>
          <SplitLines ref="text1">
            <h1 class="Contact__email">
              <a
                target="_blank"
                class="Contact__email-link"
                href="mailto:biz@reflektor.digital"
              >
                biz@reflektor.digital
              </a>
            </h1>
          </SplitLines>
        </div>
        <div class="Contact__content-detail">
          <SplitLines ref="heading2">
            <h2 class="Contact__content-detail-heading">
              Work with us
            </h2>
          </SplitLines>
          <SplitLines ref="text2">
            <h1 class="Contact__email">
              <a
                target="_blank"
                class="Contact__email-link"
                href="mailto:careers@reflektor.digital"
              >
                careers@reflektor.digital
              </a>
            </h1>
          </SplitLines>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import NavigationHeader from '@components/NavigationHeader/NavigationHeader.vue';
  import SplitLines from '@components/SplitLines/SplitLines.vue';
  import gsap from 'gsap';
  import loadingLogic from '../mixins/loading-logic';

  export default {
    name : 'Contact',
    components : { NavigationHeader, SplitLines },
    mixins : [ loadingLogic ],
    mounted() {
      this.loadAnimation();
    },
    methods : {
      loadAnimation() {
        this.tl = gsap.timeline();
        this.tl
          .to(
            this.$el,
            {
              background : 'linear-gradient(-45deg, #bb4bb5, #4e24ed, #151515)',
              duration : 0.7
            }
          )
          .add(this.$refs.subtitle.play(), '-=0.7')
          .add(this.$refs.title.play(), '-=0.5')

          .add(this.$refs.heading1.play(), 0.8)
          .add(this.$refs.text1.play(), '>-=0.3')

          .add(this.$refs.heading2.play(), 0.8)
          .add(this.$refs.text2.play(), '>-=0.3');
      }
    },
    async beforeRouteLeave(to, from, next) {
      this.tl.timeScale(3);
      await this.tl.reverse();
      next();
    }
  };
</script>

<style lang="scss">
  .Contact {
    background: none;
    @include full-size;
    &__email {
      position: relative;
      color: $white;
      width: fit-content;
      @include fk-grotesk-neue-regular(14, -0.1, 1);
      &::after {
        content: '';
        width: 100%;
        position: absolute;
        border-bottom: 1px white solid;
        bottom: -4px;
        left: 0;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.2s;
      }
      &:hover {
        text-decoration: revert;
        &::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      }
    }
    &__content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      gap: 1em;
      height: 476px;
      width: 90%;
      @include breakpoint($mobile) {
        flex-direction: column;
      }
      &-headings {
        flex: 2;
        position: relative;
      }
      &-details {
        flex: 1;
      }
      &-detail {
        & + & {
          margin-top: 1.9em;
        }
        &-heading {
          color: $white;
          text-transform: uppercase;
          opacity: 0.5;
          @include fk-grotesk-neue-light(10, -0.1, 1);
        }
        &-text {
          color: $white;
          @include fk-grotesk-neue-regular(14, -0.1, 1);
        }
      }
    }
    &__subtitle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      @include coign-pro-semibold(467, 0, 1);
      opacity: 0.1;
      color: white;
      @include breakpoint($tablet) {
        top: 40%;
        @include coign-pro-semibold(467, 0, 1);
        margin-bottom: 0.5rem;
      }
      @include breakpoint($phone) {
        @include coign-pro-semibold(269, 0, 1);
        margin-bottom: 0.5rem;
      }
    }
    &__title {
      font-kerning: none;
      color: $white;
      position: absolute;
      top: 50%;
      left: 50%;
      width: fit-content;
      max-width: 100%;
      transform: translate(-50%, -50%);
      @include gosha(120, 0, 1);
      @include breakpoint($tablet) {
        top: 40%;
        min-width: 590px;
        @include gosha(100, 0, 1);
      }
      @include breakpoint($phone) {
        min-width: 300px;
        @include gosha(52, 0, 1);
      }
    }
  }
</style>
