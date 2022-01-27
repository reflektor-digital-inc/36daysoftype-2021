import Spring from '../utils/spring-physics';

export default {
  install : (app) => {
    app.config.globalProperties.$spring = Spring();
  }
};