<template>
  <div
    :style="styles"
    :class="rootElClasses"
  >
    <transition
      :name="transitionName"
      appear
    >
      <img
        v-show="isReady"
        ref="image"
        :src="source"
        :alt="alt"
        :class="imageElClasses"
        @load="handleImageReady"
        @error="handleImageError"
      >
    </transition>
    <div
      v-if="aspectRatio"
      class="ImagePreLoader__aspect-ratio-vertical-spacer"
      :style="verticalSpaceStyles"
    />
  </div>
</template>

<script>

/**
 * ImagePreLoader
 * @description Component to preload images. Uses css properties: object-fit and object-position.
 * @prop {String} image - The image source
 * @prop {String} size - Image size, which is used for object-fit property. Valid values [fit,
 * fill]
 * @prop {String} position - Image position, which is used for object-position property. Use
 * CSS syntax ex. 'center', 'top left', '50% 50%'. NOTE: Do not omit '%' when using numbers.
 * @external object-fit-images - Polyfills object-fit and object-position
 * @see {@link https://github.com/bfred-it/object-fit-images}
 */
  import UserAgentParser from '@src/utils/UserAgentParser';

  const removeQuery = url => url.replace(/\?.*$/, '');

  export default {
    name : 'ImagePreLoader',
    props : {
      objectFit : {
        type : String,
        default : 'contain',
        validator(value) {
          return [ 'fill', 'contain', 'cover', 'none', 'scale-down' ].includes(value);
        }
      },
      width : {
        type : String,
        default : ''
      },
      height : {
        type : String,
        default : ''
      },
      transitionSpeed : {
        type : String,
        validator(name) {
          return [ 'normal', 'fast', 'slow' ].includes(name);
        },
        default : 'normal'
      },
      position : {
        type : String,
        default : '50% 50%'
      },
      image : {
        type : String,
        required : true
      },
      disableFade : {
        type : Boolean,
        default : false
      },
      alt : {
        type : String,
        default : ''
      },
      absolute : {
        type : Boolean,
        default : false
      },
      aspectRatio : {
        type : Number,
        default : 0
      }
    },
    data() {
      return {
        isReady : false,
        userAgent : {},
        source : null,
        hasError : false
      };
    },
    computed : {
      rootElClasses() {
        return [
          'ImagePreLoader',
          {
            'ImagePreLoader--absolute' : this.absolute,
            'ImagePreLoader--error' : this.hasError,
            'ImagePreLoader--force-aspect-ratio' : Boolean(this.aspectRatio),
            'ImagePreLoader--object-fit' : this.objectFit !== 'none'
          }
        ];
      },
      transitionName() {
        if (this.userAgent.isBot) return 'none';
        return this.disableFade ? 'none' : `pre-load-fade-${this.transitionSpeed}`;
      },
      styles() {
        return {
          ...(this.width && { width : this.width }),
          ...(this.height && { height : this.height })
        };
      },
      imageElClasses() {
        const position = this.aspectRatio ? 'absolute' : 'relative';
        return [
          'ImagePreLoader__image',
          `ImagePreLoader__image--${this.objectFit}`,
          `ImagePreLoader__image--${position}`
        ];
      },
      verticalSpaceStyles() {
        const height = this.aspectRatio * 100;
        return { paddingTop : `${height}%` };
      }
    },
    mounted() {
      this.retryCount = 0;
      this.userAgent = new UserAgentParser();

      if (this.userAgent.isBot) {
        return this.handleBot();
      }

      this.createIntersectionObserver();

      this.worker = this.createWebWorker();
    },
    beforeUnmount() {
      this.destroyIntersectionObserver();
      this.cleanUpWorker();
    },
    methods : {
      handleBot() {
        this.isReady = true;
        this.source = this.image;
      },
      handleImageIntersection(entries = []) {
        const [ entry ] = entries;
        if (entry && entry.intersectionRatio) {
          this.loadImageWithWorker();
          this.destroyIntersectionObserver();
        }
      },
      createIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(this.handleImageIntersection, {
          threshold : [ 0, 1 ]

        // rootMargin : '1px',
        // root       : this.$parent.$el
        });
        this.intersectionObserver.observe(this.$el);
      },
      destroyIntersectionObserver() {
        if (!this.intersectionObserver) return;
        this.intersectionObserver.disconnect();
        this.intersectionObserver = null;
      },
      handleImageReady() {
        this.isReady = true;
        this.$emit('loaded');
        this.$nextTick(this.cleanUpWorker);
      },
      checkImageReady() {
        const { image } = this.$refs;
        return image ? image.complete : false;
      },
      handleImageError(event) {
        const hasQuery = /\?.*$/.test(this.image);

        if (event instanceof Error) {
          console.error(event);
        }
        else {
          console.error(`${event.type.replace(
            /^[a-z]/,
            match => match.toUpperCase()
          )} loading ${this.image}`);
        }

        // Hide self if image source can't be fixed
        if ((!hasQuery && !this.worker) || this.retryCount > 2) {
          this.hasError = true;
          return;
        }

        // Retry loading image without query parameters
        const sourceWithNoQuery = removeQuery(this.image);
        if (!this.worker || this.retryCount) {
          this.source = sourceWithNoQuery;
        }
        else {
          this.retryLoadingWithWebWorker(sourceWithNoQuery);
        }
        this.retryCount += 1;
      },
      handleMouseEnter() {
        this.$eventBus.emit('imageMouseOver', { el : this.$el });
      },
      handleMouseLeave() {
        this.$eventBus.emit('imageMouseLeave', { el : this.$el });
      },
      createWebWorker() {
        if (typeof window !== 'undefined' && window.Worker && window.XMLHttpRequest) {
          return new Worker('/workers/image-loader.js');
        }
      },
      destroyWorker() {
        if (this.worker) {
          this.worker.removeEventListener('message', this.handleWorkerMessage);
          this.worker.terminate();
          this.worker = null;
        }
      },
      cleanUpWorker() {
        if (this.objectURL) {
          URL.revokeObjectURL(this.objectURL);
        }
        this.destroyWorker();
      },
      loadImageWithWorker() {
        try {
          if (!this.worker) {
            this.source = this.image;
            return;
          }

          this.worker.addEventListener('message', this.handleWorkerMessage);
          this.worker.postMessage({ source : this.image });
        }
        catch (error) {
          console.error('loadImageWithWorker error:', error.message);
        }
      },
      retryLoadingWithWebWorker(source) {
        try {
          this.worker.postMessage({ source });
        }
        catch (error) {
          console.error('retryLoadingWithWebWorker error:', error.message);
        }
      },
      handleWorkerMessage({ data }) {
        try {
          if (data instanceof Error) {
            return this.handleImageError(data);
          }

          const { blob } = data;
          if (blob) {
            (this.objectURL && URL.revokeObjectURL(this.objectURL));
            this.objectURL = URL.createObjectURL(blob);
            this.source = this.objectURL;
            return;
          }

          this.source = this.image;
        }
        catch (error) {
          console.error('handleWorkerMessage error:', error.message);
        }
      }
    }
  };
