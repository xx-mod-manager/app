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
  const steamAppsPath = ref(initState.steamAppsPath);
  const gameConfigs = ref(initState.gameConfigs);

  const currentGameInstallPath = computed(() => notNull(gameConfigs.value.get(currentGameId.value), 'Current game').installPath);
  const currentGame = computed(() => notNull(gameConfigs.value.get(currentGameId.value), `Game[${currentGameId.value}]`));

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

  async function updateApiGames(apiGames: ApiGame[]) {
    myLogger.debug(`Update by ApiGames[${apiGames.map(i => i.id).join()}]`);

    await Promise.all(apiGames.map(async apiGame => {
      const existGameConfig = gameConfigs.value.get(apiGame.id);
      if (existGameConfig == null) {
        myLogger.debug(`Add GameConfig ${apiGame.id}`);
        const newGameConfig = await GameConfig.newByApiGame(apiGame);
        gameConfigs.value.set(newGameConfig.id, newGameConfig);
      } else {
        myLogger.debug(`Update GameConfig ${apiGame.id}`);
        await existGameConfig.updateByApiGame(apiGame);
      }
    }));
  }

  async function updateGames(games: Game[]) {
    myLogger.debug(`Update by Games[${games.map(i => i.id).join()}]`);

    await Promise.all(games.map(async game => {
      const oldGameConfig = gameConfigs.value.get(game.id);
      if (oldGameConfig == undefined) {
        myLogger.debug(`Add GameConfig ${game.id}`);
        const newGameConfig = await GameConfig.newByGame(game);
        gameConfigs.value.set(newGameConfig.id, newGameConfig);
      } else {
        myLogger.debug(`Update GameConfig ${game.id}`);
        await oldGameConfig.updateByGame(game);
      }
    }));
  }

  return {
    currentGameId, steamAppsPath, gameConfigs,
    currentGameInstallPath, currentGame,
    updateCurrentGame, updateCurrentGameInstallPath, updateGames, updateApiGames
  };
}, { persistence: true });

interface State {
  currentGameId: string
  steamAppsPath?: string
  gameConfigs: Map<string, GameConfig>
}

function init(): State {
  const localMainDataJson = localStorage.getItem(KEY_USER_CONFIG);
  if (localMainDataJson) {
    myLogger.debug('Resume UserConfigStore from localStorage');
    const localMainData = JSON.parse(localMainDataJson, reviver) as State;
    return localMainData;
  } else {
    myLogger.debug('New UserConfigStore');
    return {
      currentGameId: 'csti',
      steamAppsPath: undefined,
      gameConfigs: new Map([['csti', new GameConfig({ id: 'csti' })]])
    };
  }
}
