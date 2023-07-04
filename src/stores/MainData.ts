import { defineStore } from 'pinia';
import { getMods as getModsByRemote } from 'src/api/ModsApi';
import { myLogger } from 'src/boot/logger';
import { Mod } from 'src/class/Mod';

export const KEY_MAIN_DATA = 'mainData';

export const useMainDataStore = defineStore(KEY_MAIN_DATA, {
  state: initMainData,
  getters: {},
  actions: {
    async updateData() {
      myLogger.debug('update main data start.');

      const newMods = await getModsByRemote();

      myLogger.debug(`new mods count is  ${newMods.length}.`);
      this.mods = newMods;
      localStorage.setItem(KEY_MAIN_DATA, JSON.stringify(this.$state));
      myLogger.debug('update main data end.');
    },
    getMod(modId: string) {
      return this.mods.find((mod) => mod.mod_id == modId)
    }
  },
});

function initMainData(): {
  mods: Mod[];
} {
  const localMainDataJson = localStorage.getItem(KEY_MAIN_DATA);

  if (localMainDataJson) {
    const localMainData = JSON.parse(localMainDataJson) as { mods: Mod[] };

    myLogger.debug(
      `resume main data from localStorage, mods count is ${localMainData.mods.length}.`
    );

    return localMainData;
  } else {
    myLogger.debug('main data miss from localStorage, init new main data.');

    return {
      mods: [],
    };
  }
}
