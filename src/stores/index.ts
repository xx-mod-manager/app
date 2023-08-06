import { createPinia } from 'pinia';
import { store } from 'quasar/wrappers';
import { myLogger } from 'src/boot/logger';
import { replacer } from 'src/utils/JsonUtil';
import { Router } from 'vue-router';

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module 'pinia' {
  export interface PiniaCustomProperties {
    readonly router: Router;
  }
}

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((/* { ssrContext } */) => {
  const pinia = createPinia();

  pinia.use(({ store, options }) => {
    if (options.persistence === true) {
      store.$subscribe((_, state) => {
        myLogger.debug(`Save store: [${store.$id}] to LocalStorage.`);
        localStorage.setItem(store.$id, JSON.stringify(state, replacer));
      });
    }
  });

  return pinia;
});
