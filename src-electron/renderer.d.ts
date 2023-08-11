import { app, dialog, shell } from 'electron';
import { File, Progress } from 'electron-dl';
import { existsSync, promises } from 'fs';
import path from 'path';
import { GithubDeviceCodeInfo, GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { LogEvent } from 'vue-logger-plugin';
import { getLstate, getState } from './utils/FsUtil';
import { unzipAsset } from './utils/ZipUtil';
export { };

interface IElectronAPI {
  onElectronLog: (callback: (logEvent: LogEvent) => void) => void,

  downloadAndUnzipAsset: (url: string, gameId: string, resourceId: string, assetId: string) => void,
  onDownloadStarted: (callback: (assetFullId: string) => void) => void,
  onDownloadProgress: (callback: (assetFullId: string, progress: Progress) => void) => () => void,
  onDownloadCompleted: (callback: (assetFullId: string, file: File) => void) => void,

  requestDeviceCode: () => Promise<GithubDeviceCodeInfo>,
  requestDeviceTokenInfo: (deviceCode: string) => Promise<GithubTokenInfo>,

  dialog: {
    showOpenDialog: PromiseReturnType<typeof dialog.showOpenDialog>
  },
  app: {
    getPath: PromiseReturnType<typeof app.getPath>
  },
  shell: {
    showItemInFolder: PromiseReturnType<typeof shell.showItemInFolder>
    openPath: PromiseReturnType<typeof shell.openPath>
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
    lstate: PromiseReturnType<typeof getLstate>,
    symlink: PromiseReturnType<typeof promises.symlink>,
    readdir: typeof promises.readdir,
    mkdir: typeof promises.mkdir,
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PromiseReturnType<T extends (...args: any) => unknown> = (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>


declare global {
  interface Window {
    electronApi?: IElectronAPI
  }
}
