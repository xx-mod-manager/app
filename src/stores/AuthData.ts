import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { Loading } from 'quasar';
import { refreshTokenInfo } from 'src/api/GithubAuthApi';
import { Author } from 'src/class/Types';
import { getCurrentAuthor } from 'src/api/GraphqlApi';

const KEY_AUTH_DATA = 'AuthData';

export const useAuthDataStore = defineStore(KEY_AUTH_DATA, {
  state: init,

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
    async update(githubTokenInfo: GithubTokenInfo) {
      myLogger.debug('Update AuthDataStore start.');
      const current = Date.now();
      const accessTokenDate = current + githubTokenInfo.expires_in * 1000;
      const refreshTokenDate = current + githubTokenInfo.refresh_token_expires_in * 1000;
      this.authInfo = {
        accessToken: githubTokenInfo.access_token,
        accessTokenDate,
        refreshToken: githubTokenInfo.refresh_token,
        refreshTokenDate
      };
      await this.refreshAuthor();
      localStorage.setItem(KEY_AUTH_DATA, JSON.stringify(this.$state));
      myLogger.debug('Update AuthDataStore end.');
    },

    async refreshAuthor() {
      const newAuthor = await getCurrentAuthor();
      this.user = newAuthor;
      myLogger.debug(`new author name is ${newAuthor.login}.`);
    },

    async refreshToken() {
      myLogger.debug('refreshToken start.');
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
            this.update(newToken);
          }
        } finally {
          Loading.hide();
        }
      } else {
        myLogger.debug('not need refresh token');
      }
    },

    clear() {
      this.$state.authInfo = undefined;
      this.$state.user = undefined;
      localStorage.removeItem(KEY_AUTH_DATA);
    }
  },
});

function init(): AuthData {
  if (import.meta.env.VITE_GITHUB_TOKEN) {
    // Dev test
    myLogger.warn('use persion access token...');
    const expiryDate = new Date(2999, 1).getTime();
    return {
      authInfo: {
        accessToken: import.meta.env.VITE_GITHUB_TOKEN,
        accessTokenDate: expiryDate,
        refreshToken: '',
        refreshTokenDate: expiryDate
      },
      user: {
        login: 'HeYaoDaDa',
        avatarUrl: 'https://avatars.githubusercontent.com/u/37257891?u=649b03ef58d43f9ffa5f73fb6f79d52c0429cfd8&v=4'
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
    return {};
  }
}

interface AuthData {
  authInfo?: AuthInfo
  user?: Author
}

interface AuthInfo {
  accessToken: string;
  accessTokenDate: number;
  refreshToken: string;
  refreshTokenDate: number;
}
