import { File, Progress } from 'electron-dl';
import { GithubDeviceCodeInfo, GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { LogEvent } from 'vue-logger-plugin';

export interface IElectronAPI {
  onElectronLog: (callback: (logEvent: LogEvent) => void) => void,


  downloadAndUnzipAsset: (url: string, gameId: string, resourceId: string, assetId: string) => void,
  onDownloadStarted: (callback: (assetFullId: string) => void) => void,
  onDownloadProgress: (callback: (assetFullId: string, progress: Progress) => void) => void,
  onDownloadCompleted: (callback: (assetFullId: string, file: File) => void) => void,

  formatInstallAndDownloadDir: (installPath: string, gameId: string) => Promise<Map<string, string[]>>,
  getDownloadedAssets: (gameId: string) => Promise<Map<string, string[]>>,
  getInstealledAssets: (installPath: string) => Promise<Map<string, string[]>>,
  deleteAsset: (gameId: string, resourceId: string, assetId: string) => Promise<void>,
  installAsset: (installPath: string, gameId: string, resourceId: string, assetId: string) => Promise<void>,
  uninstallAsset: (installPath: string, resourceId: string, assetId: string) => Promise<void>,
  selectDirectory: (title: string) => Promise<Electron.OpenDialogReturnValue>,
  selectDirectoryAddAsset: (gameId: string, title: string) => Promise<{ resource: string; assetId: string; } | undefined>,
  selectZipFileAddAsset: (gameId: string, title: string) => Promise<{ resource: string; assetId: string; } | undefined>,
  addAssetsByPaths: (gameId: string, paths: string[]) => Promise<{ resource: string; assetId: string; }[]>,


  requestDeviceCode: () => Promise<GithubDeviceCodeInfo>,
  requestDeviceTokenInfo: (deviceCode: string) => Promise<GithubTokenInfo>,


  getIntallPathBySteamAppWithRelativePath: (steamAppName: string, relativePath: string) => Promise<string | undefined>,
}

declare global {
  interface Window {
    electronApi?: IElectronAPI
  }
}
