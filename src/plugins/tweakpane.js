import Tweakpane from 'tweakpane';

export default {
  install : (app) => {
    app.config.globalProperties.$tweakpane = new Tweakpane();
    app.config.globalProperties.$tweakpane.hidden = true;
  }
};
