import { defineStore } from 'pinia';
import { requestMainData } from 'src/api/MainDataApi';
import { myLogger } from 'src/boot/logger';
import { ApiAsset, Asset, AssetStatus, ReleaseAsset } from 'src/class/Types';
import { filterReleaseAsset } from 'src/utils/AssetUtils';
import { replacer, reviver } from 'src/utils/JsonUtil';
import { parseVersion } from 'src/utils/StringUtils';

const KEY_MAIN_DATA = 'mainData';

export const useMainDataStore = defineStore(KEY_MAIN_DATA, {
  state: init,

  getters: {},

  actions: {
    save() {
      localStorage.setItem(KEY_MAIN_DATA, JSON.stringify(this.$state, replacer));
    },

    async refresh() {
      myLogger.debug('Update MainDataStore start.');
      const newMainData = await requestMainData();
      myLogger.debug(`New MainData.\n updateed: ${newMainData.updated}.\n assets count:${newMainData.assets.length}.`);
      if (this.updated < newMainData.updated) {
        this.updated = newMainData.updated;
        updateAssets(this.assets, newMainData.assets);
      } else {
        myLogger.debug('MainData not update.');
      }
      this.save();
      myLogger.debug('Update MainDataStore end.');

      function updateAssets(oldAssets: Asset[], newApiAssets: ApiAsset[]) {
        const newAssets = newApiAssets.map(it => new Asset(it));
        const deletedAssets: Asset[] = [...oldAssets];
        newAssets.forEach((newAsset) => {
          const oldAsset = oldAssets.find((it) => it.id == newAsset.id);
          if (oldAsset) {
            oldAsset.updateFromRemote(newAsset);
            const index = deletedAssets.findIndex((it) => it.id == newAsset.id);
            if (index > -1) deletedAssets.splice(index, 1);
          } else {
            oldAssets.push(newAsset);
            myLogger.debug(`Add new asset ${newAsset.id}`);
          }
        });
        deletedAssets.forEach((deletedAsset) => {
          const oldAsset = oldAssets.find((it) => it.id == deletedAsset.id);
          if (oldAsset) {
            if (oldAsset.existLocal()) {
              oldAsset.existOnline = false;
              myLogger.debug(`Set old asset ${oldAsset.id} online to false.`);
            } else {
              const index = oldAssets.findIndex((it) => it.id == deletedAsset.id);
              oldAssets.splice(index, 1);
              myLogger.debug(`Delete old asset ${oldAsset.id}.`);
            }
          } else {
            throw Error(`old assets miss deleted asset ${deletedAsset.id}.`);
          }
        });
      }
    },

    getAssetById(id: string): Asset | undefined {
      return this.assets.find((it) => it.id == id);
    },

    updateReleaseAssets(asset: Asset, releaseAssets: ReleaseAsset[]) {
      const assetFiles = filterReleaseAsset(releaseAssets);
      updateAssetVersions(asset.versions, assetFiles);
      this.save();

      function updateAssetVersions(versions: Map<string, AssetStatus>, assetFiles: ReleaseAsset[]) {
        const newVersions: string[] = Array.from(new Set(assetFiles.map(it => parseVersion(it.name))));
        const deletedVersions: string[] = [...versions.keys()];
        newVersions.forEach((newVersion) => {
          const index = deletedVersions.indexOf(newVersion);
          if (index >= 0) {
            deletedVersions.splice(index, 1);
          } else {
            versions.set(newVersion, AssetStatus.NONE);
          }
        });
        deletedVersions.forEach((deletedVersion) => {
          const status = versions.get(deletedVersion);
          if (status != undefined) {
            if (status == AssetStatus.NONE) {
              versions.delete(deletedVersion);
            }
          }
        });
      }
    },

    updateDownloadedAsset(downloadedAssets: Map<string, string[]>) {
      myLogger.debug(`updateDownloadedAsset start, asset count is ${downloadedAssets.size}`);
      downloadedAssets.forEach((versions, downloadedAssetId) => {
        versions.forEach((version) => {
          myLogger.debug(`update downloaded asset ${downloadedAssetId}/${version}`);
        });
      });
      const deletedAssets = new Map<string, string[]>();
      this.assets.forEach((asset) => {
        asset.versions.forEach((status, version) => {
          if (status == AssetStatus.DOWNLOADED) {
            let versions = deletedAssets.get(asset.id);
            if (versions == undefined) {
              versions = [];
              deletedAssets.set(asset.id, versions);
            }
            versions.push(version);
            myLogger.debug(`deletedAssets add ${asset.id}/${version}`);
          }
        });
      });
      downloadedAssets.forEach((versions, assetId) => {
        let asset = this.getAssetById(assetId);
        if (asset == undefined) {
          asset = newLocalAsset(assetId);
          this.assets.push(asset);
        }
        versions.forEach((version) => {
          const oldStatus = asset?.versions.get(version);
          if (oldStatus != undefined) {
            if (oldStatus == AssetStatus.NONE) {
              asset?.versions.set(version, AssetStatus.DOWNLOADED);
            } else if (oldStatus == AssetStatus.DOWNLOADED) {
              const deletedVersions = deletedAssets.get(assetId);
              deletedVersions?.splice(deletedVersions.indexOf(version), 1);
              myLogger.debug(`deletedAssets delete ${assetId}/${version}`);
            }
          } else {
            asset?.versions.set(version, AssetStatus.DOWNLOADED);
          }
        });
      });
      deletedAssets.forEach((versions, assetId) => {
        const asset = this.getAssetById(assetId);
        if (asset != undefined) {
          versions.forEach((version) => {
            myLogger.debug(`delete downloaded asset ${assetId}/${version}`);
            asset.versions.delete(version);
          });
        } else {
          myLogger.warn(`Miss deleted asset ${assetId}.`);
        }
      });
      this.save();
    },

    updateAssetVersion(assetId: string, version: string, newStatus: AssetStatus) {
      const asset = this.getAssetById(assetId);
      if (asset == undefined) {
        myLogger.warn(`asset: ${assetId} miss.`);
        return;
      }
      const oldStatus = asset.versions.get(version);
      if (oldStatus == undefined) {
        myLogger.warn(`asset: ${asset.id} miss version ${version}.`);
        return;
      }
      if (oldStatus == newStatus) {
        myLogger.warn(`asset: ${asset.id} version: ${version}, status:${oldStatus} miss update.`);
        return;
      }
      asset.versions.set(version, newStatus);
      myLogger.debug(`asset: ${asset.id} version: ${version}, ${oldStatus} => ${newStatus}`);
      this.save();
    }
  },
});

interface MainData {
  updated: number
  assets: Asset[]
}

function newLocalAsset(id: string) {
  const asset = new Asset({
    id,
    name: id,
    description: id,
    author: 'none',
    category: 'other',
    tags: [],
    repo: '',
    created: 0,
    updated: 0,
    downloadCount: 0,
    releaseNodeId: '',
    discussionNodeId: ''
  });
  asset.existOnline = false;
  return asset;
}

function init(): MainData {
  const localMainDataJson = localStorage.getItem(KEY_MAIN_DATA);
  if (localMainDataJson) {
    const localMainData = JSON.parse(localMainDataJson, reviver) as MainData;
    myLogger.debug(
      `Resume MainDataStore from localStorage.\n updated: ${localMainData.updated}.\n assets count: ${localMainData.assets.length}.`
    );
    return localMainData;
  } else {
    myLogger.debug('New MainDataStore.');
    return {
      updated: 0,
      assets: []
    };
  }
}
