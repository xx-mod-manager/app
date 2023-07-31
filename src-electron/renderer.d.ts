import { File } from 'electron-dl';
import { MyProgress } from 'src/class/Types';

export interface IElectronAPI {
  downloadResource: (url: string, gameId: string, resourceId: string, version: string) => void,
  onDownloadStarted: (callback: (url: string) => void) => void,
  onDownloadProgress: (callback: (progress: MyProgress) => void) => void,
  onDownloadCompleted: (callback: (file: File) => void) => void,
  syncInstallDownloadResource: (installPath: string, gameId: string) => Promise<Map<string, string[]>>,
  initDownloadedResources: (gameId: string) => Promise<Map<string, string[]>>,
  initInstealledResources: (installPath: string) => Promise<Map<string, string[]>>,
  deleteAsset: (gameId: string, resourceId: string, version: string) => Promise<void>,
  installAsset: (installPath: string, gameId: string, resourceId: string, version: string) => Promise<void>,
  uninstallAsset: (installPath: string, resourceId: string, version: string) => Promise<void>,
  getIntallPathBySteamAppWithRelativePath: (steamAppName: string, relativePath: string) => Promise<string | undefined>,
}

declare global {
  interface Window {
    electronApi: IElectronAPI
  }
}
