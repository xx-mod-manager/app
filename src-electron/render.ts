import axios from 'axios';
import { BrowserWindow, DownloadItem, app, dialog, ipcMain } from 'electron';
import { File, Progress, download } from 'electron-dl';
import { existsSync, promises as fsPromises } from 'fs';
import { basename, extname, join as pathJoin } from 'path';
import { CLIENT_ID } from 'src/Constants';
import { myLogger } from 'src/boot/logger';
import { GithubDeviceCodeInfo, GithubTokenInfo } from 'src/class/GithubTokenInfo';
import { notNull } from 'src/utils/CommentUtils';
import { parseResourceAndVersion } from 'src/utils/StringUtils';
import { getDefaultSteamAppPath, getGameResourcesPath, initResourcesDir } from './utils/FsUtil';
import { unzipAsset } from './utils/ZipUtil';

function downloadResource(url: string, gameId: string, resourceId: string, assetId: string) {
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
    unzipAsset(file.path, getGameResourcesPath(gameId), resourceId, assetId);
    win?.webContents.send('onDownloadCompleted', file);
  }
}

async function syncInstallDownloadResource(installPath: string, gameId: string) {
  const resourcesPath = getGameResourcesPath(gameId);
  await initResourcesDir(resourcesPath);
  if (installPath == undefined) throw Error('Miss install path.');
  const installedAssets = await fsPromises.readdir(installPath);
  Promise.all(installedAssets.map(async (resourceName) => {
    const installedAssetPath = pathJoin(installPath, resourceName);
    const installedAssetStat = await fsPromises.stat(installedAssetPath);
    if (installedAssetStat.isDirectory() && !installedAssetStat.isSymbolicLink()) {
      const { resource, assetId } = parseResourceAndVersion(resourceName);
      const newResourceName = resource + '-' + assetId;
      myLogger.debug(`Need sync resource ${resourceName} to ${newResourceName}`);
      const downloadedAssetPath = pathJoin(resourcesPath, newResourceName);
      fsPromises.rename(installedAssetPath, downloadedAssetPath);
      fsPromises.symlink(downloadedAssetPath, pathJoin(installPath, newResourceName), 'dir');
    }
  }));
}

async function initDownloadedResources(gameId: string): Promise<Map<string, string[]>> {
  const resourcesPath = getGameResourcesPath(gameId);
  await initResourcesDir(resourcesPath);
  const result = new Map<string, string[]>();
  const assetFiles = await fsPromises.readdir(resourcesPath);
  myLogger.debug(`Downloaded resource count is ${assetFiles.length}`);
  const promises = assetFiles.map(async (assetFile) => {
    const assetFilePath = pathJoin(resourcesPath, assetFile);
    const assetFileStat = await fsPromises.stat(assetFilePath);
    if (assetFileStat.isDirectory()) {
      const { resource, assetId } = parseResourceAndVersion(assetFile);
      myLogger.debug(`Downloaded resource: ${resource}/${assetId}`);
      let versions = result.get(resource);
      if (versions == undefined) {
        versions = [];
        result.set(resource, versions);
      }
      versions.push(assetId);
    }
  });
  await Promise.all(promises);
  return result;
}

async function initInstealledResources(installPath: string): Promise<Map<string, string[]>> {
  if (installPath == undefined) throw Error('Miss install path.');
  const result = new Map<string, string[]>();
  const assetFiles = await fsPromises.readdir(installPath);
  myLogger.debug(`Installed resource count is ${assetFiles.length}`);
  const promises = assetFiles.map(async (assetFile) => {
    const assetFilePath = pathJoin(installPath, assetFile);
    const assetFileStat = await fsPromises.stat(assetFilePath);
    if (assetFileStat.isDirectory()) {
      const { resource, assetId } = parseResourceAndVersion(assetFile);
      myLogger.debug(`Installed resource: ${resource}/${assetId}`);
      let versions = result.get(resource);
      if (versions == undefined) {
        versions = [];
        result.set(resource, versions);
      }
      versions.push(assetId);
    }
  });
  await Promise.all(promises);
  return result;
}

async function deleteAsset(gameId: string, resourceId: string, assetId: string) {
  const resourcesPath = pathJoin(getGameResourcesPath(gameId), resourceId + '-' + assetId);
  await fsPromises.rm(resourcesPath, { recursive: true });
}

async function installAsset(installPath: string, gameId: string, resourceId: string, assetId: string) {
  if (installPath == undefined) throw Error('Miss install path');
  const resourcesPath = pathJoin(getGameResourcesPath(gameId), resourceId + '-' + assetId);
  const installAssetPath = pathJoin(installPath, resourceId + '-' + assetId);
  await fsPromises.symlink(resourcesPath, installAssetPath, 'dir');
}

async function uninstallAsset(installPath: string, resourceId: string, assetId: string) {
  if (installPath == undefined) throw Error('Miss install path');
  const assetPath = pathJoin(installPath, resourceId + '-' + assetId);
  await fsPromises.rm(assetPath, { recursive: true });
}

function getIntallPathBySteamAppWithRelativePath(steamAppName: string, relativePath: string) {
  myLogger.debug(`getIntallPathBySteamAppWithRelativePath steamAppName: ${steamAppName}, relativePath: ${relativePath}.`);
  const appPath = getDefaultSteamAppPath(steamAppName);
  if (appPath == undefined) return undefined;
  const installPath = pathJoin(appPath, relativePath);
  if (existsSync(installPath)) return installPath;
  else return undefined;
}

