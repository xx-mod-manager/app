import { api } from 'boot/axios';
import { CLIENT_ID } from 'src/Constants';
import { GithubDeviceCodeInfo, GithubTokenInfo } from 'src/class/GithubTokenInfo';

const URL_GITHUB_CREATE_TOKEN = 'http://localhost:9999/token/create';
const URL_GITHUB_REFRESH_TOKEN = 'http://localhost:9999/token/refresh';
const URL_GITHUB_DEVICE_CODE = 'http://localhost:9999/device/code';
const URL_GITHUB_DEVICE_TOKEN = 'http://localhost:9999/device/token';
export const URL_GITHUB_REQUEST_CODE = 'https://github.com/login/oauth/authorize?client_id=' + CLIENT_ID;

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
  if (window.electronApi == undefined) {
    const response = await api.get(URL_GITHUB_DEVICE_CODE);
    return response.data;
  } else {
    return await window.electronApi.requestDeviceCode();
  }
}

export async function requestDeviceTokenInfo(deviceCode: string): Promise<GithubTokenInfo> {
  if (window.electronApi == undefined) {

    const response = await api.get(URL_GITHUB_DEVICE_TOKEN, {
      params: {
        device_code: deviceCode
      },
    });

    return response.data;
  } else {
    return await window.electronApi.requestDeviceTokenInfo(deviceCode);
  }
}
