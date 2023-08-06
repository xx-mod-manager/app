import { app, dialog } from 'electron';
import { StatOptions, existsSync, promises as fsPromises } from 'fs';
import { basename, extname, join as pathJoin } from 'path';
import { myLogger } from 'src/boot/logger';
import { FileState } from 'src/class/Types';

const PATH_RESOURCE = 'Resources';

export function getGameResourcesPath(gameId: string): string {
  return pathJoin(app.getPath('userData'), PATH_RESOURCE, gameId);
}

export async function checkResourcesDir(resourcesPath: string) {
  if (existsSync(resourcesPath)) {
    const assetsStat = await fsPromises.stat(resourcesPath);
    if (!assetsStat.isDirectory()) {
      await fsPromises.rm(resourcesPath, { force: true });
      await fsPromises.mkdir(resourcesPath);
      myLogger.warn(`Resources dir [${resourcesPath}] is not directory, Recreate.`);
    }
  } else {
    await fsPromises.mkdir(resourcesPath, { recursive: true });
    myLogger.debug(`Create resources dir [${resourcesPath}].`);
  }
}

function getDefaultSteamAppsPath(): string | undefined {
  let steamPath: string | undefined = undefined;
  const homePath = app.getPath('home');
  if (process.platform == 'win32') {
    const win32 = 'C:\\Program Files (x86)\\Steam';
    const win64 = 'C:\\Program Files\\Steam';
    if (existsSync(win32)) steamPath = win32;
    else if (existsSync(win64)) steamPath = win64;
  } else if (process.platform == 'linux') {
    const linux = pathJoin(homePath, '.local/share/Steam');
    if (existsSync(linux)) steamPath = linux;
  } else if (process.platform == 'darwin') {
    const mac = pathJoin(homePath, 'Library/Application Support/Steam');
    if (existsSync(mac)) steamPath = mac;
  }
  if (steamPath == undefined) {
    return undefined;
  }
  const steamAppsPath = pathJoin(steamPath, 'steamapps', 'common');
  if (existsSync(steamAppsPath)) return steamAppsPath;
  return undefined;
}

function getDefaultSteamAppPath(steamAppName: string): string | undefined {
  const appsPath = getDefaultSteamAppsPath();
  if (appsPath == undefined) return undefined;
  const appPath = pathJoin(appsPath, steamAppName);
  if (existsSync(appPath)) return appPath;
  return undefined;
}

export function getIntallPathBySteamAppWithRelativePath(steamAppName: string, relativePath: string) {
  const appPath = getDefaultSteamAppPath(steamAppName);
  if (appPath == undefined) return undefined;
  const installPath = pathJoin(appPath, relativePath);
  if (existsSync(installPath)) return installPath;
  else return undefined;
}

export async function openDialogSelectDirectory(title: string): Promise<{ name: string; path: string; } | undefined> {
  const dialogValue = await dialog.showOpenDialog({ title, properties: ['openDirectory'] });
  if (dialogValue.filePaths.length > 0) {
    const path = dialogValue.filePaths[0];
    return { name: basename(path), path };
  } else {
    return undefined;
  }
}

export async function openDialogSelectZipFile(title: string): Promise<{ name: string; path: string; } | undefined> {
  const dialogValue = await dialog.showOpenDialog({ title, properties: ['openFile'], filters: [{ name: 'Zip', extensions: ['zip'] }] });
  if (dialogValue.filePaths.length > 0) {
    const path = dialogValue.filePaths[0];
    return { name: basename(path), path };
  } else {
    return undefined;
  }
}

export async function getPathInfoByPath(path: string): Promise<{ exist: boolean; ext: string | undefined; isFile: boolean; isDirectory: boolean; name: string; path: string }> {
  if (existsSync(path)) {
    let ext: undefined | string = undefined;
    const stat = await fsPromises.stat(path);
    if (stat.isFile()) {
      ext = extname(path).toLowerCase();
    }
    return { exist: true, ext, isFile: stat.isFile(), isDirectory: stat.isDirectory(), name: basename(path), path };
  } else {
    myLogger.warn(`${path} not exist.`);
    return { exist: false, ext: '', isFile: false, isDirectory: false, name: '', path };
  }
}

export async function getState(path: string, opts?: StatOptions): Promise<FileState> {
  const stat = await fsPromises.stat(path, opts);
  return { isFile: stat.isFile(), isDirectory: stat.isDirectory(), isSymbolicLink: stat.isSymbolicLink(), size: stat.size };
}
