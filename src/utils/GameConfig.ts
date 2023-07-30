import { Game, GameConfig } from 'src/class/Types';

export async function newOnlineGameConfig(onlineGame: Game): Promise<GameConfig> {
  let defaultInstallPath: string | undefined = undefined;
  if (onlineGame.steamAppName != undefined && onlineGame.relativeRootInstallPath != undefined) {
    defaultInstallPath = await window.electronApi.getIntallPathBySteamAppWithRelativePath(onlineGame.steamAppName, onlineGame.relativeRootInstallPath);
  }
  return {
    id: onlineGame.id,
    installPath: defaultInstallPath,
    lockRootWithInstallPath: onlineGame.relativeRootInstallPath != undefined
  };
}

export async function updateOnlineGameConfig(oldGameConfig: GameConfig, onlineGame: Game): Promise<void> {
  if (oldGameConfig.id != onlineGame.id)
    throw Error(`updateOnlineGameConfig game id different, [${oldGameConfig.id}] and [${onlineGame.id}].`);
  if (oldGameConfig.installPath == undefined && onlineGame.steamAppName != undefined && onlineGame.relativeRootInstallPath != undefined) {
    oldGameConfig.installPath = await window.electronApi.getIntallPathBySteamAppWithRelativePath(onlineGame.steamAppName, onlineGame.relativeRootInstallPath);
    oldGameConfig.lockRootWithInstallPath = true;
  }
}
