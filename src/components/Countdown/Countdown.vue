<template>
  <div :class="rootElClasses">
    <div class="Countdown__details">
      <p class="Countdown__label">
        {{ label }}
      </p>
      <h3 class="Countdown__date">
        {{ dateLabel }}
      </h3>
    </div>
    <div class="Countdown__timer">
      <PillButton
        :label="timer"
        :timer="true"
        :is-small-button="true"
        :colored="true"
        :style="{ width : '225px' }"
      />
    </div>
  </div>
</template>

<script>
  import countdown from '@src/vendor/countdown';
  import { mapMutations } from 'vuex';
  import PillButton from '../PillButton/PillButton.vue';

  export default {
    name : 'Countdown',
    components : { PillButton },
    props : {
      label : {
        type : String,
        default : '',
        required : false
      },
      date : {
        type : String,
        default : '',
        required : true
      },
      time : {
        type : String,
        default : '',
        required : true
      },
      timezone : {
        type : String,
        default : '',
        required : false
      },
      isVerticalLayout : {
        type : Boolean,
        default : false
      }
    },
    data() {
      return {
        timer : '0d 00h 00m 00m',
        countdownInterval : null
      };
    },
    computed : {
      dateObject() {
        return new Date(Date.parse(`${this.date} ${this.time} EST`));
      },
      dateLabel() {
        const label = new Date(this.dateObject);
        const timestamp = label.toLocaleTimeString('en-us', { timeZoneName : 'short', hour12 : true }).split(' ');
        const fullDay = label.toLocaleDateString('en-US', { weekday : 'long', month : 'short', day : 'numeric' });
        return `${fullDay} - ${timestamp[0].split(':')[0]} ${timestamp[1]} ${timestamp[2]}`;
      },
      rootElClasses() {
        return [
          'Countdown',
          {
            'Countdown--vertical' : this.isVerticalLayout
          }
        ];
      }
    },
    mounted() {
      countdown.setLabels(
        '|s|m|h|d',
        '|s|m|h|d',
        ' ',
        ' '
      );
      this.refreshCountdown();
    },
    methods : {
      ...mapMutations({
        setCountdownOver : 'countdown/setCountdownOver'
      }),
      refreshCountdown() {
        this.countdownInterval = setInterval(() => {
          const countdownDetails = countdown(this.dateObject);
          if (countdownDetails.value <= 0) {
            if (countdownDetails.days === 0 && countdownDetails.hours === 0 && countdownDetails.minutes === 0 && countdownDetails.seconds === 0) {
              clearInterval(this.countdownInterval);
              this.setCountdownOver(true);
            }
            else {
              this.timer = countdown(new Date(this.dateObject)).toString();
            }
          }
          else {
            this.setCountdownOver(true);
          }
        }, 1000);
      }
    }
  };
</script>

<style lang="scss">
  .Countdown {
    display: flex;
    pointer-events: none;

    &--vertical {
      flex-direction: column;
      align-items: flex-start;

      .Countdown__details {
        align-items: flex-start;
        margin-bottom: 20px;
      }
    }

    &__details {
      margin-right: 1.5em;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: space-around;
      @include fk-grotesk-neue-regular(14, 0, math.div(22,14));
    }
    &__label {
      margin: 0;
    }

    &__date {
      margin: 0;
    }
    &__timer {
      & .PillButton__label {
        line-height: 20px;
      }
    }
  }
</style>
