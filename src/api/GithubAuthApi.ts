import { api } from 'boot/axios';
import { GithubTokenInfo } from 'src/class/GithubTokenInfo';

const URL_GITHUB_CREATE_TOKEN =
  'http://localhost:9999/token/create';
const URL_GITHUB_REFRESH_TOKEN =
  'http://localhost:9999/token/refresh';

export async function getTokenInfo(code: string): Promise<GithubTokenInfo> {
  const response = await api.get(URL_GITHUB_CREATE_TOKEN, {
    params: {
      code
    },
  });

  return response.data;
}

export async function refreshTokenInfo(tokenInfo: GithubTokenInfo): Promise<GithubTokenInfo> {
  const response = await api.post(URL_GITHUB_REFRESH_TOKEN, tokenInfo, { headers: { 'Content-Type': 'application/json' } });

  return response.data;
}
