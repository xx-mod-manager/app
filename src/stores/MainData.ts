import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { Asset, AssetStatus } from 'src/class/Asset';
import { Game } from 'src/class/Game';
import { Resource } from 'src/class/Resource';
import { ApiGame } from 'src/class/Types';
import { deleteArrayItemByFieldId } from 'src/utils/ArrayUtils';
import { notNull } from 'src/utils/CommentUtils';
import { reviver } from 'src/utils/JsonUtil';
import { computed, ref } from 'vue';
import { useUserConfigStore } from './UserConfig';

const KEY_MAIN_DATA = 'mainData';

export const useMainDataStore = defineStore(KEY_MAIN_DATA, () => {
  const initState = init();
  const games = ref(initState.games);

  const currentGame = computed(() => getGameById(useUserConfigStore().currentGameId));

  function getOptionGameById(gameId: string): Game | undefined {
    return games.value.get(gameId);
  }

  function getGameById(gameId: string): Game {
    return notNull(getOptionGameById(gameId), `Game[${gameId}]`);
  }

  function getOptionResourceById(gameId: string, resourceId: string): Resource | undefined {
    return getOptionGameById(gameId)?.resources.get(resourceId);
  }

  function getResourceById(gameId: string, resourceId: string): Resource {
    return notNull(getOptionGameById(gameId)?.resources.get(resourceId), `Resource[${resourceId}]`);
  }

  function getOptionAssetById(gameId: string, resourceId: string, assetId: string): Asset | undefined {
    return getOptionResourceById(gameId, resourceId)?.assets.get(assetId);
  }

  function getAssetById(gameId: string, resourceId: string, assetId: string): Asset {
    const asset = getOptionAssetById(gameId, resourceId, assetId);
    if (asset == undefined) throw Error(`Miss ${gameId}/${resourceId}/${assetId}`);
    return notNull(getOptionAssetById(gameId, resourceId, assetId), `Resource[${resourceId}], Asset[${assetId}]`);
  }

  function getAssetByNodeId(gameId: string, resourceId: string, assetNodeId: string): Asset {
    const asset = Array.from(getOptionResourceById(gameId, resourceId)?.assets.values() ?? []).find(i => i.nodeId == assetNodeId);
    return notNull(asset, `Resource[${resourceId}], Asset[nodeId:${assetNodeId}]`);
  }

  function deleteAssetById(gameId: string, resourceId: string, assetId: string) {
    const assets = getOptionResourceById(gameId, resourceId)?.assets;
    if (assets == undefined) return false;
    assets.delete(assetId);
    return true;
  }

  function updateApiGames(apiGames: ApiGame[]) {
    myLogger.debug(`Update by ApiGames[${apiGames.map(i => i.id).join()}]`);
    const deletedGames: Game[] = Array.from(games.value.values()).filter(i => !i.isLocal());

    games.value.forEach((it) => it.clearApiGameData());

    for (const apiGame of apiGames) {
      const existGame = getOptionGameById(apiGame.id);
      if (existGame != undefined) {
        myLogger.debug(`Update Game[${existGame.id}]`);
        existGame.updateApiGame(apiGame);
        deleteArrayItemByFieldId(deletedGames, apiGame);
      } else {
        myLogger.debug(`Add Game[${apiGame.id}]`);
        const newGame = new Game(apiGame);
        games.value.set(newGame.id, newGame);
      }
    }

    for (const deletedGame of deletedGames) {
      myLogger.debug(`Delete Game[${deletedGame.id}]`);
      games.value.delete(deletedGame.id);
    }
  }

  function updateAssetStatus(gameId: string, resourceId: string, assetId: string, newStatus: AssetStatus) {
    const oldAsset = getAssetById(gameId, resourceId, assetId);
    if (oldAsset.status === newStatus) {
      myLogger.warn(`resource: ${resourceId} asset: ${assetId}, status:${oldAsset.status} miss update.`);
      return;
    }
    myLogger.debug(`Game: [${gameId}] resource: [${resourceId}] asset: [${assetId}], [${oldAsset.status}] => [${newStatus}]`);
    oldAsset.status = newStatus;
  }

  return {
    games,
    currentGame,
    getOptionGameById,
    getGameById,
    getOptionResourceById,
    getResourceById,
    getOptionAssetById,
    getAssetById,
    getAssetByNodeId,
    deleteAssetById,
    updateApiGames,
    updateAssetStatus
  };
}, { persistence: true });

interface State {
  games: Map<string, Game>
}

function init(): State {
  const localMainDataJson = localStorage.getItem(KEY_MAIN_DATA);
  if (localMainDataJson) {
    const localMainData = JSON.parse(localMainDataJson, reviver) as State;
    myLogger.debug('Resume MainDataStore from LocalStorage.');
    return localMainData;
  } else {
    myLogger.debug('New MainDataStore.');
    return {
      games: new Map([
        ['csti', new Game({
          id: 'csti',
          name: 'Card Survival: Tropical Island',
          dataRepo: 'HeYaoDaDa/GrcData-csti',
          steamAppName: 'Card Survival Tropical Island',
          relativeRootInstallPath: './BepInEx/plugins',
          autoMkRelativeRootInstallPath: false
        })]
      ])
    };
  }
}
