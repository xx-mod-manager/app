import { api } from 'boot/axios';
import { ApiMainData } from 'src/class/Types';
import { useAuthDataStore } from 'src/stores/AuthData';

export async function requestMainData(): Promise<ApiMainData> {
  const authData = useAuthDataStore();
  const response = await api.get(
    'https://api.github.com/repos/HeYaoDaDa/CddaModCommunityData/contents/mainData.json',
    {
      headers: {
        Authorization: authData.token
      }
    }
  );
  const content: string = response.data.content;
  const jsonStr = decodeURIComponent(escape(window.atob(content)));
  return JSON.parse(jsonStr);
}
