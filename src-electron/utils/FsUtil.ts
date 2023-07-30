import { app } from 'electron';
import { existsSync, promises as fsPromises } from 'fs';
import { join as pathJoin } from 'path';
import { myLogger } from 'src/boot/logger';
import { parseAssetDir } from 'src/utils/StringUtils';

const PATH_RESOURCE = 'Resources';

export function getGameResourcesPath(gameId: string): string {
  return pathJoin(app.getPath('userData'), PATH_RESOURCE, gameId);
}

async function initResourcesDir(resourcesPath: string) {
  myLogger.debug(`initResourcesDir: ${resourcesPath}.`);
  if (existsSync(resourcesPath)) {
    const assetsStat = await fsPromises.stat(resourcesPath);
    if (!assetsStat.isDirectory()) {
      await fsPromises.unlink(resourcesPath);
      await fsPromises.mkdir(resourcesPath);
      myLogger.warn('Resources dir not directory, Recreate.');
    }
  } else {
    await fsPromises.mkdir(resourcesPath, { recursive: true });
    myLogger.debug('Create resources dir.');
  }
}

export async function syncInstallDownloadResource(installPath: string, resourcesPath: string) {
  await initResourcesDir(resourcesPath);
  if (installPath == undefined) throw Error('Miss install path.');
  const installedAssets = await fsPromises.readdir(installPath);
  Promise.all(installedAssets.map(async (resourceName) => {
    const installedAssetPath = pathJoin(installPath, resourceName);
    const installedAssetStat = await fsPromises.stat(installedAssetPath);
    if (installedAssetStat.isDirectory() && !installedAssetStat.isSymbolicLink()) {
      const { assetId, version } = parseAssetDir(resourceName);
      const newResourceName = assetId + '-' + version;
      myLogger.debug(`Need sync resource ${resourceName} to ${newResourceName}`);
      const downloadedAssetPath = pathJoin(resourcesPath, newResourceName);
      fsPromises.rename(installedAssetPath, downloadedAssetPath);
      fsPromises.symlink(downloadedAssetPath, pathJoin(installPath, newResourceName));
    }
  }));
}
