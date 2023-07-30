import { contextBridge, ipcRenderer } from 'electron';
import { File } from 'electron-dl';
import { MyProgress } from 'src/class/Types';

contextBridge.exposeInMainWorld('electronApi', {
  downloadResource: (url: string, gameId: string, resourceId: string, version: string) => ipcRenderer.send('downloadResource', url, gameId, resourceId, version),
  onDownloadStarted: (callback: (url: string) => void) => ipcRenderer.on('onDownloadStarted', (_, url) => callback(url)),
  onDownloadProgress: (callback: (progress: MyProgress) => void) => ipcRenderer.on('onDownloadProgress', (_, progress) => callback(progress)),
  onDownloadCompleted: (callback: (file: File) => void) => ipcRenderer.on('onDownloadCompleted', (_, file) => callback(file)),
  initDownloadedResources: (gameId: string) => ipcRenderer.invoke('initDownloadedResources', gameId),
  initInstealledResources: () => ipcRenderer.invoke('initInstealledResources'),
  deleteAsset: (gameId: string, resourceId: string, version: string) => ipcRenderer.invoke('deleteAsset', gameId, resourceId, version),
  installAsset: (gameId: string, resourceId: string, version: string) => ipcRenderer.invoke('installAsset', gameId, resourceId, version),
  uninstallAsset: (resourceId: string, version: string) => ipcRenderer.invoke('uninstallAsset', resourceId, version),
  getIntallPathBySteamAppWithRelativePath: (steamAppName: string, relativePath: string) => ipcRenderer.invoke('getIntallPathBySteamAppWithRelativePath', steamAppName, relativePath),
});
