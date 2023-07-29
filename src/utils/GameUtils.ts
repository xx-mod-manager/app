import { ApiGame, Game } from 'src/class/Types';
import { existLocalResource } from './ResourceUtils';


export function newOnlineGame(apiGame: ApiGame): Game {
  const game: Game = {
    ...apiGame,
    resources: []
  };
  return game;
}

export function updateOnlineGame(oldGame: Game, onlineGame: Game) {
  if (oldGame.id != onlineGame.id)
    throw Error(`updateOnlineGame game id different, [${oldGame.id}] and [${onlineGame.id}].`);
  oldGame.name = onlineGame.name;
  oldGame.dataRepo = onlineGame.dataRepo;
  oldGame.steamAppName = onlineGame.steamAppName;
  oldGame.relativeRootInstallPath = onlineGame.relativeRootInstallPath;
  oldGame.autoMkRelativeRootInstallPath = onlineGame.autoMkRelativeRootInstallPath;
  oldGame.icon = onlineGame.icon;
}

export function existLocalGame(game: Game): boolean {
  for (const resource of game.resources) {
    if (existLocalResource(resource)) return true;
  }
  return false;
}
