import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: () => import('pages/ModsPage.vue') },
      { path: '/mod/:id', component: () => import('pages/ModDetailPage.vue') }
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
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
