import { api } from 'boot/axios';
import { GithubTokenInfo } from 'src/class/GithubTokenInfo';

const URL_GITHUB_DEVICE_TOKEN_QUERY =
  'http://localhost:9999/token/create';

export async function getTokenInfo(code: string): Promise<GithubTokenInfo> {
  const response = await api.get(URL_GITHUB_DEVICE_TOKEN_QUERY, {
    params: {
      code
    },
  });
  return response.data;
}
