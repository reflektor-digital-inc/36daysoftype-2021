import { createApp } from 'troisjs';
import VueCookies from 'vue3-cookies';
import App from './App.vue';
import Router from './routing/router.js';
import Store from './store/store.js';
import TweakpanePlugin from './plugins/tweakpane.js';
import AudioController from './plugins/audio-controller.js';
import Wallet from './plugins/wallet';

import 'normalize.css/normalize.css';
import '@src/styles/index.scss';

const app = createApp(App);

app.use(Router);
app.use(Store);
app.use(TweakpanePlugin);
app.use(AudioController);
app.use(VueCookies);
app.use(Wallet);
// TODO Setup up something like old boilerplate plugins
app.config.performance = true;
app.mount('#app');
