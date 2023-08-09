import { Game } from './Game';
import { ApiGame } from './Types';

export class GameConfig {
  readonly id: string;
  installPath?: string;

  constructor({ id, installPath }: { id: string; installPath?: string; }) {
    this.id = id;
    this.installPath = installPath;
  }

  async updateInstallPath({ steamAppName, relativeRootInstallPath }: { steamAppName?: string, relativeRootInstallPath?: string }) {
    if (this.installPath == undefined && steamAppName != undefined && relativeRootInstallPath != undefined && window.electronApi != null) {
      this.installPath = await window.electronApi.getIntallPathBySteamAppWithRelativePath(steamAppName, relativeRootInstallPath);
    }
  }

  static async newByGame(game: Game): Promise<GameConfig> {
    const gameConfig = new GameConfig({ id: game.id });
    await gameConfig.updateInstallPath(game);
    return gameConfig;
  }

  static async newByApiGame(apiGame: ApiGame): Promise<GameConfig> {
    const gameConfig = new GameConfig({ id: apiGame.id });
    await gameConfig.updateInstallPath(apiGame);
    return gameConfig;
  }

  async updateByGame(game: Game): Promise<void> {
    await this.updateInstallPath(game);
  }

  async updateByApiGame(apiGame: ApiGame): Promise<void> {
    await this.updateInstallPath(apiGame);
  }
}
