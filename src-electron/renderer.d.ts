import { File } from 'electron-dl';
import { MyProgress } from 'src/class/Types';

export interface IElectronAPI {
  getUserData: () => Promise<string>,
  downloadAsset: (url: string, assetId: string, version: string) => void,
  onDownloadStarted: (callback: (url: string) => void) => void,
  onDownloadProgress: (callback: (progress: MyProgress) => void) => void,
  onDownloadCompleted: (callback: (file: File) => void) => void,
  initAssetManager: () => Promise<Map<string, string[]>>,
}

declare global {
  interface Window {
    electronApi: IElectronAPI
  }
}
