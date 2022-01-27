<template>
  <component
    :is="rootElComponent"
    v-bind="rootElAttributes"
    :class="rootElClasses"
  >
    <div class="PillButton__circle" />
    <button
      class="PillButton__button"
      :type="type"
      @click="onClick"
    >
      <div
        ref="text"
        class="PillButton__label"
      >
        <div v-if="plusIcon" class="PillButton__icon-wrapper">
          <ArrowPlus class="PillButton__icon PillButton__icon--arrow" />
        </div>
        <span>
          {{ label }}
        </span>
        <span v-if="isPurchaseBtn" class="PillButton__label-price">
          {{ price }}
        </span>
        <div v-if="hasCryptoLogo || isPurchaseBtn" class="PillButton__icon--crypto">
          <CryptoLogo />
        </div>
      </div>
    </button>
  </component>
</template>

<script>
  import ArrowPlus from '@components/ArrowPlus/ArrowPlus.vue';
  import CryptoLogo from '@assets/svgs/crypto.svg';

  export default {
    name : 'PillButton',
    components : { ArrowPlus, CryptoLogo },
    props : {
      route : {
        type : [ String, Object ],
        default : undefined
      },
      small : {
        type : Boolean,
        required : false
      },
      disabled : {
        type : Boolean,
        required : false
      },
      label : {
        type : String,
        required : true
      },
      type : {
        type : String,
        default : 'button'
      },
      externalURL : {
        type : Boolean,
        default : false
      },
      plusIcon : {
        type : Boolean,
        default : false
      },
      colored : {
        type : Boolean,
        default : false
      },
      whiteBackground : {
        type : Boolean,
        default : false
      },
      isSmallButton : {
        type : Boolean,
        default : false
      },
      isPurchaseBtn : {
        type : Boolean,
        default : false
      },
      price : {
        type : Number,
        default : 0
      },
      hasCryptoLogo : {
        type : Boolean,
        default : false
      },
      onClick : {
        type : Function,
        default : () => {}
      }
    },
    computed : {
      rootElComponent() {
        if (this.externalURL) return 'a';
        return typeof this.route === 'undefined' ? 'div' : 'router-link';
      },
      rootElAttributes() {
        if (typeof this.route == 'undefined') return {};
        if (this.externalURL) return { href : this.route, target : '_blank' };
        return { to : this.route };
      },
      rootElClasses() {
        return [
          'PillButton',
          {
            'PillButton--disabled' : this.disabled,
            'PillButton--colored' : this.colored,
            'PillButton--white' : this.whiteBackground,
            'PillButton--small' : this.isSmallButton
          }
        ];
      }
    }
  };
</script>

<style lang="scss">
  $animation-speed: 0.25s;

  .PillButton {
    position: relative;
    display: inline-block;
    min-width: get-column-width(3);
    border: 2px solid rgba($white, 0.8);
    border-radius: 32px;
    transition: all $animation-speed ease-in-out;
    @include breakpoint($tablet) {
      // width: get-column-width(5);
    }
    &--disabled {
      pointer-events: none;
    }
    &--small {
      .PillButton__button {
        padding: 10px 0;
        min-width: 150px;
      }
      .PillButton__label {
        font-size: 14px;
      }
    }
    &--colored {
      border: unset;
      @media (hover: hover) {
        &:hover {
          border: unset !important;
          .PillButton__label {
            background-color: #c839ad;
            background-image: none;
          }
        }
      }
      .PillButton__circle {
        width: 100%;
        height: 100%;
        left: 0;
      }
      .PillButton__button {
        padding: 0;
      }
      .PillButton__label {
        // background-color: $black;
        border-radius: 32px;
        padding: 10px 45px;

        background: linear-gradient(150deg, #2ae7ff 0%, #f9076a 70%, #ff4605 100%) border-box;
        border: 2px solid transparent;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-clip: text;
        -webkit-background-clip: text;

        &::before {
          position: absolute;
          z-index: -1;
          inset: -2px;
          border: inherit;
          border-radius: inherit;
          background: inherit;
          background-clip: border-box;

          --full: linear-gradient(red 0 0);
          -webkit-mask: var(--full) padding-box, var(--full);
          -webkit-mask-composite: xor;
          mask: var(--full) padding-box exclude, var(--full);
          content: '';
        }
      }
    }
    &--white {
      background: $white;
      color: $black;
      transition: all $animation-speed ease-in-out;
      &:hover {
        background: $white;
      }
    }
    
    &__button {
      @include button-no-styles;
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px 0;
      width: 100%;
      min-width: 200px;
      @media (hover: hover) {
        &:hover {
          .PillButton__icon--arrow {
            animation: arrowPlus $animation-speed ease-in-out forwards;
          }
        }
      }
    }
    &__label {
      @include fk-grotesk-neue-regular(18, 0.6, math.div(21, 18));
      padding: 0 calc-vw(45);
      white-space: nowrap;
      display: flex;
      align-items: center;
      position: relative;
      top: 0.05em;
      transition: color $animation-speed ease-in-out;
      @include breakpoint($tablet) {
        // font-size: 24px;
      }
      &-price {
        @include fk-grotesk-neue-bold(18, 0.6, math.div(21, 18));
        margin-left: calc-vw(10);
      }
    }
    &__canvas {
      position: absolute;
      pointer-events: none;
      top: -50px;
      left: -50px;
      width: calc(100% + 100px);
      height: calc(100% + 100px);
      z-index: 2;
      // opacity: 0.4;
    }
    &__icon-wrapper {
      display: inline-block;
      height: 0.6em;
      width: 0.5em;
      margin-right: 0.2em;
      overflow: hidden;
    }
    &__text-wrapper {
      height: 16px;
      width: 100%;
      &--state {
        text-align: center;
        width: 100%;
        position: absolute;
        bottom: 100%;
      }
    }
    &__icon {
      position: relative;
      display: block;
      height: 0.5em;
      color: $light-grey;
      &--arrow {
        animation: arrowPlusReverse $animation-speed ease-in-out forwards;
      }
      &--inline {
        display: inline-block;
      }
      &--crypto {
        margin-top: 0.1em;
        margin-left: calc-vw(10);
        svg {
          width: 17px;
          height: 15px;
          transition: all $animation-speed ease-in-out;
        }
      }
    }
    &__circle {
      position: absolute;
      top: 50%;
      left: -1px;
      transform: translateY(-50%);
      display: inline-block;
      opacity: 0;
      width: calc(100% + 2px);
      height: calc(100% + 2px);
      border-radius: 2em;
      border: 2px solid #c839ad;
      background-color: #c839ad;
      transition: all $animation-speed ease-in-out;
    }
    @media (hover: hover) {
      &:hover {
        border: 2px solid #c839ad;
        .PillButton__label {
          color: $white;
        }
        .PillButton__circle {
          opacity: 1;
        }
        svg {
          fill: $white;
        }
      }
    }
    @keyframes arrowPlus {
      49% {
        transform: translateX(0.5em);
      }
      51% {
        opacity: 0;
        transform: translateX(-1em);
      }
      80% {
        opacity: 1;
        transform: translateX(-0.5em);
      }
      100% {
        opacity: 1;
        transform: translateX(-0.5em);
      }
    }
    @keyframes arrowPlusReverse {
      0% {
        transform: translateX(-0.5em);
      }
      49% {
        opacity: 0;
        transform: translateX(-1em);
      }
      51% {
        opacity: 0;
        transform: translateX(0.5em);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
</style>
