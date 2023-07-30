import { BrowserWindow, DownloadItem, app, ipcMain } from 'electron';
import { File, Progress, download } from 'electron-dl';
import { existsSync, promises as fsPromises } from 'fs';
import { join as pathJoin } from 'path';
import { myLogger } from 'src/boot/logger';
import { parseAssetDir } from 'src/utils/StringUtils';
import { getDefaultSteamAppPath, getGameResourcesPath, syncInstallDownloadResource } from './utils/FsUtil';
import { unzipAsset } from './utils/ZipUtil';

const TEMP_CSTI = 'Card Survival Tropical Island';//TODO remove

function downloadResource(url: string, gameId: string, resourceId: string, version: string) {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) throw Error('Miss Focused Window');
  download(win, url, { overwrite: true, directory: app.getPath('temp'), onStarted, onProgress, onCompleted });

  function onStarted(downloadItem: DownloadItem) {
    win?.webContents.send('onDownloadStarted', downloadItem.getURL());
  }

  function onProgress(progress: Progress) {
    win?.webContents.send('onDownloadProgress', { ...progress, url });
  }

  function onCompleted(file: File) {
    unzipAsset(file.path, getGameResourcesPath(gameId), resourceId, version);
    win?.webContents.send('onDownloadCompleted', file);
  }
}

async function initDownloadedResources(gameId: string): Promise<Map<string, string[]>> {
  const resourcesPath = getGameResourcesPath(gameId);
  await syncInstallDownloadResource(getDefaultPath() ?? '', resourcesPath);
  const result = new Map<string, string[]>();
  const assetFiles = await fsPromises.readdir(resourcesPath);
  myLogger.debug(`Downloaded resource count is ${assetFiles.length}`);
  const promises = assetFiles.map(async (assetFile) => {
    const assetFilePath = pathJoin(resourcesPath, assetFile);
    const assetFileStat = await fsPromises.stat(assetFilePath);
    if (assetFileStat.isDirectory()) {
      const { assetId, version } = parseAssetDir(assetFile);
      myLogger.debug(`Downloaded resource: ${assetId}/${version}`);
      let versions = result.get(assetId);
      if (versions == undefined) {
        versions = [];
        result.set(assetId, versions);
      }
      versions.push(version);
    }
  });
  await Promise.all(promises);
  return result;
}

async function initInstealledResources(): Promise<Map<string, string[]>> {
  const installPath = getDefaultPath();
  if (installPath == undefined) throw Error('Miss install path.');
  const result = new Map<string, string[]>();
  const assetFiles = await fsPromises.readdir(installPath);
  myLogger.debug(`Installed resource count is ${assetFiles.length}`);
  const promises = assetFiles.map(async (assetFile) => {
    const assetFilePath = pathJoin(installPath, assetFile);
    const assetFileStat = await fsPromises.stat(assetFilePath);
    if (assetFileStat.isDirectory()) {
      const { assetId, version } = parseAssetDir(assetFile);
      myLogger.debug(`Installed resource: ${assetId}/${version}`);
      let versions = result.get(assetId);
      if (versions == undefined) {
        versions = [];
        result.set(assetId, versions);
      }
      versions.push(version);
    }
  });
  await Promise.all(promises);
  return result;
}

async function deleteAsset(gameId: string, resourceId: string, version: string) {
  const resourcesPath = pathJoin(getGameResourcesPath(gameId), resourceId + '-' + version);
  await fsPromises.rmdir(resourcesPath, { recursive: true });
}

async function installAsset(gameId: string, resourceId: string, version: string) {
  const installPath = getDefaultPath();
  if (installPath == undefined) throw Error('Miss install path');
  const resourcesPath = pathJoin(getGameResourcesPath(gameId), resourceId + '-' + version);
  const installAssetPath = pathJoin(installPath, resourceId + '-' + version);
  await fsPromises.symlink(resourcesPath, installAssetPath);
}

async function uninstallAsset(resourceId: string, version: string) {
  const installPath = getDefaultPath();
  if (installPath == undefined) throw Error('Miss install path');
  const assetPath = pathJoin(installPath, resourceId + '-' + version);
  await fsPromises.rmdir(assetPath, { recursive: true });
}

function getIntallPathBySteamAppWithRelativePath(steamAppName: string, relativePath: string) {
  myLogger.debug(`getIntallPathBySteamAppWithRelativePath steamAppName: ${steamAppName}, relativePath: ${relativePath}.`);
  const appPath = getDefaultSteamAppPath(steamAppName);
  if (appPath == undefined) return undefined;
  const installPath = pathJoin(appPath, relativePath);
  if (existsSync(installPath)) return installPath;
  else return undefined;
}

//TODO remove
function getDefaultPath(): string | undefined {
  const homePath = app.getPath('home');
  const modInstallPath = pathJoin(homePath, '.local/share/Steam/steamapps/common', TEMP_CSTI, 'BepInEx/plugins');
  if (existsSync(modInstallPath)) {
    return modInstallPath;
  }
  return undefined;
}

export default function init() {
  ipcMain.on('downloadResource', (_, url: string, gameId: string, resourceId: string, version: string) => downloadResource(url, gameId, resourceId, version));
  ipcMain.handle('initDownloadedResources', (_, gameId: string) => initDownloadedResources(gameId));
  ipcMain.handle('initInstealledResources', initInstealledResources);
  ipcMain.handle('deleteAsset', (_, gameId: string, resourceId: string, version: string) => deleteAsset(gameId, resourceId, version));
  ipcMain.handle('installAsset', (_, gameId: string, resourceId: string, version: string) => installAsset(gameId, resourceId, version));
  ipcMain.handle('uninstallAsset', (_, resourceId: string, version: string) => uninstallAsset(resourceId, version));
  ipcMain.handle('getIntallPathBySteamAppWithRelativePath', (_, steamAppName: string, relativePath: string) => getIntallPathBySteamAppWithRelativePath(steamAppName, relativePath));
}
