import { matPriorityHigh } from '@quasar/extras/material-icons';
import { Loading, Notify } from 'quasar';
import { refreshTokenInfo } from 'src/api/GithubAuthApi';
import { myLogger } from 'src/boot/logger';
import { useAuthDataStore } from 'src/stores/AuthData';
import { Router } from 'vue-router';
import { ROUTE_HOME, ROUTE_LOGIN } from './routes';

export default function registerGlobalGuards(router: Router) {
  router.beforeEach(async (to) => {
    const authDataStore = useAuthDataStore();
    if (to.meta.requireLogin) {
      if (!authDataStore.activeToken) {
        if (authDataStore.activeRefreshToken) {
          myLogger.debug('Refresh token.');
          Loading.show({ message: '刷新Github Token中...', delay: 400 });
          try {
            if (authDataStore.authInfo) {
              const newToken = await refreshTokenInfo({
                access_token: authDataStore.authInfo.accessToken,
                refresh_token: authDataStore.authInfo.refreshToken,
                expires_in: 0,
                refresh_token_expires_in: 0,
              });
              authDataStore.update(newToken);
            }
          } catch (e) {
            myLogger.error('Refresh token fail.', e);
            Notify.create({
              type: 'warning',
              message: '刷新Github Token失败!',
              icon: matPriorityHigh,
            });
            authDataStore.clear();
            return { name: ROUTE_LOGIN };
          } finally {
            Loading.hide();
          }
        } else {
          myLogger.info(`Route ${to.name?.toString()} require login.`);
          return { name: ROUTE_LOGIN };
        }
      }
    } else if (to.meta.requireNotLogin) {
      if (authDataStore.isLogin) {
        myLogger.info(`Route ${to.name?.toString()} require not login.`);
        return { name: ROUTE_HOME };
      }
    }
  });
}
