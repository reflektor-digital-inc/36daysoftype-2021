import MobileDetect from 'mobile-detect';

const md = new MobileDetect(window.navigator.userAgent);

const checkDeviceHasTouch = () => {
  /**
   * @external Source: https://stackoverflow.com/a/4819886
   */
  const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  const mq = query => window.matchMedia(query).matches;

  if (
    ('ontouchstart' in window) ||
    (window.DocumentTouch && document instanceof DocumentTouch) ||
    (navigator.MaxTouchPoints > 0) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0) ||
    (process.client && window.Modernizr && window.Modernizr.touchevents)
  ) {
    return true;
  }

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  const query = [ '(', prefixes.join('touch-enabled),('), 'heartz', ')' ].join('');
  return mq(query);
};

export const queryDevice = () => {
  const md = new MobileDetect(window.navigator.userAgent);
  return {
    isMobile : md.mobile(), // Tablets and Phones
    isPhone : md.phone(), // Phones only
    isTablet : md.tablet(),
    isFirefox : md.match('firefox'),
    isSafari : md.match('safari'),
    isTouch : checkDeviceHasTouch(),
    isAndroid : !!(md.os() === 'AndroidOS')
  };
};

export default {
  isMobile : md.mobile(), // Tablets and Phones
  isPhone : md.phone(), // Phones only
  isTablet : md.tablet(),
  isBot : md.is('bot') || md.match('prerender'),
  isFirefox : md.match('firefox'),
  isSafari : md.match('safari'),
  isTouch : checkDeviceHasTouch(),
  isAndroid : !!(md.os() === 'AndroidOS'),
  isWebView : (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i).test(navigator.userAgent)
};
