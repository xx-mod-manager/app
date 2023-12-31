import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { File, Progress } from 'electron-dl';
import { LogEvent } from 'vue-logger-plugin';
import { APP_GET_PATH, DIALOG_SHOW_OPEN_DIALOG, FS_CP, FS_EXIST, FS_LSTATE, FS_MKDIR, FS_READDIR, FS_RENAME, FS_RM, FS_STATE, FS_SYMLINK, FS_UNZIP_ASSET, PATH_EXTNAME, PATH_GET_BASENAME, PATH_JOIN, SHELL_OPEN_PATH, SHELL_SHOW_ITEM_IN_FOLDER } from './electron-constant';

contextBridge.exposeInMainWorld('electronApi', {
  onElectronLog: (callback: (logEvent: LogEvent) => void) => ipcRenderer.on('onElectronLog', (_, logEvent) => callback(logEvent)),


  downloadAndUnzipAsset: (url: string, gameId: string, resourceId: string, assetId: string) => ipcRenderer.send('downloadAndUnzipAsset', url, gameId, resourceId, assetId),
  onDownloadStarted: (callback: (assetFullId: string) => void) => ipcRenderer.once('onDownloadStarted', (_, url) => callback(url)),
  onDownloadProgress: (callback: (assetFullId: string, progress: Progress) => void) => {
    const func = (_: IpcRendererEvent, assetFullId: string, progress: Progress) => callback(assetFullId, progress);
    ipcRenderer.on('onDownloadProgress', func);
    return () => ipcRenderer.removeListener('onDownloadProgress', func);
  },
  onDownloadCompleted: (callback: (assetFullId: string, file: File) => void) => ipcRenderer.once('onDownloadCompleted', (_, assetFullId, file) => callback(assetFullId, file)),

  requestDeviceCode: () => ipcRenderer.invoke('requestDeviceCode'),
  requestDeviceTokenInfo: (deviceCode: string) => ipcRenderer.invoke('requestDeviceTokenInfo', deviceCode),

  dialog: {
    showOpenDialog: (options: unknown) => ipcRenderer.invoke(DIALOG_SHOW_OPEN_DIALOG, options),
  },
  app: {
    getPath: (name: unknown) => ipcRenderer.invoke(APP_GET_PATH, name),
  },
  shell: {
    showItemInFolder: (fullPath: unknown) => ipcRenderer.invoke(SHELL_SHOW_ITEM_IN_FOLDER, fullPath),
    openPath: (fullPath: unknown) => ipcRenderer.invoke(SHELL_OPEN_PATH, fullPath),
  },
  path: {
    getBasename: (fullpath: unknown, suffix: unknown) => ipcRenderer.invoke(PATH_GET_BASENAME, fullpath, suffix),
    join: (...paths: unknown[]) => ipcRenderer.invoke(PATH_JOIN, ...paths),
    extname: (fullPath: unknown) => ipcRenderer.invoke(PATH_EXTNAME, fullPath),
  },
  fs: {
    exist: (path: unknown) => ipcRenderer.invoke(FS_EXIST, path),
    cp: (source: unknown, destination: unknown, opts: unknown) => ipcRenderer.invoke(FS_CP, source, destination, opts),
    rename: (oldPath: unknown, newPath: unknown) => ipcRenderer.invoke(FS_RENAME, oldPath, newPath),
    rm: (path: unknown, options: unknown) => ipcRenderer.invoke(FS_RM, path, options),
    unzipAsset: (zipPath: unknown, targetPath: unknown) => ipcRenderer.invoke(FS_UNZIP_ASSET, zipPath, targetPath),
    state: (path: unknown, opts: unknown) => ipcRenderer.invoke(FS_STATE, path, opts),
    lstate: (path: unknown, opts: unknown) => ipcRenderer.invoke(FS_LSTATE, path, opts),
    symlink: (target: unknown, path: unknown, type: unknown) => ipcRenderer.invoke(FS_SYMLINK, target, path, type),
    readdir: (path: unknown, opts: unknown) => ipcRenderer.invoke(FS_READDIR, path, opts),
    mkdir: (path: unknown, opts: unknown) => ipcRenderer.invoke(FS_MKDIR, path, opts),
  },
});
