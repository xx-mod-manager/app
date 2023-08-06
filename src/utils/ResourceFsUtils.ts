import { myLogger } from 'src/boot/logger';
import { notNull } from './CommentUtils';

const PATH_RESOURCE = 'Resources';


export async function getResourcesPath(gameId: string): Promise<string> {
  const { app, path } = notNull(window.electronApi, 'ElectronApi');

  return await path.join(await app.getPath('userData'), PATH_RESOURCE, gameId);
}

async function deleteAsset(gameId: string, resourceId: string, assetId: string, _assetPath?: string) {
  const { fs, path } = notNull(window.electronApi, 'ElectronApi');

  const assetPath = _assetPath ?? await path.join(await getResourcesPath(gameId), resourceId + '-' + assetId);
  if (await fs.exist(assetPath)) {
    myLogger.info(`Asset [${resourceId}]/[${assetId}] exist, rm.`);
    await fs.rm(assetPath, { recursive: true, force: true });
  }
}

export async function importLocalAssetByDirPath(gameId: string, resourceId: string, assetId: string, dirPath: string, rmRaw?: boolean) {
  myLogger.debug(`Import local asset[${resourceId}][${assetId}] from [${dirPath}]`);
  const { fs, path } = notNull(window.electronApi, 'ElectronApi');

  const assetPath = await path.join(await getResourcesPath(gameId), resourceId + '-' + assetId);
  myLogger.debug(`Import local asset to path[${assetPath}]`);
  deleteAsset(gameId, resourceId, assetId, assetPath);
  if (rmRaw === true) {
    myLogger.debug(`Delete import raw file [${dirPath}]`);
    fs.rename(dirPath, assetPath);
  } else {
    fs.cp(dirPath, assetPath, { recursive: true, force: true });
  }
}

export async function importLocalAssetByZipPath(gameId: string, resourceId: string, assetId: string, zipPath: string, rmRaw?: boolean) {
  myLogger.debug(`Import local asset[${resourceId}][${assetId}] from [${zipPath}]`);
  const { fs, path } = notNull(window.electronApi, 'ElectronApi');

  const assetPath = await path.join(await getResourcesPath(gameId), resourceId + '-' + assetId);
  myLogger.debug(`Import local asset to path[${assetPath}]`);
  deleteAsset(gameId, resourceId, assetId, assetPath);
  fs.unzipAsset(zipPath, assetPath);
  if (rmRaw === true) {
    myLogger.debug(`Delete import raw file [${zipPath}]`);
    fs.rm(zipPath, { force: true });
  }
}
