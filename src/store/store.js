import { createStore, useStore as baseUseStore } from 'vuex';
import { loadModules, context, modules } from './modules';

const store = createStore({
  modules
});

export function useStore() {
  return baseUseStore();
}

if (import.meta.hot) {
  import.meta.hot?.accept(context.id, () => {
    const { modules } = loadModules();
    store.hotUpdate({
      modules
    });
  });
}

export default store;
