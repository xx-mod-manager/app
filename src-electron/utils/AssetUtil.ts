import { BrowserWindow, app, dialog } from 'electron';
import { File, Progress, download } from 'electron-dl';
import { existsSync, promises as fsPromises } from 'fs';
import { basename, extname, join as pathJoin } from 'path';
import { myLogger } from 'src/boot/logger';
import { notNull } from 'src/utils/CommentUtils';
import { parseResourceAndVersion } from 'src/utils/StringUtils';
import { checkResourcesDir, getGameResourcesPath } from './FsUtil';
import { unzipAsset } from './ZipUtil';

export async function downloadAndUnzipAsset(url: string, gameId: string, resourceId: string, assetId: string) {
  const win = notNull(BrowserWindow.getFocusedWindow(), 'Foused window');
  myLogger.debug(`Ready download asset:[${gameId}][${resourceId}][${assetId}], url:[${url}]`);
  const assetFullId = gameId + '-' + resourceId + '-' + assetId;
  await download(win, url, { overwrite: true, directory: app.getPath('temp'), onStarted, onProgress, onCompleted });
  function onStarted() {
    win.webContents.send('onDownloadStarted', assetFullId);
  }
  function onProgress(progress: Progress) {
    win.webContents.send('onDownloadProgress', assetFullId, progress);
  }
  function onCompleted(file: File) {
    unzipAsset(file.path, getGameResourcesPath(gameId), resourceId, assetId);
    win.webContents.send('onDownloadCompleted', assetFullId, file);
  }
}

export async function formatInstallAndDownloadDir(installPath: string, gameId: string) {
  const resourcesPath = getGameResourcesPath(gameId);
  await checkResourcesDir(resourcesPath);
  const installedAssets = await fsPromises.readdir(installPath);
  await Promise.all(installedAssets.map(async (assetName) => {
    const installedAssetPath = pathJoin(installPath, assetName);
    const installedAssetStat = await fsPromises.stat(installedAssetPath);
    if (installedAssetStat.isDirectory() && !installedAssetStat.isSymbolicLink()) {
      const { resourceId: resourceId, assetId } = parseResourceAndVersion(assetName);
      const newResourceName = resourceId + '-' + assetId;
      myLogger.debug(`Sync asset [${assetName}] to download path, and rename as [${newResourceName}]`);
      const downloadedAssetPath = pathJoin(resourcesPath, newResourceName);
      await fsPromises.rename(installedAssetPath, downloadedAssetPath);
      await installAsset(installPath, gameId, resourceId, assetId);
    }
  }));
}

export async function getDownloadedAssets(gameId: string): Promise<Map<string, string[]>> {
  const resourcesPath = getGameResourcesPath(gameId);
  await checkResourcesDir(resourcesPath);
  const result = new Map<string, string[]>();
  const assetFiles = await fsPromises.readdir(resourcesPath);
  const promises = assetFiles.map(async (assetFile) => {
    const assetFilePath = pathJoin(resourcesPath, assetFile);
    const assetFileStat = await fsPromises.stat(assetFilePath);
    if (assetFileStat.isDirectory()) {
      const { resourceId: resource, assetId } = parseResourceAndVersion(assetFile);
      let versions = result.get(resource);
      if (versions == undefined) {
        versions = [];
        result.set(resource, versions);
      }
      versions.push(assetId);
    } else {
      myLogger.info(`Skip is not dir's asset file: [${assetFile}]`);
    }
  });
  await Promise.all(promises);
  return result;
}

export async function getInstealledAssets(installPath: string): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  const assetFiles = await fsPromises.readdir(installPath);
  const promises = assetFiles.map(async (assetFile) => {
    const assetFilePath = pathJoin(installPath, assetFile);
    const assetFileStat = await fsPromises.stat(assetFilePath);
    if (assetFileStat.isDirectory()) {
      const { resourceId: resource, assetId } = parseResourceAndVersion(assetFile);
      let versions = result.get(resource);
      if (versions == undefined) {
        versions = [];
        result.set(resource, versions);
      }
      versions.push(assetId);
    } else {
      myLogger.info(`Skip is not dir's asset file: [${assetFile}]`);
    }
  });
  await Promise.all(promises);
  return result;
}

export async function deleteAsset(gameId: string, resourceId: string, assetId: string) {
  const resourcesPath = pathJoin(getGameResourcesPath(gameId), resourceId + '-' + assetId);
  await fsPromises.rm(resourcesPath, { recursive: true });
}

export async function installAsset(installPath: string, gameId: string, resourceId: string, assetId: string) {
  const resourcesPath = pathJoin(getGameResourcesPath(gameId), resourceId + '-' + assetId);
  const installAssetPath = pathJoin(installPath, resourceId + '-' + assetId);
  await fsPromises.symlink(resourcesPath, installAssetPath, 'dir');
}

export async function uninstallAsset(installPath: string, resourceId: string, assetId: string) {
  if (installPath == undefined) throw Error('Miss install path');
  const assetPath = pathJoin(installPath, resourceId + '-' + assetId);
  await fsPromises.rm(assetPath, { recursive: true });
}

export async function selectDirectory(title: string): Promise<Electron.OpenDialogReturnValue> {
  return await dialog.showOpenDialog({ title, properties: ['openDirectory'] });
}

export async function addAssetByDir(gameId: string, dirPath: string): Promise<{ resourceId: string; assetId: string; }> {
  const name = basename(dirPath);
  const assetInfo = parseResourceAndVersion(name);
  await fsPromises.cp(dirPath, pathJoin(getGameResourcesPath(gameId), assetInfo.resourceId + '-' + assetInfo.assetId), { recursive: true, force: true });
  return assetInfo;
}

export async function selectDirectoryAddAsset(gameId: string, title: string): Promise<{ resourceId: string; assetId: string; } | undefined> {
  const result = await dialog.showOpenDialog({ title, properties: ['openDirectory'] });
  if (result.filePaths.length > 0) {
    const dirPath = result.filePaths[0];
    return await addAssetByDir(gameId, dirPath);
  } else {
    return undefined;
  }
}

export async function addAssetByZipFile(gameId: string, zipPath: string): Promise<{ resourceId: string; assetId: string; }> {
  const name = basename(zipPath);
  const assetInfo = parseResourceAndVersion(name);
  unzipAsset(zipPath, getGameResourcesPath(gameId), assetInfo.resourceId, assetInfo.assetId);
  return assetInfo;
}

export async function selectZipFileAddAsset(gameId: string, title: string): Promise<{ resourceId: string; assetId: string; } | undefined> {
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

export async function addAssetsByPaths(gameId: string, paths: string[]): Promise<{ resourceId: string; assetId: string; }[]> {
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
  const notNullResult: { resourceId: string; assetId: string; }[] = [];
  result.forEach(i => { if (i !== undefined) notNullResult.push(i); });
  return notNullResult;
}
