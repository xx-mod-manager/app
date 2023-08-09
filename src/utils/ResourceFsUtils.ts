import { Platform } from 'quasar';
import { myLogger } from 'src/boot/logger';
import { notNull } from './CommentUtils';

const PATH_RESOURCE = 'Resources';

export async function getDefaultSteamAppsPath(): Promise<string | undefined> {
  const { app, path, fs } = notNull(window.electronApi, 'ElectronApi');

  let steamPath: string | undefined = undefined;
  const homePath = await app.getPath('home');
  if (Platform.is.win) {
    const win32 = 'C:\\Program Files (x86)\\Steam';
    const win64 = 'C:\\Program Files\\Steam';
    if (await fs.exist(win32)) steamPath = win32;
    else if (await fs.exist(win64)) steamPath = win64;
  } else if (Platform.is.linux) {
    const linux = await path.join(homePath, '.local/share/Steam');
    if (await fs.exist(linux)) steamPath = linux;
  } else if (Platform.is.mac) {
    const mac = await path.join(homePath, 'Library/Application Support/Steam');
    if (await fs.exist(mac)) steamPath = mac;
  }
  if (steamPath == undefined) {
    return undefined;
  }
  const steamAppsPath = await path.join(steamPath, 'steamapps', 'common');
  if (await fs.exist(steamAppsPath)) return steamAppsPath;
  return undefined;
}

async function getSteamAppRootPath(steamAppsPath: string, steamAppName: string): Promise<string | undefined> {
  const { path, fs } = notNull(window.electronApi, 'ElectronApi');

  const appPath = await path.join(steamAppsPath, steamAppName);
  if (await fs.exist(appPath)) return appPath;
  return undefined;
}

export async function getRelativeInstallPath(steamAppsPath: string, steamAppName: string, relativePath: string): Promise<string | undefined> {
  const { path, fs } = notNull(window.electronApi, 'ElectronApi');

  const appPath = await getSteamAppRootPath(steamAppsPath, steamAppName);
  if (appPath == null) return undefined;
  const installPath = await path.join(appPath, relativePath);
  if (await fs.exist(installPath)) return installPath;
  else return undefined;
}

export async function getResourcesPath(gameId: string): Promise<string> {
  const { app, path } = notNull(window.electronApi, 'ElectronApi');

  return await path.join(await app.getPath('userData'), PATH_RESOURCE, gameId);
}

export async function uninstallAsset(gameInstallPath: string, resourceId: string, assetId: string) {
  const { fs, path } = notNull(window.electronApi, 'ElectronApi');

  const assetInstallPath = await path.join(gameInstallPath, resourceId + '-' + assetId);
  if (await fs.exist(assetInstallPath)) {
    myLogger.info(`Asset [${resourceId}]/[${assetId}] installed, rm.`);
    await fs.rm(assetInstallPath, { recursive: true, force: true });
  }
}

export async function installAsset(gameInstallPath: string, gameId: string, resourceId: string, assetId: string) {
  const { fs, path } = notNull(window.electronApi, 'ElectronApi');

  const assetPath = await path.join(await getResourcesPath(gameId), resourceId + '-' + assetId);
  const assetInstallPath = await path.join(gameInstallPath, resourceId + '-' + assetId);
  await fs.symlink(assetPath, assetInstallPath, 'dir');
}

export async function deleteAsset(gameId: string, resourceId: string, assetId: string, _assetPath?: string) {
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