</script>

<style lang="scss">
$transitions: (
  "normal" : 0.5s,
  "fast" : 0.3s,
  "slow" : 1s
);

.ImagePreLoader {
  position: relative;
  width: 100%;
  overflow: hidden;
  height: 100%;

  @each $transition, $duration in $transitions {
    .pre-load-fade-#{$transition}-leave-active,
    .pre-load-fade-#{$transition}-enter-active {
      transition: opacity $duration $easeInOutSine;
    }
    .pre-load-fade-#{$transition}-enter-to,
    .pre-load-fade-#{$transition}-leave {
      opacity: 1;
    }
    .pre-load-fade-#{$transition}-leave-to,
    .pre-load-fade-#{$transition}-enter {
      opacity: 0;
    }
  }

  &--absolute {
    position: absolute;
    top: 0;
    left: 0;
  }
  &--error {
    display: none;
  }
  &--force-aspect-ratio {
    height: auto;
  }
  &__image {
    display: block;
    width: 100%;
    height: 100%;
    z-index: 2;
    object-position: 50% 50%;
    image-rendering: crisp-edges;
    transition: opacity 0.5s $easeInOutSine,
      transform 0.5s $easeInQuad;
    &--contain {
      object-fit: contain;
    }
    &--cover {
      object-fit: cover;
    }
    &--fill {
      object-fit: fill;
    }
    &--none {
      /*object-fit: none;*/
      height: auto;
      .ImagePreLoader--force-aspect-ratio & {
        height: 100%;
        object-fit: contain;
      }
    }
    &--scale-down {
      object-fit: scale-down;
    }
    &--relative {
      position: relative;
    }
    &--absolute {
      position: absolute;
      top: 0;
      left: 0;
    }
    &:hover {
      transition: opacity 0.5s $easeInOutSine,
        transform 0.5s $easeOutQuad;
    }
  }
  &__aspect-ratio-vertical-spacer {
    position: relative;
    width: 100%;
    z-index: 1;
  }
}
</style>
