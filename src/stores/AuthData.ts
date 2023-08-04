import { defineStore } from 'pinia';
import { getCurrentAuthor } from 'src/api/GraphqlApi';
import { myLogger } from 'src/boot/logger';
import { GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { Author } from 'src/class/Types';

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
  },

  actions: {
    async update(githubTokenInfo: GithubTokenInfo) {
      myLogger.debug('Update auth data token.');
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
    },

    async refreshAuthor() {
      myLogger.debug('Refresh auth data author.');
      const newAuthor = await getCurrentAuthor();
      this.user = newAuthor;
      myLogger.debug(`New author login: [${newAuthor.login}].`);
    },

    clear() {
      myLogger.info('Clear login info.');
      this.$state.authInfo = undefined;
      this.$state.user = undefined;
      localStorage.removeItem(KEY_AUTH_DATA);
    }
  },
});

function init(): State {
  if (import.meta.env.VITE_GITHUB_TOKEN) {
    myLogger.info('Use Dev persion access token.');
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
    const localAuthData = JSON.parse(localAuthDataJson) as State;
    myLogger.debug('Resume auth data from localStorage.');
    return localAuthData;
  } else {
    myLogger.debug('New auth data.');
    return { authInfo: undefined, user: undefined };
  }
}

interface State {
  authInfo?: AuthInfo
  user?: Author
}

interface AuthInfo {
  accessToken: string;
  accessTokenDate: number;
  refreshToken: string;
  refreshTokenDate: number;
}
