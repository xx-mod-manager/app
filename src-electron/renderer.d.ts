import { app, dialog, shell } from 'electron';
import { File, Progress } from 'electron-dl';
import { existsSync, promises } from 'fs';
import path from 'path';
import { GithubDeviceCodeInfo, GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { LogEvent } from 'vue-logger-plugin';
import { getState } from './utils/FsUtil';
import { unzipAsset } from './utils/ZipUtil';
export { };

interface IElectronAPI {
  onElectronLog: (callback: (logEvent: LogEvent) => void) => void,


  downloadAndUnzipAsset: (url: string, gameId: string, resourceId: string, assetId: string) => void,
  onDownloadStarted: (callback: (assetFullId: string) => void) => void,
  onDownloadProgress: (callback: (assetFullId: string, progress: Progress) => void) => () => void,
  onDownloadCompleted: (callback: (assetFullId: string, file: File) => void) => void,

  formatInstallAndDownloadDir: (installPath: string, gameId: string) => Promise<Map<string, string[]>>,
  getDownloadedAssets: (gameId: string) => Promise<Map<string, string[]>>,
  getInstealledAssets: (installPath: string) => Promise<Map<string, string[]>>,
  deleteAsset: (gameId: string, resourceId: string, assetId: string) => Promise<void>,
  installAsset: (installPath: string, gameId: string, resourceId: string, assetId: string) => Promise<void>,
  uninstallAsset: (installPath: string, resourceId: string, assetId: string) => Promise<void>,
  selectDirectory: (title: string) => Promise<Electron.OpenDialogReturnValue>,
  selectDirectoryAddAsset: (gameId: string, title: string) => Promise<{ resourceId: string; assetId: string; } | undefined>,
  selectZipFileAddAsset: (gameId: string, title: string) => Promise<{ resourceId: string; assetId: string; } | undefined>,
  addAssetsByPaths: (gameId: string, paths: string[]) => Promise<{ resourceId: string; assetId: string; }[]>,


  requestDeviceCode: () => Promise<GithubDeviceCodeInfo>,
  requestDeviceTokenInfo: (deviceCode: string) => Promise<GithubTokenInfo>,


  getIntallPathBySteamAppWithRelativePath: (steamAppName: string, relativePath: string) => Promise<string | undefined>,
  openDialogSelectDirectory: (title: string) => Promise<{ name: string; path: string; } | undefined>,
  openDialogSelectZipFile: (title: string) => Promise<{ name: string; path: string; } | undefined>,
  getPathInfoByPath: (path: string) => Promise<{ exist: boolean; ext: string | undefined; isFile: boolean; isDirectory: boolean; name: string; path: string }>,

  dialog: {
    showOpenDialog: PromiseReturnType<typeof dialog.showOpenDialog>
  },
  app: {
    getPath: PromiseReturnType<typeof app.getPath>
  },
  shell: {
    showItemInFolder: PromiseReturnType<typeof shell.showItemInFolder>
  },
  path: {
    getBasename: PromiseReturnType<typeof path.basename>,
    join: PromiseReturnType<typeof path.join>,
    extname: PromiseReturnType<typeof path.extname>,
  },
  fs: {
    exist: PromiseReturnType<typeof existsSync>,
    cp: PromiseReturnType<typeof promises.cp>,
    rename: PromiseReturnType<typeof promises.rename>,
    rm: PromiseReturnType<typeof promises.rm>,
    unzipAsset: PromiseReturnType<typeof unzipAsset>,
    state: PromiseReturnType<typeof getState>,
    symlink: PromiseReturnType<typeof promises.symlink>,
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PromiseReturnType<T extends (...args: any) => unknown> = (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>


declare global {
  interface Window {
    electronApi?: IElectronAPI
  }
}
