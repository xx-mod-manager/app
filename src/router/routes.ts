import { matPriorityHigh } from '@quasar/extras/material-icons';
import { Loading, Notify } from 'quasar';
import { refreshTokenInfo } from 'src/api/GithubAuthApi';
import { myLogger } from 'src/boot/logger';
import { useAuthDataStore } from 'src/stores/AuthData';
import { useMainDataStore } from 'src/stores/MainData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { RouteLocationNormalized, RouteRecordRaw, Router } from 'vue-router';

export const ROUTE_HOME = 'home';
export const ROUTE_RESOURCES = 'resources';
export const ROUTE_RESOURCE = 'resource';
export const ROUTE_RESOURCE_MANAGE = 'resourceManage';
export const ROUTE_RESOURCE_IMPORT = 'resourceImport';
export const ROUTE_LOGIN = 'login';
export const ROUTE_404 = '404';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_HOME,
    redirect: () => {
      if (window.electronApi === undefined)
        return { name: ROUTE_RESOURCES };
      else return { name: ROUTE_RESOURCE_MANAGE };
    },
    component: () => import('layouts/MainLayout.vue'),
    meta: { requireLogin: true },
    children: [
      { path: 'resource', name: ROUTE_RESOURCES, component: () => import('pages/resource/ResourcesPage.vue') },
      {
        path: 'resource/:id', name: ROUTE_RESOURCE, component: () => import('pages/resource/ResourcePage.vue'),
        beforeEnter: existResourceGuard
      },
      { path: 'resource-manage', name: ROUTE_RESOURCE_MANAGE, component: () => import('pages/resource/ResourceManagePage.vue'), meta: { requireLogin: false } },
      { path: 'resource-import', name: ROUTE_RESOURCE_IMPORT, component: () => import('pages/resource/ResourceImportPage.vue'), meta: { requireLogin: false } }
    ],
  },
  {
    path: '/login',
    name: ROUTE_LOGIN,
    meta: { requireNotLogin: true },
    component: () => import('layouts/LoginLayout.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    name: ROUTE_404,
    component: () => import('layouts/ErrorNotFoundLayout.vue'),
  },
];

export function registerGlobalGuards(router: Router) {
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
              await authDataStore.update(newToken);
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

export function existResourceGuard(to: RouteLocationNormalized) {
  const resourceid = to.params.id as string;
  const { getOptionResourceById } = useMainDataStore();
  const userConfigStore = useUserConfigStore();
  const resource = getOptionResourceById(userConfigStore.currentGameId, resourceid);
  if (resource === undefined) {
    myLogger.error(`Resource: [${resourceid}] not exits.`);
    return { name: ROUTE_404 };
  }
  return true;
}

export default routes;
