import { defineStore } from 'pinia';
import { requestMainData } from 'src/api/MainDataApi';
import { myLogger } from 'src/boot/logger';
import { ApiAsset, Asset, AssetStatus, ReleaseAsset } from 'src/class/Types';
import { filterReleaseAsset } from 'src/utils/AssetUtils';
import { replacer, reviver } from 'src/utils/JsonUtil';

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
    },

    getAssetById(id: string): Asset | undefined {
      return this.assets.find((it) => it.id == id);
    },

    updateReleaseAssets(asset: Asset, releaseAssets: ReleaseAsset[]) {
      const assetFiles = filterReleaseAsset(releaseAssets);
      updateAssetVersions(asset.versions, assetFiles);
      this.save();
    }
  },
});

interface MainData {
  updated: number
  assets: Asset[]
}

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

function updateAssetVersions(versions: Map<string, AssetStatus>, assetFiles: ReleaseAsset[]) {
  const newVersions: string[] = Array.from(new Set(assetFiles.map(it => parseVersion(it.name))));
  myLogger.debug(versions);
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

function parseVersion(name: string): string {
  const re = /^[a-z,A-Z,_,0-9]*-?([0-9,.]+).zip$/;
  const result = re.exec(name);
  if (result) return result[1];
  else return '';
}
