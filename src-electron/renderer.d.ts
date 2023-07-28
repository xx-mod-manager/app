export interface IElectronAPI {
  getUserData: () => Promise<string>,
}

declare global {
  interface Window {
    electronApi: IElectronAPI
  }
}
