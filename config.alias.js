const path = require('path');

module.exports = {
  '~' : path.resolve(__dirname, './src/'),
  '@$' : path.resolve(__dirname, './src/'),
  '@src' : path.resolve(__dirname, './src/'),
  '@config' : path.resolve(__dirname, './src/config/'),
  '@assets' : path.resolve(__dirname, './src/assets/'),
  '@components' : path.resolve(__dirname, './src/components/'),
  '@data' : path.resolve(__dirname, './src/data/'),
  '@shaders' : path.resolve(__dirname, './src/shaders/'),
  '@sections' : path.resolve(__dirname, './src/sections/'),
  '@pages' : path.resolve(__dirname, './src/pages/'),
  '@utils' : path.resolve(__dirname, './src/utils/'),
  '@mixins' : path.resolve(__dirname, './src/mixins/'),
  '@plugins' : path.resolve(__dirname, './src/plugins/'),
  '@settings' : path.resolve(__dirname, './src/settings/'),
  '@filters' : path.resolve(__dirname, './src/filters/'),
  '@storybook' : path.resolve(__dirname, './src/.storybook/')
};
