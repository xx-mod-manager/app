import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { replacer, reviver } from 'src/utils/JsonUtil';

const KEY_USER_CONFIG = 'userConfig';

export const useUserConfigStore = defineStore(KEY_USER_CONFIG, {
  state: init,

  getters: {},

  actions: {
    save() {
      localStorage.setItem(KEY_USER_CONFIG, JSON.stringify(this.$state, replacer));
      myLogger.debug('Save UserConfigStore.');
    },

    getGameById(gameId: string) {
      const game = this.games.find(i => i.id == gameId);
      if (game == undefined) throw Error(`Miss game ${gameId}.`);
      return game;
    },

    updateCurrentGame(newGameId: string) {
      if (this.currentGameId == newGameId) {
        myLogger.debug(`Update current game, but games are all [${newGameId}].`);
      } else {
        myLogger.debug(`Update current game, [${this.currentGameId}]=>[${newGameId}].`);
        this.save();
      }
    }
  },
});

interface UserConfig {
  currentGameId: string
  games: {
    id: string
    installPath?: string
    lockRootWithInstallPath: boolean
  }[]
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
      currentGameId: 'cdda',
      games: [{
        id: 'cdda',
        lockRootWithInstallPath: true
      }]
    };
  }
}
