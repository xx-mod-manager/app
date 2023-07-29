import AdmZip from 'adm-zip';
import { BrowserWindow, DownloadItem, app, ipcMain } from 'electron';
import { File, Progress, download } from 'electron-dl';
import { existsSync, promises as fsPromises } from 'fs';
import { join as pathJoin } from 'path';
import { myLogger } from 'src/boot/logger';
import { parseAssetDir } from 'src/utils/StringUtils';

const PATH_RESOURCE = 'resource';
const TEMP_CSTI = 'Card Survival Tropical Island';//TODO remove

function getGamePath(gameId: string): string {
  return pathJoin(app.getPath('userData'), gameId);
}

function getResourcePath(gameId: string): string {
  return pathJoin(getGamePath(gameId), PATH_RESOURCE);
}

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
    win?.webContents.send('onDownloadCompleted', file);
    unzip(file.path, gameId, resourceId, version);
  }
}

function unzip(zipPath: string, gameId: string, resourceId: string, version: string) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  const nestedPath = getNestedPath(entries);
  entries.forEach((entry) => {
    if (!entry.isDirectory) {
      const targetPath = getTargetPath(resourceId + '-' + version, nestedPath, entry);
      zip.extractEntryTo(entry.entryName, targetPath, false, true);
    }
  });

  function getTargetPath(resourceName: string, nestedPath: string | undefined, entry: AdmZip.IZipEntry) {
    const assetsPath = getResourcePath(gameId);
    const entryName = nestedPath == undefined ? entry.entryName : entry.entryName.replace(nestedPath, '');
    const paths = entryName.split('/');
    paths.splice(paths.length - 1, 1);
    return pathJoin(assetsPath, resourceName, ...paths);
  }


  function getNestedPath(entries: AdmZip.IZipEntry[]): string | undefined {
    const result = entries[0];
    if (result.isDirectory) {
      for (const entry of entries) {
        if (!entry.entryName.startsWith(result.entryName))
          return undefined;
      }
      return result.entryName;
    } else {
      return undefined;
    }
  }
}

async function initResourceManage(gameId: string): Promise<Map<string, string[]>> {
  await syncInstallTodownloadResource(gameId);
  const resourcesPath = getResourcePath(gameId);
  if (existsSync(resourcesPath)) {
    const assetsStat = await fsPromises.stat(resourcesPath);
    if (!assetsStat.isDirectory()) {
      await fsPromises.unlink(resourcesPath);
      await fsPromises.mkdir(resourcesPath);
      myLogger.warn('assets path is not dir.');
      return new Map;
    }
    const result = new Map<string, string[]>();
    const assetFiles = await fsPromises.readdir(resourcesPath);
    myLogger.debug(`assets count is ${assetFiles.length}`);
    const promises = assetFiles.map(async (assetFile) => {
      const assetFilePath = pathJoin(resourcesPath, assetFile);
      const assetFileStat = await fsPromises.stat(assetFilePath);
      if (assetFileStat.isDirectory()) {
        const { assetId, version } = parseAssetDir(assetFile);
        myLogger.debug(`downloaded assets: ${assetId}/${version}`);
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
  } else {
    await fsPromises.mkdir(resourcesPath, { recursive: true });
    myLogger.debug('new assets path dir.');
    return new Map;
  }

  async function syncInstallTodownloadResource(gameId: string) {
    const installPath = getDefaultPath();
    if (installPath == undefined) throw Error('miss install path');
    const resourcesPath = getResourcePath(gameId);
    const installedAssets = await fsPromises.readdir(installPath);
    Promise.all(installedAssets.map(async (assetName) => {
      const installedAssetPath = pathJoin(installPath, assetName);
      const installedAssetStat = await fsPromises.stat(installedAssetPath);
      if (installedAssetStat.isDirectory() && !installedAssetStat.isSymbolicLink()) {
        const { assetId, version } = parseAssetDir(assetName);
        const newAssetName = assetId + '-' + version;
        myLogger.debug(`need sync asset ${assetName} to ${newAssetName}`);
        const downloadedAssetPath = pathJoin(resourcesPath, newAssetName);
        fsPromises.rename(installedAssetPath, downloadedAssetPath);
        fsPromises.symlink(downloadedAssetPath, pathJoin(installPath, newAssetName));
      }
    }));
  }
}

async function initInstealledResources(): Promise<Map<string, string[]>> {
  const installPath = getDefaultPath();
  if (installPath == undefined) throw Error('miss install path');
  const result = new Map<string, string[]>();
  const assetFiles = await fsPromises.readdir(installPath);
  myLogger.debug(`installed assets count is ${assetFiles.length}`);
  const promises = assetFiles.map(async (assetFile) => {
    const assetFilePath = pathJoin(installPath, assetFile);
    const assetFileStat = await fsPromises.stat(assetFilePath);
    if (assetFileStat.isDirectory()) {
      const { assetId, version } = parseAssetDir(assetFile);
      myLogger.debug(`installed assets: ${assetId}/${version}`);
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
  const resourcesPath = pathJoin(getResourcePath(gameId), resourceId + '-' + version);
  await fsPromises.rmdir(resourcesPath, { recursive: true });
}

async function installAsset(gameId: string, resourceId: string, version: string) {
  const installPath = getDefaultPath();
  if (installPath == undefined) throw Error('miss install path');
  const resourcesPath = pathJoin(getResourcePath(gameId), resourceId + '-' + version);
  const installAssetPath = pathJoin(installPath, resourceId + '-' + version);
  await fsPromises.symlink(resourcesPath, installAssetPath);
}

async function uninstallAsset(resourceId: string, version: string) {
  const installPath = getDefaultPath();
  if (installPath == undefined) throw Error('miss install path');
  const assetPath = pathJoin(installPath, resourceId + '-' + version);
  await fsPromises.rmdir(assetPath, { recursive: true });
}

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
  ipcMain.handle('initResourceManage', (_, gameId: string) => initResourceManage(gameId));
  ipcMain.handle('initInstealledResources', initInstealledResources);
  ipcMain.handle('deleteAsset', (_, gameId: string, resourceId: string, version: string) => deleteAsset(gameId, resourceId, version));
  ipcMain.handle('installAsset', (_, gameId: string, resourceId: string, version: string) => installAsset(gameId, resourceId, version));
  ipcMain.handle('uninstallAsset', (_, resourceId: string, version: string) => uninstallAsset(resourceId, version));
}
