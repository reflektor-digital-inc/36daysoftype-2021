export default {
  state : {
    height : 0,
    width : 0,
    positionX : 0,
    positionY : 0,
    theme : 'dark',
    isOpen : false
  },
  mutations : {
    setNavigationSize(state, size) {
      const { x, y, width, height } = size;
      state.height = height;
      state.width = width;
      state.positionX = x;
      state.positionY = y;
    },
    setNavigationTheme(state, theme) {
      const themes = [ 'light', 'dark' ];
      if (!themes.includes(theme)) {
        console.error(`Theme: ${theme} invalid. Value must be one of: light, dark.`);
        return;
      }
      state.theme = theme;
    },
    openNav(state) {
      state.isOpen = true;
    },
    closeNav(state) {
      state.isOpen = false;
    }
  }
};
