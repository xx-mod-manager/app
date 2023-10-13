import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { Asset } from 'src/class/Asset';
import { Game } from 'src/class/Game';
import { Resource } from 'src/class/Resource';
import { ApiGame } from 'src/class/Types';
import { notNull } from 'src/utils/CommentUtils';
import { reviver } from 'src/utils/JsonUtil';
import { computed, ref } from 'vue';
import { useUserConfigStore } from './UserConfig';

const KEY_MAIN_DATA = 'mainData';

export const useMainDataStore = defineStore(KEY_MAIN_DATA, () => {
  const initState = init();
  const games = ref(initState.games);

  const currentGame = computed(() => {
    const currentGameId = useUserConfigStore().currentGameId;
    return notNull(games.value.get(currentGameId), `Game[${currentGameId}]`);
  });

  function getOptionGameById(gameId: string): Game | undefined {
    return games.value.get(gameId);
  }

  function getOptionResourceById(gameId: string, resourceId: string): Resource | undefined {
    return getOptionGameById(gameId)?.resources.get(resourceId);
  }

  function getOptionAssetById(gameId: string, resourceId: string, assetId: string): Asset | undefined {
    return getOptionResourceById(gameId, resourceId)?.assets.get(assetId);
  }

  function getAssetByNodeId(gameId: string, resourceId: string, assetNodeId: string): Asset {
    const asset = Array.from(getOptionResourceById(gameId, resourceId)?.assets.values() ?? []).find(i => i.nodeId == assetNodeId);
    return notNull(asset, `Resource[${resourceId}], Asset[nodeId:${assetNodeId}]`);
  }

  function updateByApiGames(apiGames: ApiGame[]) {
    myLogger.debug(`Update by ApiGames[${apiGames.map(i => i.id).join()}]`);

    for (const game of games.value.values()) {
      if ((!game.isLocal()) && ((apiGames.find(it => it.id === game.id)) == null)) {
        myLogger.debug(`Delete Game[${game.id}]`);
        games.value.delete(game.id);
      }
    }

    games.value.forEach((it) => it.onlineData = undefined);

    for (const apiGame of apiGames) {
      const existGame = games.value.get(apiGame.id);
      if (existGame == null) {
        myLogger.debug(`Add Game[${apiGame.id}]`);
        const newGame = Game.byApiGame(apiGame);
        games.value.set(newGame.id, newGame);
      } else {
        myLogger.debug(`Update Game[${existGame.id}]`);
        existGame.onlineData = apiGame;
      }
    }
  }

  return {
    games,
    currentGame,
    getOptionGameById,
    getOptionResourceById,
    getOptionAssetById,
    getAssetByNodeId,
    updateByApiGames,
  };
}, { persistence: true });

interface State {
  games: Map<string, Game>
}

function init(): State {
  const localMainDataJson = localStorage.getItem(KEY_MAIN_DATA);
  if (localMainDataJson) {
    myLogger.debug('Resume MainDataStore from LocalStorage');
    const localMainData = JSON.parse(localMainDataJson, reviver) as State;
    return localMainData;
  } else {
    myLogger.debug('New MainDataStore');
    return {
      games: new Map([
        ['csti', new Game({
          id: 'csti',
          onlineData: {
            name: '卡牌生存：热带岛屿',
            dataRepo: 'HeYaoDaDa/GrcData-csti',
            steamAppName: 'Card Survival Tropical Island',
            relativeRootInstallPath: './BepInEx/plugins',
            autoMkRelativeRootInstallPath: false
          }
        })]
      ])
    };
  }
}
