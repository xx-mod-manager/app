import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/asset',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'asset', name: 'assets', component: () => import('pages/AssetListPage.vue') },
      { path: 'asset/:id', name: 'asset', component: () => import('pages/AssetPage.vue') },
      { path: 'asset-manager', name: 'assetManager', component: () => import('pages/AssetManagerPage.vue') }
    ],
  },
  {
    path: '/login',
    name: 'login',
    meta: { requiresNotAuth: true },
    component: () => import('layouts/LoginLayout.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    name: '404',
    component: () => import('layouts/ErrorNotFoundLayout.vue'),
  },
];

export default routes;
