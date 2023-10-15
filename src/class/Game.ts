import { myLogger } from 'src/boot/logger';
import { deleteArrayItemByFieldId } from 'src/utils/ArrayUtils';
import { notNull } from 'src/utils/CommentUtils';
import { AssetStatus } from './Asset';
import { Resource } from './Resource';
import { ApiGame, ApiResource } from './Types';
import { ImpResource } from './imp';

type OnlineData = Readonly<Omit<ApiGame, 'id'>>;
type LocalData = { name?: string };

export class Game {
  readonly id: string;
  onlineData?: OnlineData;
  localData: LocalData = {};
  readonly resources: Map<string, Resource> = new Map;

  constructor({ id, onlineData, localData, resources = new Map }: {
    id: string
    onlineData?: OnlineData
    localData?: LocalData
    resources?: Map<string, Resource>
  }) {
    this.id = id;
    this.onlineData = onlineData;
    if (localData != null) {
      this.localData = localData;
    }
    for (const [resourceId, resource] of resources) {
      this.resources.set(resourceId, resource);
    }
  }

  static byApiGame(apiGame: ApiGame): Game {
    const game = new Game({ id: apiGame.id });
    game.onlineData = apiGame;
    return game;
  }

  static byLocalGame(id: string, name: string): Game {
    const game = new Game({ id });
    game.name = name;
    return game;
  }

  get name(): string {
    if (this.localData.name != null) {
      return this.localData.name;
    } else {
      return notNull(this.onlineData).name;
    }
  }

  set name(name: string) {
    this.localData.name = name;
  }

  get dataRepo(): string | undefined {
    return this.onlineData?.dataRepo;
  }

  get steamAppName(): string | undefined {
    return this.onlineData?.steamAppName;
  }

  get relativeRootInstallPath(): string | undefined {
    return this.onlineData?.relativeRootInstallPath;
  }

  get autoMkRelativeRootInstallPath(): boolean | undefined {
    return this.onlineData?.autoMkRelativeRootInstallPath;
  }

  get icon(): string | undefined {
    return this.onlineData?.icon;
  }

  updateInstalledAsset(insAssets: Map<string, string[]>) {
    myLogger.debug(`Update installed assets(${insAssets.size}):`);
    insAssets.forEach((assetIds, resourceId) => assetIds.forEach((assetId) => myLogger.debug(`\t[${resourceId}][${assetId}]`)));

    for (const [insResourceId, insAssetIds] of insAssets) {
      let resource = this.resources.get(insResourceId);
      if (resource == undefined) {
        resource = new Resource({ id: insResourceId });
        this.resources.set(resource.id, resource);
      }
      resource.updateInstalledAsset(insAssetIds);
    };

    for (const resource of this.resources.values()) {
      const insAssetIds = insAssets.get(resource.id) ?? [];
      Array.from(resource.assets.values())
        .filter(i => i.status === AssetStatus.INTALLED && (!insAssetIds.includes(i.id)))
        .forEach(i => i.status = AssetStatus.DOWNLOADED);
    }
  }

  updateDownloadedAsset(downAssets: Map<string, string[]>) {
    myLogger.debug(`Update downloaded assets(${downAssets.size}):`);
    downAssets.forEach((assetIds, resourceId) => assetIds.forEach((assetId) => myLogger.debug(`\t[${resourceId}][${assetId}]`)));

    for (const [downResourceId, downAssetIds] of downAssets) {
      let resource = this.resources.get(downResourceId);
      if (resource == undefined) {
        resource = Resource.byId(downResourceId);
        this.resources.set(resource.id, resource);
      }
      resource.updateDownloadedAsset(downAssetIds);
    };

    for (const resource of this.resources.values()) {
      const downAssetIds = downAssets.get(resource.id) ?? [];
      Array.from(resource.assets.values())
        .filter(i => i.status === AssetStatus.DOWNLOADED && (!downAssetIds.includes(i.id)))
        .forEach(i => {
          myLogger.debug(`Delete downloaded Asset[${resource.id}][${i.id}]`);
          if (i.isOnline()) i.status = AssetStatus.NONE;
          else resource.assets.delete(i.id);
        });
    }
  }

  importResource(impResource: ImpResource) {
    let resource = this.resources.get(impResource.id);
    if (resource == null) {
      resource = Resource.byImpResource(impResource);
      this.resources.set(resource.id, resource);
    } else {
      resource.updateImpAssets(impResource.assets);
    }
  }

  isOnline(): boolean {
    return this.onlineData != null;
  }

  isLocal(): boolean {
    for (const resource of this.resources.values()) {
      if (resource.isLocal()) return true;
    }
    return false;
  }

  updateApiResources(apiResources: ApiResource[]) {
    const deletedResources: Resource[] = Array.from(this.resources.values()).filter(i => !i.isLocal());

    this.resources.forEach((i) => i.onlineData = undefined);

    for (const apiResource of apiResources) {
      const oldResource = this.resources.get(apiResource.id);
      if (oldResource) {
        myLogger.debug(`Update resource [${oldResource.id}]`);
        oldResource.onlineData = apiResource;
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