async function requestDeviceCode(): Promise<GithubDeviceCodeInfo> {
  const response = await axios.post(`https://github.com/login/device/code?client_id=${CLIENT_ID}`);
  const data = new URLSearchParams(response.data);
  return {
    device_code: notNull(data.get('device_code')),
    user_code: notNull(data.get('user_code')),
    verification_uri: notNull(data.get('verification_uri')),
    expires_in: parseInt(notNull(data.get('expires_in'))),
    interval: parseInt(notNull(data.get('interval'))),
  };
}

async function requestDeviceTokenInfo(code: string): Promise<GithubTokenInfo> {
  const response = await axios.post(`https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=${code}`);
  const data = new URLSearchParams(response.data);
  return {
    access_token: notNull(data.get('access_token')),
    expires_in: parseInt(notNull(data.get('expires_in'))),
    refresh_token: notNull(data.get('refresh_token')),
    refresh_token_expires_in: parseInt(notNull(data.get('refresh_token_expires_in')))
  };
}

async function selectDirectory(title: string): Promise<Electron.OpenDialogReturnValue> {
  return await dialog.showOpenDialog({ title, properties: ['openDirectory'] });
}

async function addAssetByDir(gameId: string, dirPath: string): Promise<{ resource: string; assetId: string; }> {
  const name = basename(dirPath);
  const assetInfo = parseResourceAndVersion(name);
  await fsPromises.cp(dirPath, pathJoin(getGameResourcesPath(gameId), assetInfo.resource + '-' + assetInfo.assetId), { recursive: true, force: true });
  return assetInfo;
}

async function selectDirectoryAddAsset(gameId: string, title: string): Promise<{ resource: string; assetId: string; } | undefined> {
  const result = await dialog.showOpenDialog({ title, properties: ['openDirectory'] });
  if (result.filePaths.length > 0) {
    const dirPath = result.filePaths[0];
    return await addAssetByDir(gameId, dirPath);
  } else {
    return undefined;
  }
}

async function addAssetByZipFile(gameId: string, zipPath: string): Promise<{ resource: string; assetId: string; }> {
  const name = basename(zipPath);
  const assetInfo = parseResourceAndVersion(name);
  unzipAsset(zipPath, getGameResourcesPath(gameId), assetInfo.resource, assetInfo.assetId);
  return assetInfo;
}

async function selectZipFileAddAsset(gameId: string, title: string): Promise<{ resource: string; assetId: string; } | undefined> {
  const result = await dialog.showOpenDialog({
    title, properties: ['openFile'], filters: [
      { name: 'Zip', extensions: ['zip'] }
    ]
  });
  if (result.filePaths.length > 0) {
    const zipPath = result.filePaths[0];
    return await addAssetByZipFile(gameId, zipPath);
  } else {
    return undefined;
  }
}

async function addAssetByPaths(gameId: string, paths: string[]): Promise<{ resource: string; assetId: string; }[]> {
  const result = await Promise.all(paths.map(async path => {
    if (existsSync(path)) {
      const stat = await fsPromises.stat(path);
      if (stat.isFile()) {
        const ext = extname(path).toLowerCase();
        if ('.zip' === ext) {
          return await addAssetByZipFile(gameId, path);
        } else {
          myLogger.warn(`${path} extname ${ext} not is .zip`);
        }
      } else if (stat.isDirectory()) {
        return await addAssetByDir(gameId, path);
      } else {
        myLogger.warn(`${path} not is file or directory.`);
      }
    } else {
      myLogger.warn(`${path} not exist.`);
    }
  }));
  const notNullResult: { resource: string; assetId: string; }[] = [];
  result.forEach(i => { if (i !== undefined) notNullResult.push(i); });
  return notNullResult;
}

export default function init() {
  ipcMain.on('downloadResource', (_, url: string, gameId: string, resourceId: string, assetId: string) => downloadResource(url, gameId, resourceId, assetId));
  ipcMain.handle('syncInstallDownloadResource', (_, installPath: string, gameId: string) => syncInstallDownloadResource(installPath, gameId));
  ipcMain.handle('initDownloadedResources', (_, gameId: string) => initDownloadedResources(gameId));
  ipcMain.handle('initInstealledResources', (_, installPath: string) => initInstealledResources(installPath));
  ipcMain.handle('deleteAsset', (_, gameId: string, resourceId: string, assetId: string) => deleteAsset(gameId, resourceId, assetId));
  ipcMain.handle('installAsset', (_, installPath: string, gameId: string, resourceId: string, assetId: string) => installAsset(installPath, gameId, resourceId, assetId));
  ipcMain.handle('uninstallAsset', (_, installPath: string, resourceId: string, assetId: string) => uninstallAsset(installPath, resourceId, assetId));
  ipcMain.handle('getIntallPathBySteamAppWithRelativePath', (_, steamAppName: string, relativePath: string) => getIntallPathBySteamAppWithRelativePath(steamAppName, relativePath));
  ipcMain.handle('requestDeviceCode', requestDeviceCode);
  ipcMain.handle('requestDeviceTokenInfo', (_, deviceCode: string) => requestDeviceTokenInfo(deviceCode));
  ipcMain.handle('selectDirectory', (_, title: string) => selectDirectory(title));
  ipcMain.handle('selectDirectoryAddAsset', (_, gameId: string, title: string) => selectDirectoryAddAsset(gameId, title));
  ipcMain.handle('selectZipFileAddAsset', (_, gameId: string, title: string) => selectZipFileAddAsset(gameId, title));
  ipcMain.handle('addAssetByPaths', (_, gameId: string, paths: string[]) => addAssetByPaths(gameId, paths));
}
