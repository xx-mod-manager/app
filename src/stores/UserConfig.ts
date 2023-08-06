import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { Game } from 'src/class/Game';
import { GameConfig } from 'src/class/GameConfig';
import { ApiGame } from 'src/class/Types';
import { notNull } from 'src/utils/CommentUtils';
import { reviver } from 'src/utils/JsonUtil';
import { computed, ref } from 'vue';

const KEY_USER_CONFIG = 'userConfig';

export const useUserConfigStore = defineStore(KEY_USER_CONFIG, () => {
  const initState = init();
  const currentGameId = ref(initState.currentGameId);
  const gameConfigs = ref(initState.gameConfigs);

  const currentGameInstallPath = computed(() => {
    return notNull(gameConfigs.value.get(currentGameId.value), 'Current game').installPath;
  });

  const currentGame = computed(() => {
    return getGameById(currentGameId.value);
  });

  function getOptionGameById(gameId: string): GameConfig | undefined {
    return gameConfigs.value.get(gameId);
  }

  function getGameById(gameId: string): GameConfig {
    return notNull(getOptionGameById(gameId), `Game: [${gameId}]`);
  }

  function updateCurrentGame(newGameId: string) {
    if (!gameConfigs.value.has(newGameId)) throw Error(`GameConfig[${newGameId}] is not exist.`);
    if (currentGameId.value === newGameId) {
      myLogger.debug(`Update current game, but games all are  [${newGameId}].`);
    } else {
      myLogger.debug(`Update current game, [${currentGameId.value}]=>[${newGameId}].`);
    }
  }

  function updateCurrentGameInstallPath(newInstallPath: string) {
    myLogger.debug(`Update current game install path [${currentGameInstallPath.value}]=>[${newInstallPath}]`);
    currentGame.value.installPath = newInstallPath;
  }

  async function addApiGames(games: ApiGame[]) {
    await Promise.all(games.map(async game => {
      const oldGameConfig = getOptionGameById(game.id);
      if (oldGameConfig == undefined) {
        myLogger.debug(`Add GameConfig ${game.id}`);
        const newGameConfig = await GameConfig.newByGame(game);
        gameConfigs.value.set(newGameConfig.id, newGameConfig);
      } else {
        myLogger.debug(`Update GameConfig ${game.id}`);
        await oldGameConfig.updateInstallPath(game);
      }
    }));
  }

  async function addGames(games: Game[]) {
    await Promise.all(games.map(async game => {
      const oldGameConfig = getOptionGameById(game.id);
      if (oldGameConfig == undefined) {
        myLogger.debug(`Add GameConfig ${game.id}`);
        const newGameConfig = await GameConfig.newByGame(game);
        gameConfigs.value.set(newGameConfig.id, newGameConfig);
      } else {
        myLogger.debug(`Update GameConfig ${game.id}`);
        await oldGameConfig.updateInstallPath(game);
      }
    }));
  }

  return {
    currentGameId, gameConfigs,
    currentGameInstallPath, currentGame,
    getOptionGameById, getGameById, updateCurrentGame, updateCurrentGameInstallPath, addGames, addApiGames
  };
}, { persistence: true });

interface State {
  currentGameId: string
  gameConfigs: Map<string, GameConfig>
}

function init(): State {
  const localMainDataJson = localStorage.getItem(KEY_USER_CONFIG);
  if (localMainDataJson) {
    const localMainData = JSON.parse(localMainDataJson, reviver) as State;
    myLogger.debug('Resume UserConfigStore from localStorage.');
    return localMainData;
  } else {
    myLogger.debug('New UserConfigStore.');
    return {
      currentGameId: 'csti',
      gameConfigs: new Map([['csti', new GameConfig({ id: 'csti' })]])
    };
  }
}
