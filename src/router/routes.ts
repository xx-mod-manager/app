import { RouteRecordRaw } from 'vue-router';

export const ROUTE_HOME = 'home';
export const ROUTE_ASSETS = 'assets';
export const ROUTE_ASSET = 'asset';
export const ROUTE_ASSET_MANAGER = 'assetManager';
export const ROUTE_LOGIN = 'login';
export const ROUTE_404 = '404';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_HOME,
    redirect: 'asset',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'asset', name: ROUTE_ASSETS, component: () => import('pages/AssetsPage.vue') },
      { path: 'asset/:id', name: ROUTE_ASSET, component: () => import('pages/AssetPage.vue') },
      { path: 'asset-manager', name: ROUTE_ASSET_MANAGER, component: () => import('pages/AssetManagerPage.vue') }
    ],
  },
  {
    path: '/login',
    name: ROUTE_LOGIN,
    meta: { requiresNotAuth: true },
    component: () => import('layouts/LoginLayout.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    name: ROUTE_404,
    component: () => import('layouts/ErrorNotFoundLayout.vue'),
  },
];

export default routes;
