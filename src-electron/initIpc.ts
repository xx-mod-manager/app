import { app, dialog, ipcMain, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { APP_GET_PATH, DIALOG_SHOW_OPEN_DIALOG, FS_CP, FS_EXIST, FS_RENAME, FS_RM, FS_STATE, FS_UNZIP_ASSET, PATH_EXTNAME, PATH_GET_BASENAME, PATH_JOIN, SHELL_SHOW_ITEM_IN_FOLDER } from './electron-constant';
import { requestDeviceCode, requestDeviceTokenInfo } from './utils/ApiUtil';
import { addAssetsByPaths, deleteAsset, downloadAndUnzipAsset, formatInstallAndDownloadDir, getDownloadedAssets, getInstealledAssets, installAsset, selectDirectory, selectDirectoryAddAsset, selectZipFileAddAsset, uninstallAsset } from './utils/AssetUtil';
import { getIntallPathBySteamAppWithRelativePath, getPathInfoByPath, getState, openDialogSelectDirectory, openDialogSelectZipFile } from './utils/FsUtil';
import { unzipAsset } from './utils/ZipUtil';

export default function initIpc() {
  ipcMain.on('downloadAndUnzipAsset', (_, url: string, gameId: string, resourceId: string, assetId: string) => downloadAndUnzipAsset(url, gameId, resourceId, assetId));
  ipcMain.handle('formatInstallAndDownloadDir', (_, installPath: string, gameId: string) => formatInstallAndDownloadDir(installPath, gameId));
  ipcMain.handle('getDownloadedAssets', (_, gameId: string) => getDownloadedAssets(gameId));
  ipcMain.handle('getInstealledAssets', (_, installPath: string) => getInstealledAssets(installPath));
  ipcMain.handle('deleteAsset', (_, gameId: string, resourceId: string, assetId: string) => deleteAsset(gameId, resourceId, assetId));
  ipcMain.handle('installAsset', (_, installPath: string, gameId: string, resourceId: string, assetId: string) => installAsset(installPath, gameId, resourceId, assetId));
  ipcMain.handle('uninstallAsset', (_, installPath: string, resourceId: string, assetId: string) => uninstallAsset(installPath, resourceId, assetId));
  ipcMain.handle('selectDirectory', (_, title: string) => selectDirectory(title));
  ipcMain.handle('selectDirectoryAddAsset', (_, gameId: string, title: string) => selectDirectoryAddAsset(gameId, title));
  ipcMain.handle('selectZipFileAddAsset', (_, gameId: string, title: string) => selectZipFileAddAsset(gameId, title));
  ipcMain.handle('addAssetsByPaths', (_, gameId: string, paths: string[]) => addAssetsByPaths(gameId, paths));

  ipcMain.handle('requestDeviceCode', requestDeviceCode);
  ipcMain.handle('requestDeviceTokenInfo', (_, deviceCode: string) => requestDeviceTokenInfo(deviceCode));

  ipcMain.handle('getIntallPathBySteamAppWithRelativePath', (_, steamAppName: string, relativePath: string) => getIntallPathBySteamAppWithRelativePath(steamAppName, relativePath));
  ipcMain.handle('openDialogSelectDirectory', (_, title: string) => openDialogSelectDirectory(title));
  ipcMain.handle('openDialogSelectZipFile', (_, title: string) => openDialogSelectZipFile(title));
  ipcMain.handle('getPathInfoByPath', (_, path: string) => getPathInfoByPath(path));



  ipcMain.handle(DIALOG_SHOW_OPEN_DIALOG, (_, options) => dialog.showOpenDialog(options));

  ipcMain.handle(APP_GET_PATH, (_, name) => app.getPath(name));

  ipcMain.handle(SHELL_SHOW_ITEM_IN_FOLDER, (_, fullPath) => shell.showItemInFolder(fullPath));

  ipcMain.handle(PATH_GET_BASENAME, (_, fullpath, suffix) => path.basename(fullpath, suffix));
  ipcMain.handle(PATH_JOIN, (_, ...paths) => path.join(...paths));
  ipcMain.handle(PATH_EXTNAME, (_, fullPath) => path.extname(fullPath));

  ipcMain.handle(FS_EXIST, (_, path) => fs.existsSync(path));
  ipcMain.handle(FS_CP, (_, source, destination, options) => fs.promises.cp(source, destination, options));
  ipcMain.handle(FS_RENAME, (_, oldPath, newPath) => fs.promises.rename(oldPath, newPath));
  ipcMain.handle(FS_RM, (_, path, options) => fs.promises.rm(path, options));
  ipcMain.handle(FS_UNZIP_ASSET, (_, zipPath, targetPath) => unzipAsset(zipPath, targetPath));
  ipcMain.handle(FS_STATE, (_, path, opts) => getState(path, opts));
}
