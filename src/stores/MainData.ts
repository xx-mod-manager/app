import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { Asset, AssetStatus } from 'src/class/Asset';
import { Game } from 'src/class/Game';
import { Resource } from 'src/class/Resource';
import { ApiGame } from 'src/class/Types';
import { ImpResource } from 'src/class/imp';
import { deleteArrayItem, deleteArrayItemByFieldId } from 'src/utils/ArrayUtils';
import { notNull } from 'src/utils/CommentUtils';
import { reviver } from 'src/utils/JsonUtil';
import { ref } from 'vue';

const KEY_MAIN_DATA = 'mainData';

export const useMainDataStore = defineStore(KEY_MAIN_DATA, () => {
  const initState = init();
  const games = ref(initState.games);

  function getOptionGameById(gameId: string): Game | undefined {
    return games.value.get(gameId);
  }

  function getGameById(gameId: string): Game {
    return notNull(getOptionGameById(gameId), `Game: [${gameId}]`);
  }

  function getOptionResourceById(gameId: string, resourceId: string): Resource | undefined {
    return getOptionGameById(gameId)?.resources.get(resourceId);
  }

  function getResourceById(gameId: string, resourceId: string): Resource {
    return notNull(getOptionGameById(gameId)?.resources.get(resourceId), `Game: [${gameId}], Resource: [${resourceId}]`);
  }

  function getOptionAssetById(gameId: string, resourceId: string, assetId: string): Asset | undefined {
    return getOptionResourceById(gameId, resourceId)?.assets.get(assetId);
  }

  function getAssetById(gameId: string, resourceId: string, assetId: string): Asset {
    const asset = getOptionAssetById(gameId, resourceId, assetId);
    if (asset == undefined) throw Error(`Miss ${gameId}/${resourceId}/${assetId}`);
    return asset;
  }

  function getAssetByNodeId(gameId: string, resourceId: string, assetNodeId: string): Asset {
    const asset = Array.from(getOptionResourceById(gameId, resourceId)?.assets.values() ?? []).find(i => i.nodeId == assetNodeId);
    if (asset == undefined) throw Error(`Miss ${gameId}/${resourceId}/(NodeId)${assetNodeId}`);
    return asset;
  }

  function deleteAssetById(gameId: string, resourceId: string, assetId: string) {
    const assets = getOptionResourceById(gameId, resourceId)?.assets;
    if (assets == undefined) return false;
    assets.delete(assetId);
    return true;
  }

  function updateApiGames(apiGames: ApiGame[]) {
    const deletedGames: Game[] = Array.from(games.value.values()).filter(i => !i.isLocal());

    games.value.forEach((it) => it.clearApiGameData());

    apiGames.forEach((apiGame) => {
      const oldGame = getOptionGameById(apiGame.id);
      if (oldGame != undefined) {
        myLogger.debug(`Update game [${oldGame.id}]`);
        oldGame.updateApiGame(apiGame);
        deleteArrayItemByFieldId(deletedGames, apiGame);
      } else {
        myLogger.debug(`Add game [${apiGame.id}]`);
        const newGame = new Game(apiGame);
        games.value.set(newGame.id, newGame);
      }
    });

    for (const deletedGame of deletedGames) {
      myLogger.debug(`Delete game [${deletedGame.id}]`);
      games.value.delete(deletedGame.id);
    }
  }

  function updateInstalledAsset(gameId: string, installedAssets: Map<string, string[]>) {
    const oldResources = getGameById(gameId)?.resources;
    myLogger.debug(`Update game:[${gameId}] installed assets:`);
    installedAssets.forEach((assetIds, installedResourceId) => {
      assetIds.forEach((assetId) => {
        myLogger.debug(`\t${installedResourceId}/${assetId}`);
      });
    });
    const uninstalledAssets = new Map<string, string[]>();
    oldResources.forEach((resource) => {
      resource.assets.forEach(asset => {
        if (asset.status == AssetStatus.INTALLED) {
          let assetIds = uninstalledAssets.get(resource.id);
          if (assetIds == undefined) {
            assetIds = [];
            uninstalledAssets.set(resource.id, assetIds);
          }
          assetIds.push(asset.id);
        }
      });
    });
    installedAssets.forEach((assetIds, resourceId) => {
      let resource = oldResources.get(resourceId);
      if (resource == undefined) {
        resource = Resource.newById(resourceId);
        oldResources.set(resource.id, resource);
      }
      for (const assetId of assetIds) {
        const asset = resource.assets.get(assetId);
        if (asset != undefined) {
          if (asset.status == AssetStatus.NONE || asset.status == AssetStatus.DOWNLOADED) {
            asset.status = AssetStatus.INTALLED;
            myLogger.debug(`Update install status asset [${resource.id}][${assetId}]`);
          } else if (asset.status == AssetStatus.INTALLED) {
            const uninstalledVersions = uninstalledAssets.get(resourceId);
            if (uninstalledVersions)
              deleteArrayItem(uninstalledVersions, assetId);
          }
        } else {
          const newAsset = new Asset({ id: assetId, status: AssetStatus.INTALLED });
          resource.assets.set(newAsset.id, newAsset);
          myLogger.debug(`Add new install asset [${resource.id}][${assetId}]`);
        }
      }
    });
    uninstalledAssets.forEach((assetIds, resourceId) => {
      const resource = oldResources.get(resourceId);
      if (resource != undefined) {
        assetIds.forEach((assetId) => {
          myLogger.debug(`Uninstall asset [${resourceId}]/[${assetId}]`);
          const asset = resource.assets.get(assetId);
          if (asset)
            asset.status = AssetStatus.DOWNLOADED;
        });
      }
    });
  }

  function updateDonwloadedAsset(gameId: string, downloadedAssets: Map<string, string[]>) {
    const oldResources = getGameById(gameId)?.resources;
    myLogger.debug(`Update game:[${gameId}] downloaded assets:`);
    downloadedAssets.forEach((assetIds, downloadedResourceId) => {
      assetIds.forEach((assetId) => {
        myLogger.debug(`\t${downloadedResourceId}/${assetId}`);
      });
    });
    const deletedAssets = new Map<string, string[]>();
    oldResources.forEach((resource) => {
      resource.assets.forEach(asset => {
        if (asset.status == AssetStatus.DOWNLOADED) {
          let assetIds = deletedAssets.get(resource.id);
          if (assetIds == undefined) {
            assetIds = [];
            deletedAssets.set(resource.id, assetIds);
          }
          assetIds.push(asset.id);
        }
      });
    });
    downloadedAssets.forEach((assetIds, resourceId) => {
      let resource = oldResources.get(resourceId);
      if (resource == undefined) {
        resource = Resource.newById(resourceId);
        oldResources.set(resource.id, resource);
      }
      for (const assetId of assetIds) {
        const asset = resource.assets.get(assetId);
        if (asset != undefined) {
          if (asset.status == AssetStatus.NONE) {
            asset.status = AssetStatus.DOWNLOADED;
            myLogger.debug(`Update downloaded status asset [${resource.id}][${assetId}]`);
          } else if (asset.status == AssetStatus.DOWNLOADED) {
            const deletedVersions = deletedAssets.get(resourceId);
            if (deletedVersions)
              deleteArrayItem(deletedVersions, assetId);
          }
        } else {
          const newAsset = new Asset({ id: assetId, status: AssetStatus.DOWNLOADED });
          resource.assets.set(newAsset.id, newAsset);
          myLogger.debug(`Add new download asset [${resource.id}][${assetId}]`);
        }
      }
    });
    deletedAssets.forEach((assetIds, resourceId) => {
      const resource = oldResources.get(resourceId);
      if (resource != undefined) {
        assetIds.forEach((assetId) => {
          const asset = resource.assets.get(assetId);
          if (asset) {
            if (asset.isOnline()) {
              myLogger.debug(`Update none status asset [${resourceId}]/[${assetId}]`);
              asset.status = AssetStatus.NONE;
            } else {
              myLogger.debug(`Delete asset [${resourceId}]/[${assetId}]`);
              resource.assets.delete(asset.id);
            }
          }
        });
      }
    });
  }

  function addDownloadAsset(gameId: string, resourceId: string, assetId: string) {
    const oldResources = getGameById(gameId)?.resources;
    myLogger.debug(`Add new local asset [${resourceId}]:[${assetId}]`);
    let resource = oldResources.get(resourceId);
    if (resource == undefined) {
      resource = Resource.newById(resourceId);
      oldResources.set(resource.id, resource);
    }
    const asset = resource.assets.get(assetId);
    if (asset != undefined) {
      if (asset.status == AssetStatus.NONE) {
        asset.status = AssetStatus.DOWNLOADED;
      }
    } else {
      const newAsset = new Asset({ id: assetId, status: AssetStatus.DOWNLOADED });
      resource.assets.set(newAsset.id, newAsset);
    }
  }

  function addImpResource(gameId: string, impResource: ImpResource) {
    const oldResources = getGameById(gameId)?.resources;
    let resource = getOptionResourceById(gameId, impResource.id);
    if (resource == null) {
      resource = Resource.newById(impResource.id);
      resource.name = impResource.name;
      resource.description = impResource.description;
      resource.author = impResource.author;
      resource.category = impResource.category;
      oldResources.set(resource.id, resource);
    }
    for (const impAsset of impResource.assets.values()) {
      const asset = resource.assets.get(impAsset.id);
      if (asset != undefined) {
        if (asset.status === AssetStatus.NONE) {
          asset.status = AssetStatus.DOWNLOADED;
        }
      } else {
        const newAsset = new Asset({ id: impAsset.id, status: AssetStatus.DOWNLOADED });
        resource.assets.set(newAsset.id, newAsset);
      }
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
    getOptionGameById,
    getGameById,
    getOptionResourceById,
    getResourceById,
    getOptionAssetById,
    getAssetById,
    getAssetByNodeId,
    deleteAssetById,
    updateApiGames,
    updateInstalledAsset,
    updateDonwloadedAsset,
    addDownloadAsset,
    updateAssetStatus,
    addImpResource
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
