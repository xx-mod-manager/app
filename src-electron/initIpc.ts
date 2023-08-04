import { ipcMain } from 'electron';
import { requestDeviceCode, requestDeviceTokenInfo } from './utils/ApiUtil';
import { addAssetsByPaths, deleteAsset, downloadAndUnzipAsset, formatInstallAndDownloadDir, getDownloadedAssets, getInstealledAssets, installAsset, selectDirectory, selectDirectoryAddAsset, selectZipFileAddAsset, uninstallAsset } from './utils/AssetUtil';
import { getIntallPathBySteamAppWithRelativePath } from './utils/FsUtil';

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
}
