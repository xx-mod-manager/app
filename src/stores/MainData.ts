import { defineStore } from 'pinia';
import { getCurrentAuthor } from 'src/api/GraphqlApi';
import { getMods as getModsByRemote } from 'src/api/ModsApi';
import { myLogger } from 'src/boot/logger';
import { Mod } from 'src/class/Mod';
import { Author } from 'src/class/Types';

export const KEY_MAIN_DATA = 'mainData';

export const useMainDataStore = defineStore(KEY_MAIN_DATA, {
  state: initMainData,
  getters: {},
  actions: {
    async updateData() {
      myLogger.debug('update main data start.');

      const promises = [getModsByRemote(), getCurrentAuthor()];

      const result = await Promise.all(promises);

      myLogger.debug(promises);
      let newMods: Mod[] = [];
      let newUser: Author = { avatarUrl: '', login: '' };
      result.forEach((it) => {
        if (Array.isArray(it)) {
          newMods = it;
        } else {
          newUser = it as unknown as Author;
        }
      });

      myLogger.debug(`new mods count is  ${newMods.length}, new user name is ${newUser.login}.`);
      this.mods = newMods;
      this.user = newUser;
      localStorage.setItem(KEY_MAIN_DATA, JSON.stringify(this.$state));
      myLogger.debug('update main data end.');
    },
    getMod(modId: string) {
      return this.mods.find((mod) => mod.mod_id == modId);
    }
  },
});

function initMainData(): {
  mods: Mod[];
  user: Author;
} {
  const localMainDataJson = localStorage.getItem(KEY_MAIN_DATA);

  if (localMainDataJson) {
    const localMainData = JSON.parse(localMainDataJson) as { mods: Mod[], user: Author; };

    myLogger.debug(
      `resume main data from localStorage, mods count is ${localMainData.mods.length}.`
    );

    return localMainData;
  } else {
    myLogger.debug('main data miss from localStorage, init new main data.');

    return {
      mods: [],
      user: {
        avatarUrl: '',
        login: 'null'
      }
    };
  }
}
