import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { replacer, reviver } from 'src/utils/JsonUtil';

const KEY_USER_CONFIG = 'userConfig';

export const useUserConfigStore = defineStore(KEY_USER_CONFIG, {
  state: init,

  getters: {
  },

  actions: {
    save() {
      localStorage.setItem(KEY_USER_CONFIG, JSON.stringify(this.$state, replacer));
      myLogger.debug('Save UserConfigStore.');
    },

    updateGame(newGameId: string) {
      if (this.game == newGameId) {
        myLogger.debug(`Update UserConfig game, but games are all [${newGameId}].`);
      } else {
        myLogger.debug(`Update UserConfig game, [${this.game}]=>[${newGameId}].`);
        this.save();
      }
    }
  },
});

interface UserConfig {
  game: string
  installPath: Map<string, string>
  lockRootWithInstallPath: Map<string, boolean>
}

function init(): UserConfig {
  const localMainDataJson = localStorage.getItem(KEY_USER_CONFIG);
  if (localMainDataJson) {
    const localMainData = JSON.parse(localMainDataJson, reviver) as UserConfig;
    myLogger.debug('Resume UserConfigStore from localStorage.');
    return localMainData;
  } else {
    myLogger.debug('New UserConfigStore.');
    return {
      game: 'cdda',
      installPath: new Map,
      lockRootWithInstallPath: new Map
    };
  }
}
