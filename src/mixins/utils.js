import _get from 'lodash.get';
import CustomCursor from '@src/cursor/custom-cursor';
import contentfulConfig from '@src/../contentful.config';
import Contentful from '~/src/utils/Contentful';
import { wait } from '~/src/utils/basic-functions';
import eventBus from '~/src/utils/event-bus';
import Device from '~/src/utils/device';

const contentful = new Contentful(contentfulConfig);
const device = new Device();
const customCursor = new CustomCursor();

export default {
  created() {
    this.$cms = contentful;
    this.$eventBus = eventBus;
    this.$customCursor = customCursor;
  },
  data() {
    return {
      $_device : {}
    };
  },
  mounted() {
    // console.log('MOUNTED WINDOW_NAVIGATOR_USER_AGENT:', window.navigator.userAgent);
    // NOTE 2020-07-23 andrewkim: Properties that start with _ or $ will not be proxied on the
    // Vue instance because they may conflict with Vue’s internal properties and API methods.
    // You will have to access them as this.$data._property
    device.init();
    this.$data.$_device = device;
    this.$device = device;
  },
  methods : {
    $_get : _get,
    $_wait : wait,
    $_log : console.log.bind(console), /* eslint no-console: off */
    $_parsePipe : (str, replacer = ' ') => str.replace(/(\|)/g, replacer),

    /**
     * @function $_padNumber
     * @param {String|Number} number
     * @return {String} the padded number
     *
     * @author Andrew Kim <andrew@reflektor.digital>
     */
    $_padNumber : (number) => {
      if (typeof number === 'string') {
        const [ integer, floatingPoint = '' ] = number.split('.');
        const digits = integer.length;

        // Padding number with leading zero, only if the number is less than 10
        let padding = '';
        if (digits < 2) {
          for (let i = 0; i < digits; i++) {
            padding += '0';
          }
        }

        return `${padding}${integer}.${floatingPoint}`;
      }

      if (typeof number === 'number') {
        return (number < 10 ? `0${number}` : `${number}`);
      }

      return number;
    }
  }
};
