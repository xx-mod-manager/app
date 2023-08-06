import { notNull } from 'src/utils/CommentUtils';
import { Game } from './Types';

export class GameConfig {
  readonly id: string;
  installPath?: string;

  constructor({ id, installPath }: { id: string; installPath?: string; }) {
    this.id = id;
    this.installPath = installPath;
  }

  async updateInstallPath({ steamAppName, relativeRootInstallPath }: { steamAppName?: string, relativeRootInstallPath?: string }) {
    const electronApi = notNull(window.electronApi, 'ElectronApi');

    if (this.installPath == undefined && steamAppName != undefined && relativeRootInstallPath != undefined) {
      this.installPath = await electronApi.getIntallPathBySteamAppWithRelativePath(steamAppName, relativeRootInstallPath);
    }
  }

  static async newByGame(game: Game): Promise<GameConfig> {
    const gameConfig = new GameConfig({ id: game.id });
    gameConfig.updateInstallPath(game);
    return gameConfig;
  }
}
