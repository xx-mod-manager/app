import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronApi', {
  getUserData: () => ipcRenderer.invoke('getUserData')
});
