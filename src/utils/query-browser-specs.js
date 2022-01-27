/**
 * Browser information
 * @typedef {Object} Browser
 * @property {String} name - The name of the browser ex. Safari, Firefox
 * @property {String} version - The browser version
 */

/**
 * @function queryBrowserSpecs
 * @description parses userAgent string from browser (supports Edge)
 * @return {Browser}
 *
 * @see {@link https://stackoverflow.com/a/16938481|Source}
 */
export const queryBrowserSpecs = () => {
  const ua = navigator.userAgent;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  let tem;

  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {
      name : 'IE',
      version : (tem[1] || '')
    };
  }

  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) {
      return {
        name : tem[1].replace('OPR', 'Opera'),
        version : tem[2]
      };
    }
  }

  M = M[2] ? [ M[1], M[2] ] : [ navigator.appName, navigator.appVersion, '-?' ];

  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }

  return {
    name : M[0],
    version : M[1]
  };
};

/**
 * @function getBrowser
 * @description parses userAgent string from browser (does not support Edge)
 * @return {Browser}
 * source: https://stackoverflow.com/a/38080051
 */
export const getBrowser = () => {
  const ua = navigator.userAgent;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  let tem;

  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {
      name : 'IE',
      version : (tem[1] || '')
    };
  }

  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR|Edge\/(\d+)/);
    if (tem != null) {
      return {
        name : 'Opera',
        version : tem[1]
      };
    }
  }

  M = M[2] ? [ M[1], M[2] ] : [ navigator.appName, navigator.appVersion, '-?' ];

  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }

  return {
    name : M[0],
    version : M[1]
  };
};
