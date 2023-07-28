import { contextBridge, ipcRenderer } from 'electron';
import { File } from 'electron-dl';
import { MyProgress } from 'src/class/Types';

contextBridge.exposeInMainWorld('electronApi', {
  getUserData: () => ipcRenderer.invoke('getUserData'),
  downloadAsset: (url: string, assetId: string, version: string) => ipcRenderer.send('downloadAsset', url, assetId, version),
  onDownloadStarted: (callback: (url: string) => void) => ipcRenderer.on('onDownloadStarted', (_, url) => callback(url)),
  onDownloadProgress: (callback: (progress: MyProgress) => void) => ipcRenderer.on('onDownloadProgress', (_, progress) => callback(progress)),
  onDownloadCompleted: (callback: (file: File) => void) => ipcRenderer.on('onDownloadCompleted', (_, file) => callback(file)),
  initAssetManager: () => ipcRenderer.invoke('initAssetManager'),
  deleteAssetVersion: (assetId: string, version: string) => ipcRenderer.invoke('deleteAssetVersion', assetId, version)
});
