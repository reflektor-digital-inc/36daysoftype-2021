<template>
  <div>{{ hasLoaded }}</div>
</template>

<script>
  import loadingLogic from '@mixins/loading-logic';

  export default {
    name : 'LoaderBase',
    mixins : [loadingLogic]
  };
</script>

