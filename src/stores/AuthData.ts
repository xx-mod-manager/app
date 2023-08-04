import { defineStore } from 'pinia';
import { getCurrentAuthor } from 'src/api/GraphqlApi';
import { myLogger } from 'src/boot/logger';
import { GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { Author } from 'src/class/Types';
import { computed, ref } from 'vue';

const KEY_AUTH_DATA = 'AuthData';

export const useAuthDataStore = defineStore(KEY_AUTH_DATA, () => {
  const initState = init();
  const authInfo = ref(initState.authInfo);
  const user = ref(initState.user);

  const activeToken = computed(() => {
    if (authInfo.value != undefined) return Date.now() < authInfo.value.accessTokenDate;
    else return false;
  });
  const activeRefreshToken = computed(() => {
    if (authInfo.value != undefined) return Date.now() < authInfo.value.refreshTokenDate;
    else return false;
  });
  const isLogin = computed(() => {
    return activeToken.value || activeRefreshToken.value;
  });
  const token = computed(() => `bearer ${authInfo.value?.accessToken}`);

  async function update(githubTokenInfo: GithubTokenInfo) {
    myLogger.debug('Update auth data token.');
    const current = Date.now();
    const accessTokenDate = current + githubTokenInfo.expires_in * 1000;
    const refreshTokenDate = current + githubTokenInfo.refresh_token_expires_in * 1000;
    authInfo.value = {
      accessToken: githubTokenInfo.access_token,
      accessTokenDate,
      refreshToken: githubTokenInfo.refresh_token,
      refreshTokenDate
    };
    await refreshAuthor();
  }
  async function refreshAuthor() {
    myLogger.debug('Refresh auth data author.');
    try {
      const newAuthor = await getCurrentAuthor();
      user.value = newAuthor;
      myLogger.debug(`New author login: [${newAuthor.login}].`);
    } catch (error) {
      myLogger.error('Refresh author info fail.', error);
    }
  }
  function clear() {
    myLogger.info('Clear login info.');
    authInfo.value = undefined;
    user.value = undefined;
  }

  return { authInfo, user, activeToken, activeRefreshToken, isLogin, token, update, refreshAuthor, clear };
}, { persistence: true });

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
