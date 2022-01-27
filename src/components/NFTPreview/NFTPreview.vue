<template>
  <div
    :class="rootElClasses"
    @mouseover="handlePreviewMouseOver"
    @mouseleave="handlePreviewMouseLeave"
    @click="onClick"
  >
    <div ref="card" class="NFTPreview__preview-wrapper">
      <div class="NFTPreview__preview">
        <img
          ref="img"
          class="NFTPreview__preview-image"
          :src="image"
          :alt="name"
        >
        <video
          v-if="mountPreviewVideo"
          ref="previewVideo"
          class="NFTPreview__preview-video"
          :src="video"
          :controls="false"
          autoplay
          muted
          loop
          @canplaythrough="handleCanPlayThrough"
        />
      </div>
      <div class="NFTPreview__info">
        <p ref="name" class="NFTPreview__name">
          <strong>{{ nftName }}</strong>
        </p>
        <div class="NFTPreview__purchase">
          <p ref="price" class="NFTPreview__purchase-price">
            {{ price }} MATIC
          </p>
          <button
            ref="button"
            :class="purchaseButtonClasses"
            @click="onClick"
          >
            {{ sold ? 'Sold' : '+ Buy Now' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  import gsap from 'gsap';
  import VanillaTilt from 'vanilla-tilt';

  export default {
    name : 'NFTPreview',
    props : {
      letter : {
        type : String,
        default : ''
      },
      letterTitleIndex : { // for the title
        type : Number,
        default : 0
      },
      letterIndex : { // the actual letter index
        type : Number,
        required : true
      },
      name : {
        type : String,
        default : ''
      },
      owner : {
        type : String,
        default : 'Reflektor Digital'
      },
      image : {
        type : String,
        default : ''
      },
      video : {
        type : String,
        default : ''
      },
      price : {
        type : Number,
        default : 0
      },
      sold : {
        type : Boolean,
        default : false
      },
      onClick : {
        type : Function,
        default : () => {}
      }
    },
    data() {
      return {
        mountPreviewVideo : false,
        animating : true
      };
    },
    computed : {
      rootElClasses() {
        return ['NFTPreview'];
      },
      nftName() {
        return `#${String(this.letterTitleIndex).padStart(2, '0')} Letter ${this.letter.toUpperCase()} \u2013 NFT`;
      },
      purchaseButtonClasses() {
        return [
          'NFTPreview__purchase-button',
          {
            'NFTPreview__purchase-button--sold' : this.sold
          }
        ];
      }
    },
    mounted() {
      this.tl = gsap.timeline({ onComplete : () => {this.animating = false} });

      // {
      //   reverse:                false,  // reverse the tilt direction
      //   max:                    15,     // max tilt rotation (degrees)
      //   startX:                 0,      // the starting tilt on the X axis, in degrees.
      //   startY:                 0,      // the starting tilt on the Y axis, in degrees.
      //   perspective:            1000,   // Transform perspective, the lower the more extreme the tilt gets.
      //   scale:                  1,      // 2 = 200%, 1.5 = 150%, etc..
      //   speed:                  300,    // Speed of the enter/exit transition
      //   transition:             true,   // Set a transition on enter/exit.
      //   axis:                   null,   // What axis should be disabled. Can be X or Y.
      //   reset:                  true,   // If the tilt effect has to be reset on exit.
      //   easing:                 "cubic-bezier(.03,.98,.52,.99)",    // Easing on enter/exit.
      //   glare:                  false,  // if it should have a "glare" effect
      //   "max-glare":            1,      // the maximum "glare" opacity (1 = 100%, 0.5 = 50%)
      //   "glare-prerender":      false,  // false = VanillaTilt creates the glare elements for you, otherwise
      //                                   // you need to add .js-tilt-glare>.js-tilt-glare-inner by yourself
      //   "mouse-event-element":  null,   // css-selector or link to HTML-element what will be listen mouse events
      //   "full-page-listening":  false,  // If true, parallax effect will listen to mouse move events on the whole document, not only the selected element
      //   gyroscope:              true,   // Boolean to enable/disable device orientation detection,
      //   gyroscopeMinAngleX:     -45,    // This is the bottom limit of the device angle on X axis, meaning that a device rotated at this angle would tilt the element as if the mouse was on the left border of the element;
      //   gyroscopeMaxAngleX:     45,     // This is the top limit of the device angle on X axis, meaning that a device rotated at this angle would tilt the element as if the mouse was on the right border of the element;
      //   gyroscopeMinAngleY:     -45,    // This is the bottom limit of the device angle on Y axis, meaning that a device rotated at this angle would tilt the element as if the mouse was on the top border of the element;
      //   gyroscopeMaxAngleY:     45,     // This is the top limit of the device angle on Y axis, meaning that a device rotated at this angle would tilt the element as if the mouse was on the bottom border of the element;
      //   gyroscopeSamples:       10      // How many gyroscope moves to decide the starting position.
      // }
      VanillaTilt.init(
        this.$el,
        {
          easing : 'cubic-bezier(.03,.98,.52,.99)',
          speed : 4000,
          glare : true,
          'max-glare' : 0.2,
          perspective : 1000,
          reverse : true
        }
      );
    },
    beforeUnmount() {
      this.leaveTl();
      this.$el.vanillaTilt.destroy();
    },
    methods : {
      ...mapMutations({
        openNftModal : 'nft/openNftModal',
        setCurrentNft : 'nft/setCurrentNft'
      }),
      enterTl() {
        this.tl
          .fromTo(
            this.$refs.card,
            {
              xPercent : 100,
              // scale : 0,
              autoAlpha : 0
            },
            {
              // scale : 1,
              autoAlpha : 1,
              delay : 0.5,
              xPercent : 0,
              duration : 0.45,
              ease : 'power3.out'
            }
          )
          .fromTo(
            this.$refs.img,
            {
              yPercent : 100,
              opacity : 0
            },
            {
              opacity : 1,
              yPercent : 0,
              duration : 0.7,
              ease : 'power2.out'
            },
            '-=0.1'
          )
          .add(gsap.effects.splitLines(this.$refs.name), '>-=1.1')
          .add(gsap.effects.splitLines(this.$refs.price), '>-=0.3')
          .add(gsap.effects.fadeAndTransform(this.$refs.button), '>-=0.3');

        return this.tl.play();
      },
      leaveTl() {
        this.tl
          .clear()
          .fromTo(
            this.$refs.card,
            {
              xPercent : 0
            },
            {
              xPercent : 100,
              duration : 1,
              ease : 'power2.in'
            }
          );
        return this.tl.play();
      },
      handlePreviewMouseOver() {
        if (!this.animating)
          this.mountPreviewVideo = true;
      },
      handlePreviewMouseLeave() {
        gsap.to(
          this.$refs.previewVideo,
          {
            autoAlpha : 0, duration : 0.2, ease : 'power1.inOut', onComplete : () => {
              this.mountPreviewVideo = false;
            }
          }
        );
      },
      handleCanPlayThrough() {
        gsap.to(
          this.$refs.previewVideo,
          { autoAlpha : 1, duration : 0.2, ease : 'power1.inOut' }
        );
      }
    }
  };
</script>

<style lang="scss">
  .NFTPreview {
    position: relative;
    width: 100%;
    overflow: hidden;
    cursor: pointer;

    &:hover {
      box-shadow: 6px 6px 0 2px $black;
    }

    &__preview {
      position: relative;
      width: 100%;
      padding-top: 100%;
      background-color: $black;
      overflow: hidden;
      &-wrapper {
        position: relative;
        width: 100%;
        padding: 20px;
        border: 1px solid rgba(white, 0.2);
        transition: border 0.2s;
        &:hover {
          border: 1px solid rgba(white, 0.4);
        }
      }
      &-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &-video {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        visibility: hidden;
      }
    }

    &__info {
      padding-top: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    &__name {
      @include gosha(18);
      color: $white;
      margin-bottom: 8px;
    }

    &__purchase {
      width: 100%;
      display: flex;
      justify-content: space-between;

      &-price {
        @include fk-grotesk-neue-regular(14);
        color: $white;
        margin-bottom: 0;
      }

      &-button {
        @include fk-grotesk-neue-bold(14);
        border: none;
        background-color: transparent;
        padding: 0;
        margin: 0;
        color: $white;
        cursor: pointer;

        &::after {
          content: '';
          width: 100%;
          position: absolute;
          border-bottom: 1px white solid;
          bottom: -5px;
          left: 0;
          transform: scaleX(0);
          transition: transform 0.2s;
          transform-origin: right;
        }
        &:hover {
          &::after {
            transform: scaleX(1);
            transform-origin: left;
          }
        }

        &--sold {
          color: rgba($white, 0.5);
          cursor: unset;
          pointer-events: none;
          &:hover {
            text-decoration: none;
          }
        }
      }
    }
  }
</style>
