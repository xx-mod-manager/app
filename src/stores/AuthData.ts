import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { Loading } from 'quasar';
import { refreshTokenInfo } from 'src/api/GithubAuthApi';

export const KEY_AUTH_DATA = 'AuthData';

export const useAuthDataStore = defineStore(KEY_AUTH_DATA, {
  state: initAuthData,

  getters: {
    isLogin: (stata) => {
      if (stata.authInfo) {
        return (Date.now() < stata.authInfo.accessTokenDate) || (Date.now() < stata.authInfo.refreshTokenDate);
      } else {
        return false;
      }
    },
    activeToken: (stata) => {
      if (stata.authInfo) {
        return Date.now() < stata.authInfo.accessTokenDate;
      } else {
        return false;
      }
    },

    activeRefreshToken: (stata) => {
      if (stata.authInfo) {
        return Date.now() < stata.authInfo.refreshTokenDate;
      } else {
        return false;
      }
    },

    token: (stata) => `bearer ${stata.authInfo?.accessToken}`,

    refresh_token: (stata) => stata.authInfo?.refreshTokenDate,
  },

  actions: {
    updateToken(githubTokenInfo: GithubTokenInfo) {
      myLogger.debug('auth data update.');
      const current = Date.now();
      const accessTokenDate = current + githubTokenInfo.expires_in * 1000;
      const refreshTokenDate = current + githubTokenInfo.refresh_token_expires_in * 1000;
      this.authInfo = {
        accessToken: githubTokenInfo.access_token,
        accessTokenDate,
        refreshToken: githubTokenInfo.refresh_token,
        refreshTokenDate
      };
      localStorage.setItem(KEY_AUTH_DATA, JSON.stringify(this.$state));
    },

    async refreshToken() {
      if ((!this.activeToken) && this.activeRefreshToken) {
        Loading.show({ message: '刷新Github Token中...', delay: 400 });
        try {
          if (this.authInfo) {
            const newToken = await refreshTokenInfo({
              access_token: this.authInfo.accessToken,
              refresh_token: this.authInfo.refreshToken,
              expires_in: 0,
              refresh_token_expires_in: 0
            });
            this.updateToken(newToken);
          }
        } finally {
          Loading.hide();
        }
      } else {
        myLogger.debug('not need refresh token');
      }
    },

    clearAuthInfo() {
      this.$state.authInfo = undefined;
      localStorage.removeItem(KEY_AUTH_DATA);
    }
  },
});

function initAuthData(): AuthData {
  if (import.meta.env.VITE_GITHUB_TOKEN) {
    myLogger.warn('use persion access token...');
    const expiryDate = new Date(2999, 1).getTime();
    return {
      authInfo: {
        accessToken: import.meta.env.VITE_GITHUB_TOKEN,
        accessTokenDate: expiryDate,
        refreshToken: '',
        refreshTokenDate: expiryDate
      }
    };
  }
  const localAuthDataJson = localStorage.getItem(KEY_AUTH_DATA);
  if (localAuthDataJson) {
    const localAuthData = JSON.parse(localAuthDataJson) as AuthData;
    myLogger.debug('resume auth data from localStorage.');
    return localAuthData;
  } else {
    myLogger.debug('auth data miss from localStorage.');
    return {
      authInfo: undefined
    };
  }
}

interface AuthData {
  authInfo?: AuthInfo
}

interface AuthInfo {
  accessToken: string;
  accessTokenDate: number;
  refreshToken: string;
  refreshTokenDate: number;
}
