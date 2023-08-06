import { api } from 'boot/axios';
import { ApiGame, ApiResource } from 'src/class/Types';
import { useAuthDataStore } from 'src/stores/AuthData';

const MAIN_DATA_REPO = 'HeYaoDaDa/GithubResourceCommunityData';

export async function requestGames(): Promise<ApiGame[]> {
  const authData = useAuthDataStore();
  const response = await api.get(
    `https://api.github.com/repos/${MAIN_DATA_REPO}/contents/games.json`,
    {
      headers: {
        Authorization: authData.token
      }
    }
  );
  const content: string = response.data.content;
  const jsonStr = decodeURIComponent(escape(window.atob(content)));
  const ApiGames: ApiGame[] = JSON.parse(jsonStr);
  return ApiGames;
}

export async function requestGameResources(gameMainDataRepo: string): Promise<ApiResource[]> {
  const authData = useAuthDataStore();
  const response = await api.get(
    `https://api.github.com/repos/${gameMainDataRepo}/contents/resources.json`,
    {
      headers: {
        Authorization: authData.token
      }
    }
  );
  const content: string = response.data.content;
  const jsonStr = decodeURIComponent(escape(window.atob(content)));
  const apiResources = JSON.parse(jsonStr) as ApiResource[];
  return apiResources;
}
