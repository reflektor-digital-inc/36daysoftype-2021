<template>
  <Group ref="mesh" @hover="setColor">
    <BasicMaterial
      :color="color"
    />
  </Group>
</template>

<script>
  import gsap from 'gsap';
  import { mapGetters } from 'vuex';

  export default {
    inject : ['three'],
    props : {
      isActive : { type : Boolean, default : true }
    },
    data() {
      return {
        color : '#ff00ff'
      };
    },
    computed : {
      ...mapGetters([
        'breakpointMobile'
      ])
    },
    mounted() {
      this.mesh = this.$refs.mesh.mesh;

      gsap.ticker.add(this.update);
    },
    unmounted() {
      gsap.ticker.remove(this.update);
    },
    methods : {
      update() {
        if (this.breakpointMobile) {
          this.mesh.rotation.y += 0.1 * gsap.ticker.deltaRatio(60);
          this.mesh.rotation.x += 0.1 * gsap.ticker.deltaRatio(60);
        }
      },
      setColor({ over }) {
        this.color = over ? '#00ff00' : '#ff00ff';
      }
    }
  };
</script>
