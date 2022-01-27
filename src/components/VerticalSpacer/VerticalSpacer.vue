<template>
  <div
    :style="componentHeight"
    class="VerticalSpacer"
  />
</template>

<script>
  export default {
    name : 'VerticalSpacer',
    props : {
      height : {
        type : [ Number, String ],
        required : true,
        validator(value) {
          return /^[\d]+[.]?[\d]+[%]?$/g.test(value);
        }
      }
    },
    computed : {
      componentHeight() {
        let reducedHeight = this.height;
        if (typeof this.height === 'number') {
          reducedHeight = this.height;
        }

        if (typeof this.height === 'string') {
          const hasPercent = /^\d*\.?\d*%$/.test(this.height);

          if (hasPercent) {
            const noPercentCharacter = this.height.replace(/%$/, '');
            reducedHeight = Number(noPercentCharacter);
          }
          else {
            reducedHeight = Number(this.height);
          }

          // const height = (hasPercent ? this.height : `${this.height}%`);
          // return { paddingTop : height };
        }

        return { paddingTop : `${reducedHeight}%` };
      }
    }
  };
</script>

<style lang="scss">

  .VerticalSpacer {
    position: relative;
    width: 100%;
  }

</style>
