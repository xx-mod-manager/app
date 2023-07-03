export interface GithubTokenInfo {
  access_token: string;
  //no need
  expires_in: number | undefined;
  refresh_token: string;
  refresh_token_expires_in: number;
}
