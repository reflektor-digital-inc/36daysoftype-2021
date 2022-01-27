import { camelCase } from 'change-case';

export function loadModules() {
  const context = import.meta.globEager('./*.js');
  const modules = {};

  Object.keys(context).forEach((key) => {
    if (key === './index.js') return;
    const moduleKey = camelCase(key.replace(/(\.\/|\.js)/g, ''));
    modules[moduleKey] = context[key].default;
    context[key].default.namespaced = true;
  });

  return { context, modules };
}

export const { context, modules } = loadModules();
