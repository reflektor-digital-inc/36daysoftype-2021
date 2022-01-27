<template>
  <div class="AboutContent" :style="aboutGrid">
    <!-- eslint-disable max-len -->
    <!-- eslint-disable vue/max-len -->
    <div class="AboutContent__content">
      <h1><GradientText text="About the Project" /></h1>
      <p>In April of 2021, the entire Reflektor Digital team participated in the annual 36 Days of Type art challenge for their second time.</p>
      <p>Building off learnings from their last time tackling the challenge, the team swiftly created 36 unique and technically impressive interactive WebGL designs; all while building up the Reflektor brand.</p>
      <h1><GradientText text="Technology Used" /></h1>
      <ul>
        <li>Three.js</li>
        <li>Trois.js</li>
        <li>Vue</li>
        <li>Blender</li>
      </ul>
      <h1>
        <GradientText text="About Reflektor" />
      </h1>
      <p>Reflektor is an award-winning design and experience studio. We love what we do and we are really good at it.</p>
      <p>We've mastered the digital tools to turn heads, win hearts, and change minds and choose to partner with  companies who create meaningful and impactful work.</p>
      <p>We don’t carry the weight of a big agency, which gives us the ability to be laser-focused on projects we're passionate about, iterate quickly, and invest in our client relationships. We take great pride in our work so you can too.</p>
    </div>
    <div class="AboutContent__side">
      <div class="AboutContent__cell">
        <!-- -->
      </div>
    </div>
  </div>
</template>

<script>
  import GradientText from '@components/GradientText/GradientText.vue';

  export default {
    name : 'ColumnsOverlay',
    components : { GradientText },
    props : {
      columns : {
        type : Number,
        default : 4
      }
    },
    computed : {
      aboutGrid() {
        const left = Math.max(this.columns - 2, 2);
        const right = this.columns - left;
        return {
          gridTemplateColumns : `${left}fr ${right}${right && 'fr'}`
        };
      }
    }
  };
</script>

<style lang="scss">

  .AboutContent {
    display: grid;
    grid-auto-flow: column;
    &__content {
      background: $bg-gradient;
      padding: 45px;
      padding-bottom: 100px;
      color: $white;
      & h1 {
        margin-top: 85px;
        margin-bottom: 30px;
        @include fk-display-regular-alt(60, -0.5, 1.2);
      }
      & p {
        @include fk-grotesk-neue-regular(16, -0.1, 1.3);
        max-width: 700px;
      }
    }
    &__side {
      //
    }
  }

</style>
