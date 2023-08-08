
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

  static async newByGame(game: { id: string, steamAppName?: string, relativeRootInstallPath?: string }): Promise<GameConfig> {
    const gameConfig = new GameConfig({ id: game.id });
    gameConfig.updateInstallPath(game);
    return gameConfig;
  }
}