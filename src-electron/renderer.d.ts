import { File } from 'electron-dl';
import { MyProgress } from 'src/class/Types';

export interface IElectronAPI {
  getUserData: () => Promise<string>,
  downloadAsset: (url: string, assetId: string, version: string) => void,
  onDownloadStarted: (callback: (url: string) => void) => void,
  onDownloadProgress: (callback: (progress: MyProgress) => void) => void,
  onDownloadCompleted: (callback: (file: File) => void) => void,
  initAssetManager: () => Promise<Map<string, string[]>>,
  initInstealledAssets: () => Promise<Map<string, string[]>>,
  deleteAssetVersion: (assetId: string, version: string) => Promise<void>,
  installAssetVersion: (assetId: string, version: string) => Promise<void>,
  uninstallAssetVersion: (assetId: string, version: string) => Promise<void>,
}

declare global {
  interface Window {
    electronApi: IElectronAPI
  }
}
