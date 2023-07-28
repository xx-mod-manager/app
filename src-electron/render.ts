import AdmZip from 'adm-zip';
import { BrowserWindow, DownloadItem, app, ipcMain } from 'electron';
import { File, Progress, download } from 'electron-dl';
import { existsSync, promises as fsPromises } from 'fs';
import { join as pathJoin } from 'path';
import { myLogger } from 'src/boot/logger';
import { parseAssetDir } from 'src/utils/StringUtils';

const PATH_ASSETS = 'assets';

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
}

async function deleteAssetVersion(assetId: string, version: string) {
  const assetPath = pathJoin(getUserData(), PATH_ASSETS, assetId + '-' + version);
  await fsPromises.rmdir(assetPath, { recursive: true });
}

export default function init() {
  ipcMain.handle('getUserData', getUserData);
  ipcMain.on('downloadAsset', (_, url: string, assetId: string, version: string) => downloadAsset(url, assetId, version));
  ipcMain.handle('initAssetManager', initAssetManager);
  ipcMain.handle('deleteAssetVersion', (_, assetId: string, version: string) => deleteAssetVersion(assetId, version));
}
