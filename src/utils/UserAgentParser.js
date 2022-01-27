import UAParser from 'ua-parser-js';
import isElectron from './is-electron';

/**
 * @export
 * @class UserAgentParser.js.
 * @classdesc This is a basic useragent parser class that extends the ua-parser-js module.
 *
 * @requires 'ua-parser-js'
 * @see {@link https://github.com/faisalman/ua-parser-js|UA Parser JS}
 *
 * @requires 'is-electron'
 * @see {@link module:src/utils/is-electron.js}
 */
export default class UserAgentParser extends UAParser {
  static checkIsElectron() {
    isElectron;
  }

  static checkIsCordova() {
    const { os : { name = '' } } = UAParser();
    const isAndroid = name === 'Android';
    const hasHTTP = /^http(s?):\/{2}/.test(window.location.protocol);
    return (
      (window && window.hasOwn('cordova')) ||
      (!hasHTTP && isAndroid)
    );
  }

  constructor() {
    super();
    const { browser, cpu, device, engine, os } = this.getResult();
    this.browser = browser;
    this.cpu = cpu;
    this.device = device;
    this.engine = engine;
    this.os = os;
  }

  get appIsWebView() {
    return (this.device.vendor === 'Apple' &&
      this.os.name === 'iOS' &&
      this.device.type === 'tablet'
    );
  }

  get isCordova() {
    return UserAgentParser.checkIsCordova();
  }

  get isElectron() {
    return UserAgentParser.checkIsElectron();
  }
}
