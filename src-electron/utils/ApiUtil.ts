import axios from 'axios';
import { CLIENT_ID } from 'src/Constants';
import { GithubDeviceCodeInfo, GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { notNull } from 'src/utils/CommentUtils';


export async function requestDeviceCode(): Promise<GithubDeviceCodeInfo> {
  const response = await axios.post(`https://github.com/login/device/code?client_id=${CLIENT_ID}`);
  const data = new URLSearchParams(response.data);
  return {
    device_code: notNull(data.get('device_code')),
    user_code: notNull(data.get('user_code')),
    verification_uri: notNull(data.get('verification_uri')),
    expires_in: parseInt(notNull(data.get('expires_in'))),
    interval: parseInt(notNull(data.get('interval'))),
  };
}

export async function requestDeviceTokenInfo(code: string): Promise<GithubTokenInfo> {
  const response = await axios.post(`https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=${code}`);
  const data = new URLSearchParams(response.data);
  return {
    access_token: notNull(data.get('access_token')),
    expires_in: parseInt(notNull(data.get('expires_in'))),
    refresh_token: notNull(data.get('refresh_token')),
    refresh_token_expires_in: parseInt(notNull(data.get('refresh_token_expires_in')))
  };
}
