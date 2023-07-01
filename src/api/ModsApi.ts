import { api } from 'boot/axios';
import { Mod } from 'src/class/Mod';

export async function getMods(): Promise<Mod[]> {
  const response = await api.get(
    'https://api.github.com/repos/HeYaoDaDa/CddaModCommunityData/contents/mods.json'
  );
  //todo content over, is null
  const content: string = response.data.content;
  const result = decodeURIComponent(escape(window.atob(content)));
  console.log('result is %s', result);
  return JSON.parse(result);
}
