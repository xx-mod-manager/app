import { app, dialog, ipcMain, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { APP_GET_PATH, DIALOG_SHOW_OPEN_DIALOG, FS_CP, FS_EXIST, FS_LSTATE, FS_MKDIR, FS_READDIR, FS_RENAME, FS_RM, FS_STATE, FS_SYMLINK, FS_UNZIP_ASSET, PATH_EXTNAME, PATH_GET_BASENAME, PATH_JOIN, SHELL_OPEN_PATH, SHELL_SHOW_ITEM_IN_FOLDER } from './electron-constant';
import { requestDeviceCode, requestDeviceTokenInfo } from './utils/ApiUtil';
import { downloadAndUnzipAsset } from './utils/AssetUtil';
import { getLstate, getState } from './utils/FsUtil';
import { unzipAsset } from './utils/ZipUtil';

export default function initIpc() {
  ipcMain.on('downloadAndUnzipAsset', (_, url: string, gameId: string, resourceId: string, assetId: string) => downloadAndUnzipAsset(url, gameId, resourceId, assetId));

  ipcMain.handle('requestDeviceCode', requestDeviceCode);
  ipcMain.handle('requestDeviceTokenInfo', (_, deviceCode: string) => requestDeviceTokenInfo(deviceCode));



  ipcMain.handle(DIALOG_SHOW_OPEN_DIALOG, (_, options) => dialog.showOpenDialog(options));

  ipcMain.handle(APP_GET_PATH, (_, name) => app.getPath(name));

  ipcMain.handle(SHELL_SHOW_ITEM_IN_FOLDER, (_, fullPath) => shell.showItemInFolder(fullPath));
  ipcMain.handle(SHELL_OPEN_PATH, (_, fullPath) => shell.openPath(fullPath));

  ipcMain.handle(PATH_GET_BASENAME, (_, fullpath, suffix) => path.basename(fullpath, suffix));
  ipcMain.handle(PATH_JOIN, (_, ...paths) => path.join(...paths));
  ipcMain.handle(PATH_EXTNAME, (_, fullPath) => path.extname(fullPath));

  ipcMain.handle(FS_EXIST, (_, path) => fs.existsSync(path));
  ipcMain.handle(FS_CP, (_, source, destination, options) => fs.promises.cp(source, destination, options));
  ipcMain.handle(FS_RENAME, (_, oldPath, newPath) => fs.promises.rename(oldPath, newPath));
  ipcMain.handle(FS_RM, (_, path, options) => fs.promises.rm(path, options));
  ipcMain.handle(FS_UNZIP_ASSET, (_, zipPath, targetPath) => unzipAsset(zipPath, targetPath));
  ipcMain.handle(FS_STATE, (_, path, opts) => getState(path, opts));
  ipcMain.handle(FS_LSTATE, (_, path, opts) => getLstate(path, opts));
  ipcMain.handle(FS_SYMLINK, (_, target, path, type) => fs.promises.symlink(target, path, type));
  ipcMain.handle(FS_READDIR, (_, path, opts) => fs.promises.readdir(path, opts));
  ipcMain.handle(FS_MKDIR, (_, path, opts) => fs.promises.mkdir(path, opts));
}
