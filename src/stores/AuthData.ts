import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { Loading } from 'quasar';
import { refreshTokenInfo } from 'src/api/GithubAuthApi';

export const KEY_AUTH_DATA = 'AuthData';

export const useAuthDataStore = defineStore(KEY_AUTH_DATA, {
  state: initAuthData,
  getters: {
    activeToken: (stata) => {
      if (stata.token_info && stata.token_expire_dt == undefined) {
        return true;
      }

      if (stata.token_info && stata.token_expire_dt) {
        return Date.now() < stata.token_expire_dt;
      } else {
        return false;
      }
    },
    activeRefreshToken: (stata) => {
      if (stata.token_info && stata.refresh_token_expire_dt) {
        return Date.now() < stata.refresh_token_expire_dt;
      } else {
        return false;
      }
    },
    token: (stata) => `bearer ${stata.token_info?.access_token}`,
    refresh_token: (stata) => stata.token_info?.refresh_token,
  },
  actions: {
    async updateToken(github_token_info: GithubTokenInfo) {
      myLogger.debug('auth data update.');
      myLogger.debug(github_token_info);

      const current = Date.now();

      this.token_info = github_token_info;

      if (github_token_info.expires_in) {
        this.token_expire_dt = current + github_token_info.expires_in * 1000;
      } else {
        this.token_expire_dt = undefined;
      }

      this.refresh_token_expire_dt =
        current + github_token_info.refresh_token_expires_in * 1000;
      localStorage.setItem(KEY_AUTH_DATA, JSON.stringify(this.$state));

    },
    async authGithub() {
      const activeToken = this.activeToken;
      const activeRefreshToken = this.activeRefreshToken;

      myLogger.debug(`active token is ${activeToken}, active refresh token is ${activeRefreshToken}.`);

      if (activeToken) {
        myLogger.debug('token is active, no need auth.');
      } else {

        if (!activeRefreshToken) {
          Loading.show({ message: '跳转Github授权页中...' });
          myLogger.debug('refresh token is not active, need create new token.');
          window.open(
            'https://github.com/login/oauth/authorize?client_id=Iv1.23bebc2931676eb7',
            '_self'
          );
        } else {
          Loading.show({ message: '刷新Github Token中...' });

          if (this.token_info) {
            const newToken = await refreshTokenInfo(this.token_info);

            this.updateToken(newToken);
            window.open('/', '_self');
          } else {
            Loading.hide();
            throw Error('token is null!');
          }
        }
      }
    },
  },
});

function initAuthData(): AuthData {
  const localAuthDataJson = localStorage.getItem(KEY_AUTH_DATA);

  if (localAuthDataJson) {
    const localAuthData = JSON.parse(localAuthDataJson) as AuthData;

    myLogger.debug('resume auth data from localStorage.');

    return localAuthData;
  } else {
    myLogger.debug('auth data miss from localStorage.');

    return {
      token_info: undefined,
      token_expire_dt: undefined,
      refresh_token_expire_dt: undefined,
    };
  }
}

interface AuthData {
  token_info: GithubTokenInfo | undefined;
  token_expire_dt: number | undefined;
  refresh_token_expire_dt: number | undefined;
}
