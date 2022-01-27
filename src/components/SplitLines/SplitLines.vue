<template>
  <div ref="splitLines" class="SplitLines">
    <slot />
  </div>
</template>

<script>
  import gsap from 'gsap';
  import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
  import { useStore } from 'vuex';
  import _throttle from 'lodash/throttle';

  export default {
    props : {
      options : { type : Object, default() { return { duration : 1, stagger : 0.25 }} }
    },
    setup(props, { slots }) {
      const splitLines = ref(null);
      const splitChild = ref(null);
      const splitParent = ref(null);
      const animation = gsap.timeline();
      const store = useStore();

      onMounted(() => {
        createEnter();
      });
      onUnmounted(() => {
        revertSplit();
      });

      onBeforeUnmount(() => {
        animation.reverse(0);
      });
      const windowSize = computed(() => store.state.windowSize);
      
      const createEnter = () => {
        animation.clear();
        const target = slots.default ? splitLines.value.children : splitLines.value;
        const { tl, splitChild : child, splitParent : parent } = gsap.effects.splitLines(target, props.options);
        splitChild.value = child;
        splitParent.value = parent;
        animation.add(tl);
      };
      const revertSplit = () => {
        splitParent.value?.revert();
        splitChild.value?.revert();
      };

      const play = () => animation.play(0);
      const pause = () => animation.pause();
      const reverse = () => animation.reverse(0);

      watch(
        windowSize,
        _throttle(() => {
          revertSplit();
          nextTick(() => {
            createEnter();
            animation.seek(animation.duration(), false);
          });
        }, 200, {
          trailing : true
        }),
        { deep : true }
      );
      return {
        splitLines,
        play,
        pause,
        reverse
      };
    }
  };
</script>
<!--
<style lang="scss">
  .SplitLines {
    //
  }

</style> -->
