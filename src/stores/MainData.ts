import { defineStore } from 'pinia';
import { requestMainData } from 'src/api/MainDataApi';
import { myLogger } from 'src/boot/logger';
import { ApiAsset, Asset } from 'src/class/Types';

const KEY_MAIN_DATA = 'mainData';

export const useMainDataStore = defineStore(KEY_MAIN_DATA, {
  state: init,

  getters: {},

  actions: {
    async refresh() {
      myLogger.debug('Update MainDataStore start.');
      const newMainData = await requestMainData();
      myLogger.debug(`New MainData.\n updateed: ${newMainData.updated}.\n assets count:${newMainData.assets.length}.`);
      if (this.updated.getTime() < newMainData.updated) {
        this.updated = new Date(newMainData.updated);
        updateAssets(this.assets, newMainData.assets);
      } else {
        myLogger.debug('MainData not update.');
      }
      localStorage.setItem(KEY_MAIN_DATA, JSON.stringify(this.$state));
      myLogger.debug('Update MainDataStore end.');
    },

    getAssetById(id: string): Asset | undefined {
      return this.assets.find((it) => it.id == id);
    }
  },
});

interface MainData {
  updated: Date
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
      if (index > -1) delete deletedAssets[index];
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
        delete oldAssets[index];
        myLogger.debug(`Delete old asset ${oldAsset.id}.`);
      }
    } else {
      throw Error(`old assets miss deleted asset ${deletedAsset.id}.`);
    }
  });
}

function init(): MainData {
  const localMainDataJson = localStorage.getItem(KEY_MAIN_DATA);
  if (localMainDataJson) {
    const localMainData = JSON.parse(localMainDataJson) as MainData;
    myLogger.debug(
      `Resume MainDataStore from localStorage.\n updated: ${localMainData.updated}.\n assets count: ${localMainData.assets.length}.`
    );
    return localMainData;
  } else {
    myLogger.debug('New MainDataStore.');
    return {
      updated: new Date(0),
      assets: []
    };
  }
}
