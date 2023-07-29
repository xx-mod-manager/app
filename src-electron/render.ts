import AdmZip from 'adm-zip';
import { BrowserWindow, DownloadItem, app, ipcMain } from 'electron';
import { File, Progress, download } from 'electron-dl';
import { existsSync, promises as fsPromises } from 'fs';
import { join as pathJoin } from 'path';
import { myLogger } from 'src/boot/logger';
import { parseAssetDir } from 'src/utils/StringUtils';

const PATH_ASSETS = 'assets';
const TEMP_CSTI = 'Card Survival Tropical Island';

function getUserData(): string {
  return app.getPath('userData');
}

function downloadAsset(url: string, assetId: string, version: string) {
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
    unzip(file.path, assetId, version);
  }
}

function unzip(zipPath: string, assetId: string, version: string) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  const nestedPath = getNestedPath(entries);
  entries.forEach((entry) => {
    if (!entry.isDirectory) {
      const targetPath = getTargetPath(assetId + '-' + version, nestedPath, entry);
      zip.extractEntryTo(entry.entryName, targetPath, false, true);
    }
  });

  function getTargetPath(assetPath: string, nestedPath: string | undefined, entry: AdmZip.IZipEntry) {
    const assetsPath = pathJoin(getUserData(), PATH_ASSETS);
    const entryName = nestedPath == undefined ? entry.entryName : entry.entryName.replace(nestedPath, '');
    const paths = entryName.split('/');
    paths.splice(paths.length - 1, 1);
    return pathJoin(assetsPath, assetPath, ...paths);
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

async function initAssetManager(): Promise<Map<string, string[]>> {
  await syncInstallToDownloadAsset();
  const assetsPath = pathJoin(getUserData(), PATH_ASSETS);
  if (existsSync(assetsPath)) {
    const assetsStat = await fsPromises.stat(assetsPath);
    if (!assetsStat.isDirectory()) {
      await fsPromises.unlink(assetsPath);
      await fsPromises.mkdir(assetsPath);
      myLogger.warn('assets path is not dir.');
      return new Map;
    }
    const result = new Map<string, string[]>();
    const assetFiles = await fsPromises.readdir(assetsPath);
    myLogger.debug(`assets count is ${assetFiles.length}`);
    const promises = assetFiles.map(async (assetFile) => {
      const assetFilePath = pathJoin(assetsPath, assetFile);
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
    await fsPromises.mkdir(assetsPath);
    myLogger.debug('new assets path dir.');
    return new Map;
  }

  async function syncInstallToDownloadAsset() {
    const installPath = getDefaultPath();
    if (installPath == undefined) throw Error('miss install path');
    const assetsPath = pathJoin(getUserData(), PATH_ASSETS);
    const installedAssets = await fsPromises.readdir(installPath);
    Promise.all(installedAssets.map(async (assetName) => {
      const installedAssetPath = pathJoin(installPath, assetName);
      const installedAssetStat = await fsPromises.stat(installedAssetPath);
      if (installedAssetStat.isDirectory() && !installedAssetStat.isSymbolicLink()) {
        const { assetId, version } = parseAssetDir(assetName);
        const newAssetName = assetId + '-' + version;
        myLogger.debug(`need sync asset ${assetName} to ${newAssetName}`);
        const downloadedAssetPath = pathJoin(assetsPath, newAssetName);
        fsPromises.rename(installedAssetPath, downloadedAssetPath);
        fsPromises.symlink(downloadedAssetPath, pathJoin(installPath, newAssetName));
      }
    }));
  }
}

async function initInstealledAssets(): Promise<Map<string, string[]>> {
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

async function deleteAssetVersion(assetId: string, version: string) {
  const assetPath = pathJoin(getUserData(), PATH_ASSETS, assetId + '-' + version);
  await fsPromises.rmdir(assetPath, { recursive: true });
}

async function installAssetVersion(assetId: string, version: string) {
  const installPath = getDefaultPath();
  if (installPath == undefined) throw Error('miss install path');
  const assetPath = pathJoin(getUserData(), PATH_ASSETS, assetId + '-' + version);
  const installAssetPath = pathJoin(installPath, assetId + '-' + version);
  await fsPromises.symlink(assetPath, installAssetPath);
}

async function uninstallAssetVersion(assetId: string, version: string) {
  const installPath = getDefaultPath();
  if (installPath == undefined) throw Error('miss install path');
  const assetPath = pathJoin(installPath, assetId + '-' + version);
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
  ipcMain.handle('getUserData', getUserData);
  ipcMain.on('downloadAsset', (_, url: string, assetId: string, version: string) => downloadAsset(url, assetId, version));
  ipcMain.handle('initAssetManager', initAssetManager);
  ipcMain.handle('initInstealledAssets', initInstealledAssets);
  ipcMain.handle('deleteAssetVersion', (_, assetId: string, version: string) => deleteAssetVersion(assetId, version));
  ipcMain.handle('installAssetVersion', (_, assetId: string, version: string) => installAssetVersion(assetId, version));
  ipcMain.handle('uninstallAssetVersion', (_, assetId: string, version: string) => uninstallAssetVersion(assetId, version));
}
