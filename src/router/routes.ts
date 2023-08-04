import { myLogger } from 'src/boot/logger';
import { useMainDataStore } from 'src/stores/MainData';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { RouteRecordRaw } from 'vue-router';

export const ROUTE_HOME = 'home';
export const ROUTE_RESOURCES = 'resources';
export const ROUTE_RESOURCE = 'resource';
export const ROUTE_RESOURCE_MANAGE = 'resourceManage';
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
        beforeEnter: (to) => {
          const resourceid = to.params.id as string;
          const resource = useMainDataStore().getOptionResourceById(useUserConfigStore().currentGameId, resourceid);
          if (resource === undefined) {
            myLogger.error(`Resource: [${resourceid}] not exits.`);
            return { name: ROUTE_404 };
          }
          return true;
        }
      },
      { path: 'resource-manage', name: ROUTE_RESOURCE_MANAGE, component: () => import('pages/resource/ResourceManagePage.vue'), meta: { requireLogin: false } }
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

export default routes;
