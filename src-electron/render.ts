import { app, ipcMain } from 'electron';

function getUserData(): string {
  return app.getPath('userData');
}

export default function init() {
  ipcMain.handle('getUserData', getUserData);
}
