import { myLogger } from 'src/boot/logger';
import { deleteArrayItemByFieldId } from 'src/utils/ArrayUtils';
import { notNull } from 'src/utils/CommentUtils';
import { parseResourceAndVersion } from 'src/utils/StringUtils';
import { Asset, AssetStatus } from './Asset';
import { ApiReleaseAsset } from './GraphqlClass';
import { ApiResource } from './Types';
import { ImpAsset, ImpResource } from './imp';

type OnlineData = Readonly<Omit<ApiResource, 'id'>>;
type LocalData = {
  name?: string
  description?: string
  author?: string
  category?: string
  created?: number
};

export class Resource {
  readonly id: string;
  onlineData?: OnlineData;
  localData: LocalData = {};
  readonly assets: Map<string, Asset> = new Map;

  constructor({ id, onlineData, localData, assets = new Map }
    : {
      id: string,
      onlineData?: OnlineData
      localData?: LocalData
      assets?: Map<string, Asset>,
    }) {
    this.id = id;
    this.onlineData = onlineData;
    if (localData != null) {
      this.localData = localData;
    }
    for (const [assetId, asset] of assets) {
      this.assets.set(assetId, asset);
    }
  }

  static byId(resourceId: string): Resource {
    const resource = new Resource({
      id: resourceId, localData: {
        name: resourceId,
        description: resourceId,
        author: 'None',
        category: 'mod',
        created: Date.now()
      }
    });
    return resource;
  }

  static byApiResource(apiResource: ApiResource): Resource {
    const resource = new Resource({ id: apiResource.id });
    resource.onlineData = apiResource;
    return resource;
  }

  static byImpResource(impResource: ImpResource): Resource {
    return new Resource({
      id: impResource.id,
      localData: { ...impResource, created: Date.now() },
      assets: new Map(Array.from(impResource.assets.values())
        .map(Asset.newByImpAsset)
        .map(i => [i.id, i]))
    });
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

  get description(): string {
    if (this.localData.description != null) {
      return this.localData.description;
    } else {
      return notNull(this.onlineData).description;
    }
  }

  set description(description: string) {
    this.localData.description = description;
  }

  get cover(): string | undefined {
    return this.onlineData?.cover;
  }

  get author(): string {
    if (this.localData.author != null) {
      return this.localData.author;
    } else {
      return notNull(this.onlineData).author;
    }
  }

  set author(author: string) {
    this.localData.author = author;
  }

  get category(): string {
    if (this.localData.category != null) {
      return this.localData.category;
    } else {
      return notNull(this.onlineData).category;
    }
  }

  set category(category: string) {
    this.localData.category = category;
  }

  get tags(): string[] {
    if (this.onlineData == null) {
      return [];
    } else {
      return this.onlineData?.tags;
    }
  }

  get repo(): string | undefined {
    return this.onlineData?.repo;
  }

  get created(): number {
    if (this.localData.created != null) {
      return this.localData.created;
    } else {
      return notNull(this.onlineData).created;
    }
  }

  set created(created: number) {
    this.localData.created = created;
  }

  get updated(): number | undefined {
    return this.onlineData?.updated;
  }

  get downloadCount(): number | undefined {
    return this.onlineData?.downloadCount;
  }

  get releaseNodeId(): string | undefined {
    return this.onlineData?.releaseNodeId;
  }

  get discussionNodeId(): string | undefined {
    return this.onlineData?.discussionNodeId;
  }

  isOnline(): boolean {
    return this.repo != null;
  }

  isLocal(): boolean {
    for (const asset of this.assets.values()) {
      if (asset.isLocal()) return true;
    }
    return false;
  }

  updateApiReleaseAssets(apiReleaseAssets: ApiReleaseAsset[]) {
    const deletedAssets = Array.from(this.assets.values()).filter(i => !i.isLocal());

    this.assets.forEach((it) => it.clearApiReleaseAssetData());

    for (const apiReleaseAsset of apiReleaseAssets) {
      const { assetId: apiReleaseAssetId } = parseResourceAndVersion(apiReleaseAsset.name);

      const oldAsset = this.assets.get(apiReleaseAssetId);
      if (oldAsset != null) {
        myLogger.debug(`Resource[${this.id}] update asset [${oldAsset.id}]`);
        oldAsset.updateApiReleaseAsset(apiReleaseAsset);
        deleteArrayItemByFieldId(deletedAssets, oldAsset);
      } else {
        myLogger.debug(`Resource[${this.id}] add asset [${apiReleaseAssetId}]`);
        const newAsset = Asset.newByApiReleaseAsset(apiReleaseAsset);
        this.assets.set(newAsset.id, newAsset);
      }
    }

    for (const deletedAsset of deletedAssets) {
      myLogger.debug(`Resource[${this.id}] delete asset [${deletedAsset.id}]`);
      this.assets.delete(deletedAsset.id);
    }
  }

  updateImpAssets(impAssets: Map<string, ImpAsset>) {
    for (const impAsset of impAssets.values()) {
      const existAsset = this.assets.get(impAsset.id);
      if (existAsset != undefined) {
        if (existAsset.status === AssetStatus.NONE) {
          existAsset.status = AssetStatus.DOWNLOADED;
        }
      } else {
        const newAsset = Asset.newByImpAsset(impAsset);
        this.assets.set(newAsset.id, newAsset);
      }
    }
  }

  updateInstalledAsset(insAssetIds: string[]) {
    for (const insAssetId of insAssetIds) {
      const existAsset = this.assets.get(insAssetId);
      if (existAsset != undefined) {
        if (existAsset.status == AssetStatus.NONE || existAsset.status == AssetStatus.DOWNLOADED) {
          existAsset.status = AssetStatus.INTALLED;
          myLogger.debug(`Update install status asset [${this.id}][${insAssetId}]`);
        }
      } else {
        const newAsset = new Asset({ id: insAssetId, status: AssetStatus.INTALLED });
        this.assets.set(newAsset.id, newAsset);
        myLogger.debug(`Add new install asset [${this.id}][${insAssetId}]`);
      }
    }
  }

  updateDownloadedAsset(downAssetIds: string[]) {
    for (const downAssetId of downAssetIds) {
      const existAsset = this.assets.get(downAssetId);
      if (existAsset != undefined) {
        if (existAsset.status == AssetStatus.NONE) {
          existAsset.status = AssetStatus.DOWNLOADED;
          myLogger.debug(`Update downloaded status asset [${this.id}][${downAssetId}]`);
        }
      } else {
        const newAsset = new Asset({ id: downAssetId, status: AssetStatus.DOWNLOADED });
        this.assets.set(newAsset.id, newAsset);
        myLogger.debug(`Add new download asset [${this.id}][${downAssetId}]`);
      }
    }
  }

  hasAsset(id: string): boolean {
    return this.assets.has(id);
  }

  addAsset(asset: Asset) {
    this.assets.set(asset.id, asset);
  }

  deleteAsset(assetId: string) {
    this.assets.delete(assetId);
  }

  addAssets(assets: IterableIterator<Asset>) {
    for (const asset of assets) {
      this.addAsset(asset);
    }
  }
}
