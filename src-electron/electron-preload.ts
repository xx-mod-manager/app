import { contextBridge, ipcRenderer } from 'electron';
import { File } from 'electron-dl';
import { MyProgress } from 'src/class/Types';
import { LogEvent } from 'vue-logger-plugin';

contextBridge.exposeInMainWorld('electronApi', {
  onElectronLog: (callback: (logEvent: LogEvent) => void) => ipcRenderer.on('onElectronLog', (_, logEvent) => callback(logEvent)),
  downloadResource: (url: string, gameId: string, resourceId: string, version: string) => ipcRenderer.send('downloadResource', url, gameId, resourceId, version),
  onDownloadStarted: (callback: (url: string) => void) => ipcRenderer.on('onDownloadStarted', (_, url) => callback(url)),
  onDownloadProgress: (callback: (progress: MyProgress) => void) => ipcRenderer.on('onDownloadProgress', (_, progress) => callback(progress)),
  onDownloadCompleted: (callback: (file: File) => void) => ipcRenderer.on('onDownloadCompleted', (_, file) => callback(file)),
  syncInstallDownloadResource: (installPath: string, gameId: string) => ipcRenderer.invoke('syncInstallDownloadResource', installPath, gameId),
  initDownloadedResources: (gameId: string) => ipcRenderer.invoke('initDownloadedResources', gameId),
  initInstealledResources: (installPath: string) => ipcRenderer.invoke('initInstealledResources', installPath),
  deleteAsset: (gameId: string, resourceId: string, version: string) => ipcRenderer.invoke('deleteAsset', gameId, resourceId, version),
  installAsset: (installPath: string, gameId: string, resourceId: string, version: string) => ipcRenderer.invoke('installAsset', installPath, gameId, resourceId, version),
  uninstallAsset: (installPath: string, resourceId: string, version: string) => ipcRenderer.invoke('uninstallAsset', installPath, resourceId, version),
  getIntallPathBySteamAppWithRelativePath: (steamAppName: string, relativePath: string) => ipcRenderer.invoke('getIntallPathBySteamAppWithRelativePath', steamAppName, relativePath),
  requestDeviceCode: () => ipcRenderer.invoke('requestDeviceCode'),
  requestDeviceTokenInfo: (deviceCode: string) => ipcRenderer.invoke('requestDeviceTokenInfo', deviceCode),
  selectDirectory: (title: string) => ipcRenderer.invoke('selectDirectory', title),
  selectDirectoryAddAsset: (gameId: string, title: string) => ipcRenderer.invoke('selectDirectoryAddAsset', gameId, title),
  selectZipFileAddAsset: (gameId: string, title: string) => ipcRenderer.invoke('selectZipFileAddAsset', gameId, title),
  addAssetByPaths: (gameId: string, paths: string[]) => ipcRenderer.invoke('addAssetByPaths', gameId, paths),
});
