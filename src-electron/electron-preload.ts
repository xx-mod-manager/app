import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { File, Progress } from 'electron-dl';
import { LogEvent } from 'vue-logger-plugin';

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

  formatInstallAndDownloadDir: (installPath: string, gameId: string) => ipcRenderer.invoke('formatInstallAndDownloadDir', installPath, gameId),
  getDownloadedAssets: (gameId: string) => ipcRenderer.invoke('getDownloadedAssets', gameId),
  getInstealledAssets: (installPath: string) => ipcRenderer.invoke('getInstealledAssets', installPath),
  deleteAsset: (gameId: string, resourceId: string, assetId: string) => ipcRenderer.invoke('deleteAsset', gameId, resourceId, assetId),
  installAsset: (installPath: string, gameId: string, resourceId: string, assetId: string) => ipcRenderer.invoke('installAsset', installPath, gameId, resourceId, assetId),
  uninstallAsset: (installPath: string, resourceId: string, assetId: string) => ipcRenderer.invoke('uninstallAsset', installPath, resourceId, assetId),
  selectDirectory: (title: string) => ipcRenderer.invoke('selectDirectory', title),
  selectDirectoryAddAsset: (gameId: string, title: string) => ipcRenderer.invoke('selectDirectoryAddAsset', gameId, title),
  selectZipFileAddAsset: (gameId: string, title: string) => ipcRenderer.invoke('selectZipFileAddAsset', gameId, title),
  addAssetsByPaths: (gameId: string, paths: string[]) => ipcRenderer.invoke('addAssetsByPaths', gameId, paths),


  requestDeviceCode: () => ipcRenderer.invoke('requestDeviceCode'),
  requestDeviceTokenInfo: (deviceCode: string) => ipcRenderer.invoke('requestDeviceTokenInfo', deviceCode),


  getIntallPathBySteamAppWithRelativePath: (steamAppName: string, relativePath: string) => ipcRenderer.invoke('getIntallPathBySteamAppWithRelativePath', steamAppName, relativePath),
});
