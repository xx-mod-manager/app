import { api } from 'boot/axios';
import { Mod } from 'src/class/Mod';
import { useAuthDataStore } from 'src/stores/AuthData';

export async function getMods(): Promise<Mod[]> {
  const authData = useAuthDataStore();
  const response = await api.get(
    'https://api.github.com/repos/HeYaoDaDa/CddaModCommunityData/contents/mods.json',
    {
      headers: {
        Authorization: authData.token
      }
    }
  );
  //todo content over 1 mb, is null
  const content: string = response.data.content;
  //todo replace escape
  const result = decodeURIComponent(escape(window.atob(content)));

  return JSON.parse(result);
}
