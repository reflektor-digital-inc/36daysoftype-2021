<template>
  <div
    :class="rootElClasses"
    @blur="handleBlur"
  >
    <div class="CustomDropDown__content-wrapper">
      <div
        class="CustomDropDown__input-wrapper"
        @click="handleInputClick"
      >
        <label
          v-if="!breakPointMobile"
          :for="inputID"
          class="CustomDropDown__input-label"
        >
          {{ optionValue || placeholder }}
        </label>
        <input
          :id="inputID"
          :value="optionValue"
          :form="formID"
          :name="inputID"
          class="CustomDropDown__input"
          autocomplete="off"
          type="hidden"
        >
        <!-- OPEN/CLOSE DROPDOWN TOGGLE BUTTON -->
        <div class="CustomDropDown__toggle-button">
          <slot name="toggleButton">
            <svg
              ref="triangleSVG"
              class="CustomDropDown__triangle-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 12.25 7.12"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                id="triangle"
                class="cls-1"
                d="M6.125,7l-.1.12V6.88L0,0H12.25L6.23,6.88V7.12Z"
              />
            </svg>
          </slot>
        </div>
      </div>

      <div
        ref="optionsListWrapper"
        :class="optionsListWrapperClasses"
      >
        <!-- DESKTOP CUSTOM OPTIONS -->
        <ul
          v-if="!breakPointMobile"
          ref="optionsList"
          class="CustomDropDown__options-list"
          role="listbox"
          tabindex="0"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeyDown"
          @keyup.escape="handleEscape"
          @keyup.tab="handleTab"
          @keydown.tab="handleTab"
        >
          <li
            v-for="(option, index) of options"
            ref="options"
            :key="option"
            :class="['CustomDropDown__option', {
              'CustomDropDown__option--selected' : selectedOptionIndex === index
            }]"
            :tabindex="isListOpen ? '0' : '-1'"
            role="option"
            @click="handleOptionSelected($event, option, index)"
            @keyup.enter="handleOptionSelected($event, option, index)"
            @keyup.escape="handleEscape"
          >
            <!--{{ optionType === 'month' ? `${option} - ${index + 1}` : option }}-->
            {{ option }}
          </li>
        </ul>

        <!-- MOBILE OPTIONS USING BROWSER DEFAULT LAYOUT -->
        <template v-else>
          <select
            ref="select"
            v-model="optionValue"
            class="CustomDropDown__select typo__custom-drop-down-select"
            tabindex="0"
            @blur="handleSelectBlur"
            @focus="handleSelectFocus"
          >
            <option
              disabled
              value=""
            >
              {{ placeholder }}
            </option>
            <option
              v-for="option of options"
              :key="option"
              class=""
              tabindex="0"
            >
              {{ option }}
            </option>
          </select>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import { v4 as uuidV4  } from 'uuid';
  import PerfectScrollbar from '@reflektor/perfect-scrollbar';

  export default {
    name : 'CustomDropDown',
    props : {
      formID : {
        type : String,
        required : true
      },
      hasError : {
        type : Boolean,
        default : false
      },
      optionType : {
        type : String,
        required : true
      },
      placeholder : {
        type : String,
        required : true
      },
      options : {
        type : Array,
        required : true
      },
      tabIndex : {
        type : Number,
        default : 0
      },
      selectedOption : {
        type : [String, Number],
        default : ''
      }
    },
    data() {
      return {
        optionValue : this.selectedOption,
        isListOpen : false,
        inputID : uuidV4(),
        selectedOptionIndex : 0,
        isAnimating : false
      };
    },
    computed : {
      breakPointMobile() {
        return this.$store.getters.breakpointMobile;
      },
      rootElClasses() {
        return [
          'CustomDropDown',
          'typo__custom-drop-down',
          {
            'CustomDropDown--open' : this.isListOpen,
            'CustomDropDown--closed' : (!this.isListOpen && !this.isAnimating),
            'CustomDropDown--error' : this.hasError
          }
        ];
      },
      optionsListWrapperClasses() {
        return [
          'CustomDropDown__options-list-wrapper',
          {
            'CustomDropDown__options-list-wrapper--open' : this.isListOpen,
            'CustomDropDown__options-list-wrapper--closed' : !this.isListOpen
          }
        ];
      },
      selectedOptionEl() {
        const { options } = this.$refs;
        if (options) {
          return options[this.selectedOptionIndex];
        }
        else {
          return null;
        }
      },
      totalOptions() {
        return this.options.length;
      }
    },
    watch : {
      optionValue() {
        this.$emit('update:value', {
          value : this.optionValue,
          type : this.optionType,
          index : this.selectedOptionIndex
        });
        (this.selectedOptionEl && this.selectedOptionEl.blur());
      }
    },
    mounted() {
      const { optionsList } = this.$refs;

      if (optionsList) {
        this.perfectScrollBar = new PerfectScrollbar(this.$refs.optionsList, {
          suppressScrollX : true,
          suppressScrollY : false,
          swipeEasing : true,
          wheelSpeed : 1,
          easingMultiplier : 0.9,
          maxScrollbarLength : 15,
          minScrollbarLength : 15
        });

        const [ scrollBarThumb ] = this.$el.getElementsByClassName('ps__thumb-y');
        if (scrollBarThumb) {
          scrollBarThumb.tabIndex = -1;
        }
      }
    },
    beforeUnmount() {
      if (this.perfectScrollBar) {
        this.perfectScrollBar.destroy();
        this.perfectScrollBar = null;
      }
    },
    methods : {
      closeDropDown() {
        const { optionsListWrapper } = this.$refs;

        if (this.openTimeline && this.openTimeline.isActive()) {
          this.openTimeline.seek('end');
        }

        this.closeTimeline = new TimelineMax({
          onStart : () => {
            this.isAnimating = true;
          },
          onComplete : () => {
            this.isListOpen = false;
            (this.selectedOptionEl && this.selectedOptionEl.blur());
            this.isAnimating = false;
            this.$el.style.zIndex = 1;
            this.$emit('dropdown:closed');
          }
        });

        this.closeTimeline
          .to(optionsListWrapper, 0.5, {
            height : 0,
            ease : Quad.easeIn
          })
          .addLabel('end');
      },
      openDropDown() {
        const { optionsListWrapper } = this.$refs;

        if (this.closeTimeline && this.closeTimeline.isActive()) {
          this.closeTimeline.seek('end');
        }

        this.openTimeline = new TimelineMax({
          onStart : () => {
            this.$el.style.zIndex = 2;
            this.isAnimating = true;
            this.$emit('drop-down:open', this);
          },
          onComplete : () => {
            this.isListOpen = true;
            this.isAnimating = false;
          }
        });

        this.openTimeline
          .to(optionsListWrapper, 0.5, {
            height : 220,
            ease : Quad.easeOut
          })
          .addLabel('end');
      },
      getKeyEventValue(event) {
        const { key, keyIdentifier, keyCode } = event;

        // return (key || keyIdentifier || keyCode || false);

        if (key !== undefined) {
          return key;
        }
        else if (keyIdentifier !== undefined) {
          return keyIdentifier;
        }
        else if (keyCode !== undefined) {
          return keyCode;
        }
        return false;
      },
      handleKeyDown(event) {
        // console.group('KEY DOWN');
        const key = this.getKeyEventValue(event);
        switch (key) {
          case 'Escape': // code, key
          case 27: // keyCode
            // this.$el.blur();
            // (this.selectedOptionEl && this.selectedOptionEl.blur());
            this.handleEscape();
            break;
          case 'ArrowDown': // code, key
          case 40: // keyCode
            event.preventDefault();
            if (this.selectedOptionIndex < this.totalOptions - 1) {
              this.selectedOptionIndex += 1;
            }
            (this.selectedOptionEl && this.selectedOptionEl.focus());
            break;
          case 'ArrowUp': // code, key
          case 38:// keyCode
            event.preventDefault();
            if (this.selectedOptionIndex > 0) {
              this.selectedOptionIndex -= 1;
            }
            (this.selectedOptionEl && this.selectedOptionEl.focus());
            break;
          default:
            break;
        }

        // console.groupEnd();
      },
      handleBlur() {
        if (!this.breakPointMobile) {
          this.closeDropDown();
        }
      },
      handleFocus() {
        this.selectedOptionEl.focus();
        this.openDropDown();
      },
      handleMouseLeave() {
        this.closeDropDown();
      },
      handleInputClick() {
        if (!this.breakPointMobile) {
          (this.isListOpen ?
            this.closeDropDown() :
            this.openDropDown()
          );
        }
      },
      handleOptionSelected(event, optionValue, index) {
        this.optionValue = optionValue;
        this.selectedOptionIndex = index;
        this.closeDropDown();
      },
      handleEscape() {
        this.$el.blur();
        (this.selectedOptionEl && this.selectedOptionEl.blur());
        this.closeDropDown();
      },
      handleTab(event) {
        if (!this.isAnimating) {
          event.preventDefault();
          this.closeDropDown();
        }
      },
      handleSelectFocus() {
        this.isListOpen = true;
      },
      handleSelectBlur() {
        this.isListOpen = false;
      }
    }
  };
