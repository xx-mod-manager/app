import { defineStore } from 'pinia';
import { myLogger } from 'src/boot/logger';
import { Asset, AssetStatus, Game, Resource } from 'src/class/Types';
import { deleteItem, deleteItemById, deleteItemsById, findById } from 'src/utils/ArrayUtils';
import { existLocalAsset, newDownloadedAsset, newInstalledAsset, updateOnlineAsset } from 'src/utils/AssetUtils';
import { existLocalGame, updateOnlineGame } from 'src/utils/GameUtils';
import { replacer, reviver } from 'src/utils/JsonUtil';
import { existLocalResource, newLocalResource, updateOnlineResource } from 'src/utils/ResourceUtils';

const KEY_MAIN_DATA = 'mainData';

export const useMainDataStore = defineStore(KEY_MAIN_DATA, {
  state: init,

  getters: {},

  actions: {
    save() {
      localStorage.setItem(KEY_MAIN_DATA, JSON.stringify(this.$state, replacer));
      myLogger.debug('Save MainDataStore.');
    },

    getGameById(id: string): Game | undefined {
      return this.games.find((it) => it.id == id);
    },

    getResourceById(gameId: string, resourceId: string): Resource | undefined {
      return this.getGameById(gameId)?.resources.find((it) => it.id = resourceId);
    },

    getOptionAssetById(gameId: string, resourceId: string, assetId: string): Asset | undefined {
      return this.getResourceById(gameId, resourceId)?.assets.find(i => i.id == assetId);
    },

    getAssetById(gameId: string, resourceId: string, assetId: string): Asset {
      const asset = this.getOptionAssetById(gameId, resourceId, assetId);
      if (asset == undefined) throw Error(`Miss ${gameId}/${resourceId}/${assetId}`);
      return asset;
    },

    updateOnlineGames(onlineGames: Game[]) {
      const deletedGames: Game[] = [...this.games.filter(i => !existLocalGame(i))];
      onlineGames.forEach((onlineGame) => {
        const oldGame = this.getGameById(onlineGame.id);
        if (oldGame != undefined) {
          updateOnlineGame(oldGame, onlineGame);
          deleteItemById(deletedGames, onlineGame);
        } else {
          this.games.push(onlineGame);
          myLogger.debug(`Add new online game [${onlineGame.id}]`);
        }
      });
      deleteItemsById(this.games, deletedGames);
      this.save();
    },

    updateOnlineResources(gameId: string, onlineResources: Resource[]) {
      const oldResources = this.getGameById(gameId)?.resources;
      if (oldResources == undefined)
        throw Error(`gameId: [${gameId}] miss.`);
      const deletedResources: Resource[] = [...oldResources.filter(i => !existLocalResource(i))];
      oldResources.forEach((it) => it.existOnline = false);
      onlineResources.forEach((onlineResource) => {
        const oldResource = findById(oldResources, onlineResource);
        if (oldResource) {
          updateOnlineResource(oldResource, onlineResource);
          deleteItemById(deletedResources, onlineResource);
        } else {
          oldResources.push(onlineResource);
          myLogger.debug(`Add new online resource [${onlineResource.id}]`);
        }
      });
      deleteItemsById(oldResources, deletedResources);
      this.save();
    },

    updateOnlineAssets(gameId: string, resourceId: string, onlineAssets: Asset[]) {
      const oldAssets = this.getResourceById(gameId, resourceId)?.assets;
      if (oldAssets == undefined)
        throw Error(`Resource: [${gameId}]/[${resourceId}] miss.`);
      const deletedAssets = oldAssets.filter(i => !existLocalAsset(i));
      oldAssets.forEach((it) => it.downloadUrl = undefined);
      onlineAssets.forEach((onlineAsset) => {
        const oldAsset = findById(oldAssets, onlineAsset);
        if (oldAsset) {
          myLogger.debug(`Update online asset [${onlineAsset.id}]`);
          updateOnlineAsset(oldAsset, onlineAsset);
          deleteItemById(deletedAssets, onlineAsset);
        } else {
          oldAssets.push(onlineAsset);
          myLogger.debug(`Add new online asset [${onlineAsset.id}]`);
        }
      });
      deletedAssets.forEach(deleteAsset => myLogger.debug(`delete asset [${deleteAsset.id}]`));
      deleteItemsById(oldAssets, deletedAssets);
      this.save();
    },

    updateInstalledAsset(gameId: string, installedAssets: Map<string, string[]>) {
      const oldResources = this.getGameById(gameId)?.resources;
      if (oldResources == undefined)
        throw Error(`GameId: [${gameId}] miss.`);
      myLogger.debug(`updateInstalledAsset start, resource count is ${installedAssets.size}`);
      installedAssets.forEach((assets, installedResourceId) => {
        assets.forEach((asset) => {
          myLogger.debug(`update installed asset ${installedResourceId}/${asset}`);
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
            myLogger.debug(`uninstalledAssets add ${resource.id}/${asset.id}`);
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
            } else if (asset.status == AssetStatus.INTALLED) {
              const uninstalledVersions = uninstalledAssets.get(resourceId);
              if (uninstalledVersions)
                deleteItem(uninstalledVersions, assetId);
              myLogger.debug(`uninstalledAssets delete ${resourceId}/${assetId}`);
            }
          } else {
            resource.assets.push(newInstalledAsset(assetId));
          }
        }
      });
      uninstalledAssets.forEach((assetIds, resourceId) => {
        const resource = oldResources.find(i => i.id == resourceId);
        if (resource != undefined) {
          assetIds.forEach((assetId) => {
            myLogger.debug(`uninstall uninstalled asset ${resourceId}/${assetId}`);
            const asset = resource.assets.find(i => i.id == assetId);
            if (asset)
              asset.status = AssetStatus.DOWNLOADED;
          });
        }
      });
      this.save();
    },

    updateDonwloadedAsset(gameId: string, downloadedAssets: Map<string, string[]>) {
      const oldResources = this.getGameById(gameId)?.resources;
      if (oldResources == undefined)
        throw Error(`GameId: [${gameId}] miss.`);
      myLogger.debug(`updateDonwloadedAsset start, resource count is ${downloadedAssets.size}`);
      downloadedAssets.forEach((assets, downloadedResourceId) => {
        assets.forEach((asset) => {
          myLogger.debug(`update downloaded asset ${downloadedResourceId}/${asset}`);
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
            myLogger.debug(`deletedAssets add ${resource.id}/${asset.id}`);
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
            } else if (asset.status == AssetStatus.DOWNLOADED) {
              const deletedVersions = deletedAssets.get(resourceId);
              if (deletedVersions)
                deleteItem(deletedVersions, assetId);
              myLogger.debug(`deletedAssets delete ${resourceId}/${assetId}`);
            }
          } else {
            resource.assets.push(newDownloadedAsset(assetId));
          }
        }
      });
      deletedAssets.forEach((assetIds, resourceId) => {
        const resource = oldResources.find(i => i.id == resourceId);
        if (resource != undefined) {
          assetIds.forEach((assetId) => {
            const asset = resource.assets.find(i => i.id == assetId);
            if (asset) {
              if (asset.downloadUrl) {
                myLogger.debug(`update deleted asset status ${resourceId}/${assetId}`);
                asset.status = AssetStatus.NONE;
              } else {
                myLogger.debug(`delete deleted asset ${resourceId}/${assetId}`);
                deleteItemById(resource.assets, asset);
              }
            }
          });
        }
      });
      this.save();
    },

    updateAssetStatus(gameId: string, resourceId: string, assetId: string, newStatus: AssetStatus) {
      const resource = this.getResourceById(gameId, resourceId);
      if (resource == undefined) {
        myLogger.warn(`resource: ${resourceId} miss.`);
        return;
      }
      const oldAsset = resource.assets.find(i => i.id == assetId);
      if (oldAsset == undefined) {
        myLogger.warn(`resource: ${resource.id} miss asset ${assetId}.`);
        return;
      }
      if (oldAsset.status == newStatus) {
        myLogger.warn(`resource: ${resource.id} asset: ${assetId}, status:${oldAsset.status} miss update.`);
        return;
      }
      oldAsset.status = newStatus;
      myLogger.debug(`resource: ${resource.id} asset: ${assetId}, ${oldAsset.status} => ${newStatus}`);
      this.save();
    }
  },
});

interface MainData {
  games: Game[]
}

function init(): MainData {
  const localMainDataJson = localStorage.getItem(KEY_MAIN_DATA);
  if (localMainDataJson) {
    const localMainData = JSON.parse(localMainDataJson, reviver) as MainData;
    myLogger.debug(
      `Resume MainDataStore from localStorage game size: ${localMainData.games.length}.`
    );
    return localMainData;
  } else {
    myLogger.debug('New MainDataStore.');
    return {
      games: []
    };
  }
}
