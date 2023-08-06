import { myLogger } from 'src/boot/logger';
import { deleteArrayItemByFieldId } from 'src/utils/ArrayUtils';
import { Resource } from './Resource';
import { ApiGame, ApiResource } from './Types';

export class Game {
  readonly id: string;
  name: string;
  dataRepo?: string;
  steamAppName?: string;
  relativeRootInstallPath?: string;
  autoMkRelativeRootInstallPath?: boolean;
  icon?: string;
  readonly resources: Map<string, Resource> = new Map;

  constructor({ id, name, dataRepo, steamAppName, relativeRootInstallPath, autoMkRelativeRootInstallPath, icon, resources = new Map }: {
    id: string;
    name: string;
    dataRepo?: string;
    steamAppName?: string;
    relativeRootInstallPath?: string;
    autoMkRelativeRootInstallPath?: boolean;
    icon?: string;
    resources?: Map<string, Resource>
  }) {
    this.id = id;
    this.name = name;
    this.dataRepo = dataRepo;
    this.steamAppName = steamAppName;
    this.relativeRootInstallPath = relativeRootInstallPath;
    this.autoMkRelativeRootInstallPath = autoMkRelativeRootInstallPath;
    this.icon = icon;
    for (const [resourceId, resource] of resources) {
      this.resources.set(resourceId, resource);
    }
  }

  clearApiGameData() {
    this.dataRepo = undefined;
    this.steamAppName = undefined;
    this.relativeRootInstallPath = undefined;
    this.autoMkRelativeRootInstallPath = undefined;
    this.icon = undefined;
  }

  updateApiGame(apiGame: ApiGame) {
    this.name = apiGame.name;
    this.dataRepo = apiGame.dataRepo;
    this.steamAppName = apiGame.steamAppName;
    this.relativeRootInstallPath = apiGame.relativeRootInstallPath;
    this.autoMkRelativeRootInstallPath = apiGame.autoMkRelativeRootInstallPath;
    this.icon = apiGame.icon;
  }

  isOnline(): boolean {
    return this.dataRepo != undefined;
  }

  isLocal(): boolean {
    for (const resource of this.resources.values()) {
      if (resource.isLocal()) return true;
    }
    return false;
  }

  updateApiResources(apiResources: ApiResource[]) {
    const deletedResources: Resource[] = Array.from(this.resources.values()).filter(i => !i.isLocal());

    this.resources.forEach((i) => i.clearApiResourcetData());

    for (const apiResource of apiResources) {
      const oldResource = this.resources.get(apiResource.id);
      if (oldResource) {
        myLogger.debug(`Update resource [${oldResource.id}]`);
        oldResource.updateApiResource(apiResource);
        deleteArrayItemByFieldId(deletedResources, oldResource);
      } else {
        myLogger.debug(`Add resource [${apiResource.id}]`);
        const newResource = new Resource(apiResource);
        this.resources.set(newResource.id, newResource);
      }
    }

    for (const deletedResource of deletedResources) {
      myLogger.debug(`Delete resource [${deletedResource.id}]`);
      this.resources.delete(deletedResource.id);
    }
  }
}