</script>

<style lang="scss">

  .CustomDropDown {
    /* CustomDropDown variables */
    $horizontal-padding: 20px;
    $horizontal-padding-mobile: 14px;
    $input-height: 50px;
    $input-height-mobile: 46px;
    $drop-down-height: 200px;
    $drop-down-padding-bottom: 10px;
    $text-colour: $black;
    color: $text-colour;
    position: relative;
    overflow: visible;
    height: $input-height;
    cursor: pointer;
    border: 1px solid rgba($white, 0);
    @include breakpoint($mobile) {
      height: $input-height-mobile;
    }
    &__placeholder {
      color: rgba($text-colour, 1);
    }
    &__triangle-svg {
      display: block;
      width: 12px;
      height: auto;
      fill: $black;
      transform-origin: center;
      transition: transform 0.15s $easeInQuad;
      .CustomDropDown--open & {
        transform: scaleY(-1);
        /*transition: transform 0.15s $easeOutQuad;*/
      }
      .CustomDropDown--closed & {
        transform: scaleY(1);
        /*transition: transform 0.15s $easeInQuad;*/
      }
    }
    &__content-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      background-color: $white;
      padding: 0 $horizontal-padding;

      /* NOTE 2019-04-29 andrewkim:  Temporary error styles until we get designs */
      .CustomDropDown--error & {
        background-color: $error-red;
      }
      @include breakpoint($mobile) {
        padding-right: 5px;
      }
    }
    &__input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      height: $input-height;
      width: 100%;
      cursor: pointer;
      @include breakpoint($mobile) {
        height: $input-height-mobile;
      }
    }
    &__placeholder, &__input-label {
      position: absolute;
    }
    &__input {
      appearance: none;
      border: 1px solid transparent;
      border-left: none;
      outline: none;
      margin: 0;
      padding: 10px 7px;
      background: none;
      box-shadow: none;
      flex-basis: 100%;
      flex-grow: 1;
      height: 1.44em;
      width: 0;
      &::placeholder {
        /*@include sharp-book(16, 0, 1.44);*/
        color: $text-colour;
        display: none;
      }
      &:placeholder-shown {
        height: 1.44em;
        display: none;
      }
      &-label {
        cursor: pointer;
      }
    }
    &__toggle-button {
      margin-left: auto;
      margin-right: 0;
      cursor: pointer;
    }
    &__options-list-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
      @include breakpoint($mobile) {
        overflow: visible;
        position: absolute;
        top: 0;
        left: 0;
        height: $input-height-mobile;
        select {
          -webkit-appearance: none;
          color: $text-colour;
          width: 100%;
          height: $input-height-mobile;
          padding: 0 0 0 $horizontal-padding-mobile;
          z-index: 1;
          border: none;
        }
      }
      &--closed {
        /*transition: height 0.3s $easeInQuad;*/
        height: 0;
        padding-bottom: 0;
        @include breakpoint($mobile) {
          height: $horizontal-padding-mobile;
        }
      }
      &--open {
        /*transition: height 0.5s $easeOutQuad;*/
        /*height: $drop-down-height + $drop-down-padding-bottom;*/
        padding-bottom: $drop-down-padding-bottom;
        @include breakpoint($mobile) {
          padding-bottom: 0;
        }
      }
    }
    &__options-list {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 0 $horizontal-padding 0 0;
      margin: 0;
      overflow: hidden;
      height: 200px;
      .ps {
        &__rail-y {
          @include no-select;
          width: 5px;
          background-color: rgba($white, 0.05);
          left: auto;
          right: 0;
          position: absolute;
          z-index: 10000;
          display: block;
        }
        &__thumb-y {
          width: 100%;
          background-color: $text-colour;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }
        &__rail-x {
          display: none;
        }
      }
    }
    &__option {
      padding: 5px 0;
      list-style: none;
      color: rgba($text-colour, 0.3);
      transition: color 0.2s $easeInSine;
      &:hover,
      &:focus,
      &:active,
      &--selected {
        @include no-select;
        color: rgba($text-colour, 1);
        transition: color 0.2s $easeOutSine;
      }
    }
  }

</style>
