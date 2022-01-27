<template>
  <div :class="rootElClasses">
    <label
      v-if="label"
      :for="name"
      class="CustomInput__label"
    >
      {{ label }}
    </label>
    <input
      v-model="inputValue"
      :type="type"
      :name="name"
      v-bind="inputAttributes"
      class="CustomInput__input"
    >
  </div>
</template>

<script>
  export default {
    name : 'CustomInput',
    props : {
      value : { // v-model or :value passed down from parent
        type : String,
        default : ''
      },
      label : {
        type : String,
        default : ''
      },
      type : { // as input type
        type : String,
        required : true,
        validator(value) {
          return [
            'text',
            'number',
            'button',
            'radio',
            'checkbox',
            'email',
            'password',
            'submit',
            'search'
          ].includes(value);
        }
      },
      name : { // unique identifier for component
        type : String,
        required : true
      },
      error : { // optional error class for toggling error state
        type : Boolean,
        default : false
      },
      inputAttributes : {
        type : Object,
        default : () => ({})
      }
    },
    data() {
      return {
        inputValue : this.value
      };
    },
    computed : {
      rootElClasses() {
        return [
          'CustomInput global__custom-input-container',
          {
            'CustomInput--error' : this.error
          }
        ];
      }
    },
    watch : {
      inputValue() {
        this.$emit('update:value', {
          value : this.inputValue,
          name : this.name
        });
      }
    }
  };
</script>

<style lang="scss">

  .CustomInput {
    display: inline-block;
    position: relative;
    &--error {
      .CustomInput {
        &__input {
          color: #e62048;  /* default - change based on project specs */
          transition: color 0.2s $easeOutSine;
          &::-webkit-input-placeholder, &::placeholder {
            color: #e62048; /* default - change based on project specs */
            transition: color 0.2s $easeOutSine;
          }
        }
      }
    }
    &__input {
      @include input-no-border;
      position: relative;
      border: none;
      width: 100%;
      height: 100%;
      transition: color 0.2s $easeInSine;
      &::-webkit-input-placeholder, &::placeholder {
        transition: color 0.2s $easeInSine;
      }
      &:focus {
        outline: none;
      }
      .global__theme--dark & {
        color: #fff;
        background-color: #000;
      }
      .global__theme--light & {
        color: #000;
        background-color: #fff;
      }
    }
  }

</style>
