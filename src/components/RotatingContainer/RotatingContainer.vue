<template>
  <div :class="rootElClasses">
    <div
      ref="contentContainer"
      :class="contentContainerClasses"
    >
      <slot />
    </div>
  </div>
</template>

<script>

  /**
   * @exports RotatingContainer
   * @description Generic container that positions and rotates child element.
   */

  export default {
    name : 'RotatingContainer',
    props : {
      /**
       * Array containing position values for main element
       */
      anchor : {
        type : Array,
        default : () => ['top', 'left'],
        validator(anchor) {
          const validPositions = ['top', 'left', 'right', 'bottom', 'center'];
          return anchor.every(p => validPositions.includes(p));
        }
      },

      /**
       * The rotation number in degrees (value must be a multiple of 45,
       * with a minimum value of 0 and a maximum value of 360)
       */
      rotation : {
        type : Number,
        default : 90,
        validator(val) {
          return ((val <= 360) && val % 45 === 0);
        }
      },

      /**
       * An object to offset the main container.
       * Object can have x and/or y properties
       */
      offset : {
        type : Object,
        validator(offset) {
          return (offset.hasOwnProperty('x') || offset.hasOwnProperty('y'));
        },
        default : () => ({
          x : 0,
          y : 0
        })
      },

      /**
       * Array containing position values for content container.
       */
      contentPosition : {
        type : Array,
        default : () => ['top', 'left'],
        validator(position) {
          const validPositions = ['top', 'left', 'right', 'bottom', 'center'];
          return position.every(p => validPositions.includes(p));
        }
      }
    },
    computed : {
      rotationClass() {
        return `RotatingContainer--rotate${this.rotation}deg`;
      },
      anchorClasses() {
        return this.anchor.reduce((classes, position) => {
          classes += `RotatingContainer--${position} `;
          return classes;
        }, '');
      },
      positionClasses() {
        return `RotatingContainer__content-container--${this.contentPosition.join('-')}`;
      },
      rootElClasses() {
        return `RotatingContainer ${this.anchorClasses} ${this.rotationClass}`;
      },
      contentContainerClasses() {
        return `RotatingContainer__content-container ${this.positionClasses}`;
      }
    },
    mounted() {
      if (this.offset.x || this.offset.y) {
        const { y = 0, x = 0 } = this.offset;
        TweenMax.set(this.$el, { x, y });
      }
    }
  };
</script>

<style lang="scss">
  $rotations: 0, 45, 90, 135, 180, 225, 270, 315, 360;
  $content-positions: (
    'top-left': (top: 0, left: 0),
    'top-center': (top: 0, left: 50%),
    'top-right': (top: 0, right: 0),
    'left-center': (left: 0, top: 50%),
    'center-center': (top: 50%, left: 50%, transform: translate(-50%, -50%)),
    'center': (top: 50%, left: 50%, transform: translate(-50%, -50%)),
    'right-center': (right: 0, top: 50%),
    'bottom-left': (bottom: 0, left: 0),
    'bottom-center': (bottom: 0, left: 50%),
    'bottom-right': (bottom: 0, right: 0)
  );

  .RotatingContainer {
    position: absolute;
    width: 0;
    height: 0;
    overflow: visible;
    &--top {
      top: 0;
      &.RotatingContainer--center {
        left: 50%;
      }
    }
    &--left {
      left: 0;
      &.RotatingContainer--center {
        top: 50%;
      }
    }
    &--bottom {
      bottom: 0;
      &.RotatingContainer--center {
        left: 50%;
      }
    }
    &--right {
      right: 0;
      &.RotatingContainer--center {
        top: 50%;
      }
    }
    &--center {
      &#{&} {
        top: 50%;
        left: 50%;
      }
    }
    @each $rotation in $rotations {
      &--rotate#{$rotation}deg {
        transform: rotate(#{$rotation}deg);
      }
    }
    &__content-container {
      position: absolute;
      white-space: nowrap;
      @each $class, $positions in $content-positions {
        &--#{unquote($class)} {
          @each $property, $position in $positions {
            #{$property}: $position;
          }
        }
      }
    }
  }

</style>
