import { api } from 'boot/axios';
import { Mod } from 'src/class/Mod';

export async function getMods(): Promise<Mod[]> {
  const response = await api.get(
    'https://api.github.com/repos/HeYaoDaDa/CddaModCommunityData/contents/mods.json'
  );
  //todo content over 1 mb, is null
  const content: string = response.data.content;
  //todo replace escape
  const result = decodeURIComponent(escape(window.atob(content)));

  return JSON.parse(result);
}
