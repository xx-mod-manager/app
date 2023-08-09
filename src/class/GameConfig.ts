import { myLogger } from 'src/boot/logger';
import { useUserConfigStore } from 'src/stores/UserConfig';
import { getRelativeInstallPath } from 'src/utils/ResourceFsUtils';
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
    const { steamAppsPath } = useUserConfigStore();
    if (
      this.installPath == null
      && steamAppsPath != null
      && steamAppName != null
      && relativeRootInstallPath != null
      && window.electronApi != null
    ) {
      this.installPath = await getRelativeInstallPath(steamAppsPath, steamAppName, relativeRootInstallPath);
    } else {
      myLogger.debug(`Skip update default install path, installPath[${this.installPath == null}],steamAppsPath[${steamAppsPath != null}],sreamAppName:[${steamAppName != null}],relativeRootInstallPath:[${relativeRootInstallPath != null}]`);
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
