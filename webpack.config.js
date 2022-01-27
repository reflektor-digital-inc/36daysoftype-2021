// A mock config to enable alias lookups for Webstorm as Webstorm can't read vite.config.js files.

const configAlias = require('./config.alias');

module.exports = {
  resolve : {
    extensions : ['.js', '.vue', '.scss'],
    alias : configAlias
  }
};
