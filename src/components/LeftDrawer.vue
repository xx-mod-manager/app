<template>
  <div>
    <q-img height="10rem" src="../assets/material.png">
      <div class="absolute-bottom bg-transparent">
        <q-avatar style="padding-left: 1rem">
          <q-img :src="authDataStore.user?.avatarUrl" />
        </q-avatar>

        <div class="text-subtitle1 text-weight-bold" style="padding-left: 1rem">
          {{ authDataStore.user?.login }}
        </div>

        <q-btn v-if="authDataStore.isLogin" flat label="退出" @click="logout" />

        <q-btn v-else flat label="登录" @click="login" />
      </div>
    </q-img>

    <q-list padding>
      <q-item :to="{ name: ROUTE_RESOURCES }" exact>
        <q-item-section avatar>
          <q-icon :name="matDownload" />
        </q-item-section>

        <q-item-section> 资源 </q-item-section>
      </q-item>

      <q-item
        v-if="quasar.platform.is.electron"
        :to="{ name: ROUTE_RESOURCE_MANAGE }"
        exact
      >
        <q-item-section avatar>
          <q-icon :name="matWidgets" />
        </q-item-section>

        <q-item-section> 资源管理 </q-item-section>
      </q-item>

      <q-item
        v-if="quasar.platform.is.electron"
        :to="{ name: ROUTE_USER_CONFIG }"
        exact
      >
        <q-item-section avatar>
          <q-icon :name="matSettings" />
        </q-item-section>

        <q-item-section> 设置 </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import {
  matDownload,
  matSettings,
  matWidgets,
} from '@quasar/extras/material-icons';
import { useQuasar } from 'quasar';
import {
  ROUTE_LOGIN,
  ROUTE_RESOURCES,
  ROUTE_RESOURCE_MANAGE,
} from 'src/router';
import { ROUTE_USER_CONFIG } from 'src/router/routes';
import { useAuthDataStore } from 'src/stores/AuthData';
import { useRouter } from 'vue-router';

const authDataStore = useAuthDataStore();
const router = useRouter();
const quasar = useQuasar();

function logout() {
  authDataStore.clear();
  router.push({ name: ROUTE_LOGIN });
}

function login() {
  router.push({ name: ROUTE_LOGIN });
}
</script>
