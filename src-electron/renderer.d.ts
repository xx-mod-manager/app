import { File } from 'electron-dl';
import { MyProgress } from 'src/class/Types';

export interface IElectronAPI {
  downloadResource: (url: string, gameId: string, resourceId: string, version: string) => void,
  onDownloadStarted: (callback: (url: string) => void) => void,
  onDownloadProgress: (callback: (progress: MyProgress) => void) => void,
  onDownloadCompleted: (callback: (file: File) => void) => void,
  initDownloadedResources: (gameId: string) => Promise<Map<string, string[]>>,
  initInstealledResources: () => Promise<Map<string, string[]>>,
  deleteAsset: (gameId: string, resourceId: string, version: string) => Promise<void>,
  installAsset: (gameId: string, resourceId: string, version: string) => Promise<void>,
  uninstallAsset: (resourceId: string, version: string) => Promise<void>,
  getIntallPathBySteamAppWithRelativePath: (steamAppName: string, relativePath: string) => Promise<string | undefined>,
}

declare global {
  interface Window {
    electronApi: IElectronAPI
  }
}
