<template>
  <div class="LoaderTest">
    <Loader :is-active="loaderIsActive" />
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  import Loader from '../components/Loader/Loader.vue';

  export default {
    name : 'LoaderTest',
    components : {
      Loader
    },
    data() {
      return {
        loaderIsActive : true
      };
    },
    mounted() {
      this.setLoaderState(true);
    },
    methods : {
      ...mapMutations({
        setLoaderState : 'loader/setLoaderState'
      })
    }
  };
</script>

<style lang="scss">
  .LoaderTest {
    @include full-size;
    // background-color: lightcoral;
  }
</style>
