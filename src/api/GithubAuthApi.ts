import { api } from 'boot/axios';
import { GithubDeviceCodeInfo, GithubTokenInfo } from 'src/class/GithubTokenInfo';

const URL_GITHUB_CREATE_TOKEN = 'http://localhost:9999/token/create';
const URL_GITHUB_REFRESH_TOKEN = 'http://localhost:9999/token/refresh';
const URL_GITHUB_DEVICE_CODE = 'http://localhost:9999/device/code';
const URL_GITHUB_DEVICE_TOKEN = 'http://localhost:9999/device/token';

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

export async function requestDeviceCode(): Promise<GithubDeviceCodeInfo> {
  const response = await api.get(URL_GITHUB_DEVICE_CODE);
  return response.data;
}

export async function getDeviceTokenInfo(deviceCode: string): Promise<GithubTokenInfo> {
  const response = await api.get(URL_GITHUB_DEVICE_TOKEN, {
    params: {
      device_code: deviceCode
    },
  });

  return response.data;
}
