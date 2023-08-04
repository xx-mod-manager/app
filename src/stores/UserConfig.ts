import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { Game, GameConfig } from 'src/class/Types';
import { findArrayItemById } from 'src/utils/ArrayUtils';
import { notNull } from 'src/utils/CommentUtils';
import { newOnlineGameConfig, updateOnlineGameConfig } from 'src/utils/GameConfig';
import { reviver } from 'src/utils/JsonUtil';
import { computed, ref } from 'vue';

const KEY_USER_CONFIG = 'userConfig';

export const useUserConfigStore = defineStore(KEY_USER_CONFIG, () => {
  const initState = init();
  const currentGameId = ref(initState.currentGameId);
  const games = ref(initState.games);

  const currentGameInstallPath = computed(() => {
    return notNull(findArrayItemById(games.value, currentGameId.value), 'Current game').installPath;
  });

  function getOptionGameById(gameId: string): GameConfig | undefined {
    return findArrayItemById(games.value, gameId);
  }

  function getGameById(gameId: string): GameConfig {
    return notNull(getOptionGameById(gameId), `Game: [${gameId}]`);
  }

  function updateCurrentGame(newGameId: string) {
    if (currentGameId.value === newGameId) {
      myLogger.debug(`Update current game, but games all are  [${newGameId}].`);
    } else {
      myLogger.debug(`Update current game, [${currentGameId.value}]=>[${newGameId}].`);
    }
  }

  function updateCurrentGameInstallPath(newInstallPath: string) {
    myLogger.debug(`Update current game install path [${currentGameInstallPath.value}]=>[${newInstallPath}]`);
    const currentGame = getGameById(currentGameId.value);
    currentGame.installPath = newInstallPath;
  }

  async function updaetLocalGames(localGames: Game[]) {
    await Promise.all(localGames.map(async localGame => {
      const oldGame = getOptionGameById(localGame.id);
      if (oldGame == undefined) {
        myLogger.debug(`Add local game config ${localGame.id}`);
        games.value.push(await newOnlineGameConfig(localGame));
      } else {
        myLogger.debug(`Update local game config ${localGame.id}`);
        await updateOnlineGameConfig(oldGame, localGame);
      }
    }));
  }

  async function updateOnlineGames(onlineGames: Game[]) {
    await Promise.all(onlineGames.map(async onlineGame => {
      const oldGame = getOptionGameById(onlineGame.id);
      if (oldGame == undefined) {
        myLogger.debug(`Add online game config ${onlineGame.id}`);
        games.value.push(await newOnlineGameConfig(onlineGame));
      } else {
        myLogger.debug(`Update online game config ${onlineGame.id}`);
        await updateOnlineGameConfig(oldGame, onlineGame);
      }
    }));
  }

  return {
    currentGameId, games,
    currentGameInstallPath,
    getOptionGameById, getGameById, updateCurrentGame, updateCurrentGameInstallPath, updaetLocalGames, updateOnlineGames
  };
}, { persistence: true });

interface State {
  currentGameId: string
  games: GameConfig[]
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
      games: [{
        id: 'csti',
        lockRootWithInstallPath: true
      }]
    };
  }
}
