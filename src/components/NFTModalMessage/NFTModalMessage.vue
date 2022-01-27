<template>
  <div class="NFTModalMessage">
    <p :class="messageClasses">
      {{ message }}
      <a
        v-if="link"
        :href="link"
        class="NFTModalMessage--link"
      >{{ linkLabel }}</a>
    </p>
  </div>
</template>

<script>

  export default {
    name : 'NFTModalMessage',
    props : {
      message : {
        type : String,
        default : '',
        required : true
      },
      type : {
        type : String,
        default : '',
        required : true
      },
      link : {
        type : String,
        default : ''
      },
      linkLabel : {
        type : String,
        default : ''
      }
    },
    computed : {
      messageClasses() {
        return [
          'NFTModalMessage--message',
          {
            'NFTModalMessage--success' : this.type === 'success',
            'NFTModalMessage--error' : this.type === 'error'
          }
        ];
      }
    }
  };
</script>

<style lang="scss">
  .NFTModalMessage {
    &--link {
      text-decoration: underline;
    }
    &--message {
      margin-top: 20px;
      @include fk-grotesk-neue-regular(11, 0, math.div(20, 11));
      width: 100%;
      position: relative;
      margin-left: 20px;
      &::before {
        content: '';
        position: absolute;
        top: 5px;
        left: -20px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: white;
      }
    }
    &--success {
      &::before {
        background: #2ae7ff;
      }
    }
    &--error {
      &::before {
        background: #f9076a;
      }
    }
  }
</style>
