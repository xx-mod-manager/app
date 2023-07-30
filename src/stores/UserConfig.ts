import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { Game, GameConfig } from 'src/class/Types';
import { newOnlineGameConfig, updateOnlineGameConfig } from 'src/utils/GameConfig';
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

    getOptionGameById(gameId: string) {
      return this.games.find(i => i.id == gameId);
    },

    getGameById(gameId: string) {
      const game = this.getOptionGameById(gameId);
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
    },

    async updateOnlineGames(onlineGames: Game[]) {
      await Promise.all(onlineGames.map(async onlineGame => {
        const oldGame = this.getOptionGameById(onlineGame.id);
        if (oldGame == undefined) {
          myLogger.debug(`Add online game config ${onlineGame.id}`);
          this.games.push(await newOnlineGameConfig(onlineGame));
        } else {
          myLogger.debug(`Update online game config ${onlineGame.id}`);
          await updateOnlineGameConfig(oldGame, onlineGame);
        }
      }));
      this.save();
    }
  },
});

interface UserConfig {
  currentGameId: string
  games: GameConfig[]
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
      currentGameId: 'csti',
      games: [{
        id: 'csti',
        lockRootWithInstallPath: true
      }]
    };
  }
}
