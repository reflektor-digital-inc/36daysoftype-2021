import { DEVICE_VIEWPORTS } from '@src/settings';
import { numberInRange } from '@utils/basic-functions';

const { phone, tablet } = DEVICE_VIEWPORTS;

export default {
  state : {
    width : 0,
    height : 0,
    outerHeight : 0
  },
  getters : {
    windowHalfWidth(state) {
      return state.width / 2;
    },
    windowHalfHeight(state) {
      return state.height / 2;
    },
    windowOrientation(state) {
      return state.width > state.height ? 'landscape' : 'portrait';
    },
    minValue(state) {
      const { width, height } = state;
      return (width > height) ? height : width;
    },
    breakpointPhone(state) {
      const { width : { min, max } } = phone;
      return numberInRange({
        min,
        max,
        number : state.width,
        inclusive : true
      });
    },
    breakpointTablet(state) {
      const { width : { min, max } } = tablet;
      return numberInRange({
        min,
        max,
        number : state.width,
        inclusive : true
      });
    },
    breakpointMobile(state) {
      const { width : { max } } = tablet;
      const { width : { min } } = phone;
      return numberInRange({
        min,
        max,
        number : state.width,
        inclusive : true
      });
    }
  },
  mutations : {
    calculateWindowSize(state, window) {
      const { innerWidth, innerHeight, outerHeight } = window;
      const {
        documentElement : {
          clientWidth : docElClientWidth,
          clientHeight : docElClientHeight
        }
      } = document;

      const [ body ] = document.getElementsByTagName('body');
      const { clientWidth, clientHeight } = body;

      const { width : { max } } = tablet;
      const { width : { min } } = phone;
      const isMobile = numberInRange({
        min,
        max,
        number : state.width,
        inclusive : true
      });

      const x = innerWidth || docElClientWidth || clientWidth;
      const y = isMobile ? outerHeight : innerHeight || docElClientHeight || clientHeight;

      state.width = x;
      state.height = y;
    }
  }
};
