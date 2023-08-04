import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { Asset, AssetStatus, Game, Resource } from 'src/class/Types';
import { deleteArrayItem, deleteArrayItemByFieldId, deleteArrayItemById, deleteArrayItemsByFileId, findArrayItemByFieldId, findArrayItemById } from 'src/utils/ArrayUtils';
import { existLocalAsset, existOnlineAsset, newDownloadedAsset, newInstalledAsset, updateOnlineAsset } from 'src/utils/AssetUtils';
import { notNull } from 'src/utils/CommentUtils';
import { existLocalGame, updateOnlineGame } from 'src/utils/GameUtils';
import { reviver } from 'src/utils/JsonUtil';
import { existLocalResource, newLocalResource, updateOnlineResource } from 'src/utils/ResourceUtils';
import { ref } from 'vue';

const KEY_MAIN_DATA = 'mainData';

export const useMainDataStore = defineStore(KEY_MAIN_DATA, () => {
  const initState = init();
  const games = ref(initState.games);

  function getOptionGameById(gameId: string): Game | undefined {
    return findArrayItemById(games.value, gameId);
  }

  function getGameById(gameId: string): Game {
    return notNull(findArrayItemById(games.value, gameId), `Game: [${gameId}]`);
  }

  function getOptionResourceById(gameId: string, resourceId: string): Resource | undefined {
    return getOptionGameById(gameId)?.resources.find((it) => it.id == resourceId);
  }

  function getResourceById(gameId: string, resourceId: string): Resource {
    return notNull(getOptionGameById(gameId)?.resources.find((it) => it.id == resourceId), `Game: [${gameId}], Resource: [${resourceId}]`);
  }

  function getOptionAssetById(gameId: string, resourceId: string, assetId: string): Asset | undefined {
    return getOptionResourceById(gameId, resourceId)?.assets.find(i => i.id == assetId);
  }

  function getAssetById(gameId: string, resourceId: string, assetId: string): Asset {
    const asset = getOptionAssetById(gameId, resourceId, assetId);
    if (asset == undefined) throw Error(`Miss ${gameId}/${resourceId}/${assetId}`);
    return asset;
  }

  function getAssetByNodeId(gameId: string, resourceId: string, assetNodeId: string): Asset {
    const asset = getOptionResourceById(gameId, resourceId)?.assets.find(i => i.nodeId == assetNodeId);
    if (asset == undefined) throw Error(`Miss ${gameId}/${resourceId}/(NodeId)${assetNodeId}`);
    return asset;
  }

  function deleteAssetById(gameId: string, resourceId: string, assetId: string) {
    const assets = getOptionResourceById(gameId, resourceId)?.assets;
    if (assets == undefined) return false;
    deleteArrayItemById(assets, assetId);
    return true;
  }

  function updateOnlineGames(onlineGames: Game[]) {
    myLogger.debug(`Update online games: ${onlineGames.map(i => i.id).toString()}`);
    const deletedGames: Game[] = [...games.value.filter(i => !existLocalGame(i))];
    onlineGames.forEach((onlineGame) => {
      const oldGame = getOptionGameById(onlineGame.id);
      if (oldGame != undefined) {
        updateOnlineGame(oldGame, onlineGame);
        deleteArrayItemByFieldId(deletedGames, onlineGame);
      } else {
        games.value.push(onlineGame);
        myLogger.debug(`Add new online game [${onlineGame.id}]`);
      }
    });
    myLogger.debug(`Delete games: ${deletedGames.map(i => i.id).toString()}`);
    deleteArrayItemsByFileId(games.value, deletedGames);
  }

  function updateOnlineResources(gameId: string, onlineResources: Resource[]) {
    myLogger.debug(`Update game:[${gameId}] online resources: ${onlineResources.map(i => i.id).toString()}`);
    const oldResources = getGameById(gameId).resources;
    const deletedResources: Resource[] = [...oldResources.filter(i => !existLocalResource(i))];
    oldResources.forEach((it) => it.existOnline = false);
    onlineResources.forEach((onlineResource) => {
      const oldResource = findArrayItemByFieldId(oldResources, onlineResource);
      if (oldResource) {
        updateOnlineResource(oldResource, onlineResource);
        deleteArrayItemByFieldId(deletedResources, onlineResource);
      } else {
        oldResources.push(onlineResource);
        myLogger.debug(`Add new online resource [${onlineResource.id}]`);
      }
    });
    myLogger.debug(`Delete game:[${gameId}] online resources: ${deletedResources.map(i => i.id).toString()}`);
    deleteArrayItemsByFileId(oldResources, deletedResources);
  }

  function updateOnlineAssets(gameId: string, resourceId: string, onlineAssets: Asset[]) {
    myLogger.debug(`Update game:[${gameId}] resource:[${resourceId}] online assets: ${onlineAssets.map(i => i.id).toString()}`);
    const oldAssets = getResourceById(gameId, resourceId).assets;
    const deletedAssets = oldAssets.filter(i => !existLocalAsset(i));
    oldAssets.forEach((it) => it.downloadUrl = undefined);
    onlineAssets.forEach((onlineAsset) => {
      const oldAsset = findArrayItemByFieldId(oldAssets, onlineAsset);
      if (oldAsset) {
        myLogger.debug(`Update online asset [${onlineAsset.id}]`);
        updateOnlineAsset(oldAsset, onlineAsset);
        deleteArrayItemByFieldId(deletedAssets, onlineAsset);
      } else {
        oldAssets.push(onlineAsset);
        myLogger.debug(`Add new online asset [${onlineAsset.id}]`);
      }
    });
    myLogger.debug(`Delete game:[${gameId}] resource:[${resourceId}] online assets: ${onlineAssets.map(i => i.id).toString()}`);
    deleteArrayItemsByFileId(oldAssets, deletedAssets);
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
      let resource = oldResources.find(i => i.id == resourceId);
      if (resource == undefined) {
        resource = newLocalResource(resourceId);
        oldResources.push(resource);
      }
      for (const assetId of assetIds) {
        const asset = resource.assets.find(i => i.id == assetId);
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
          resource.assets.push(newInstalledAsset(assetId));
          myLogger.debug(`Add new install asset [${resource.id}][${assetId}]`);
        }
      }
    });
    uninstalledAssets.forEach((assetIds, resourceId) => {
      const resource = oldResources.find(i => i.id == resourceId);
      if (resource != undefined) {
        assetIds.forEach((assetId) => {
          myLogger.debug(`Uninstall asset [${resourceId}]/[${assetId}]`);
          const asset = resource.assets.find(i => i.id == assetId);
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
      let resource = oldResources.find(i => i.id == resourceId);
      if (resource == undefined) {
        resource = newLocalResource(resourceId);
        oldResources.push(resource);
      }
      for (const assetId of assetIds) {
        const asset = resource.assets.find(i => i.id == assetId);
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
          resource.assets.push(newDownloadedAsset(assetId));
          myLogger.debug(`Add new download asset [${resource.id}][${assetId}]`);
        }
      }
    });
    deletedAssets.forEach((assetIds, resourceId) => {
      const resource = oldResources.find(i => i.id == resourceId);
      if (resource != undefined) {
        assetIds.forEach((assetId) => {
          const asset = resource.assets.find(i => i.id == assetId);
          if (asset) {
            if (existOnlineAsset(asset)) {
              myLogger.debug(`Update none status asset [${resourceId}]/[${assetId}]`);
              asset.status = AssetStatus.NONE;
            } else {
              myLogger.debug(`Delete asset [${resourceId}]/[${assetId}]`);
              deleteArrayItemByFieldId(resource.assets, asset);
            }
          }
        });
      }
    });
  }

  function addDownloadAsset(gameId: string, resourceId: string, assetId: string) {
    const oldResources = getGameById(gameId)?.resources;
    myLogger.debug(`Add new local asset [${resourceId}]:[${assetId}]`);
    let resource = oldResources.find(i => i.id == resourceId);
    if (resource == undefined) {
      resource = newLocalResource(resourceId);
      oldResources.push(resource);
    }
    const asset = resource.assets.find(i => i.id == assetId);
    if (asset != undefined) {
      if (asset.status == AssetStatus.NONE) {
        asset.status = AssetStatus.DOWNLOADED;
      }
    } else {
      resource.assets.push(newDownloadedAsset(assetId));
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
    updateOnlineGames,
    updateOnlineResources,
    updateOnlineAssets,
    updateInstalledAsset,
    updateDonwloadedAsset,
    addDownloadAsset,
    updateAssetStatus
  };
}, { persistence: true });

interface State {
  games: Game[]
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
      games: [{
        id: 'csti',
        name: 'Card Survival: Tropical Island',
        dataRepo: 'HeYaoDaDa/GrcData-csti',
        steamAppName: 'Card Survival Tropical Island',
        relativeRootInstallPath: './BepInEx/plugins',
        autoMkRelativeRootInstallPath: false,
        resources: []
      }]
    };
  }
}
