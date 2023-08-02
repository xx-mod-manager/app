import { app } from 'electron';
import { existsSync, promises as fsPromises } from 'fs';
import { join as pathJoin } from 'path';
import { myLogger } from 'src/boot/logger';

const PATH_RESOURCE = 'Resources';

export function getGameResourcesPath(gameId: string): string {
  return pathJoin(app.getPath('userData'), PATH_RESOURCE, gameId);
}

export async function initResourcesDir(resourcesPath: string) {
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

function getDefaultSteamAppsPath(): string | undefined {
  let steamPath: string | undefined = undefined;
  const homePath = app.getPath('home');
  if (process.platform == 'win32') {
    const win32 = 'C:\\Program Files (x86)\\Steam';
    const win64 = 'C:\\Program Files\\Steam';
    //Logic issue, win32 & win64 all exits
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

export function getDefaultSteamAppPath(steamAppName: string): string | undefined {
  const appsPath = getDefaultSteamAppsPath();
  if (appsPath == undefined) return undefined;
  const appPath = pathJoin(appsPath, steamAppName);
  if (existsSync(appPath)) return appPath;
  return undefined;
}
