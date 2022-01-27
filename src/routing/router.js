import { createRouter, createWebHistory } from 'vue-router';
import routes from 'virtual:generated-pages';
import store from '@src/store/store.js';

const router = createRouter({
  history : createWebHistory(),
  routes
});

const hasQueryParams = route => !!Object.keys(route.query).length;
router.beforeEach((to, from, next) => {
  // redirect on route changes with no matching path
  if (!to.matched.length) {
    next('/');
    return;
  }

  const isToLetter = to.path.split('/')[1] === 'letter';
  const isFromLetter = from.path.split('/')[1] === 'letter';
  if (isToLetter || isFromLetter) {
    store.commit('loader/setTransitionState', { isTransitioning : true, next });
  }
  else {
    setTimeout(() => {
      if (!hasQueryParams(to) && hasQueryParams(from)) {
        next({ name : to.name, query : from.query });
      }
      else {
        next();
      }
    }, 100);
  }
});

router.afterEach((to, from) => {
  let toPage;
  if (to.path.includes('about')) toPage = 'about';
  else if (to.path.includes('contact')) toPage = 'contact';
  else if (to.path.includes('letter')) toPage = 'letter';
  else if (to.path.includes('market')) toPage = 'market';
  else toPage = 'home';
  store.commit('loader/setTransitionState', { isTransitioning : false, toPage });

  const isToLetter = to.path.split('/')[1] === 'letter';
  const isFromLetter = from.path.split('/')[1] === 'letter';
  if (isToLetter || isFromLetter) {
    store.commit('loader/setHasLoaded', false);
  }
});

export default router;
