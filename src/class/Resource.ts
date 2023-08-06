import { myLogger } from 'src/boot/logger';
import { deleteArrayItemByFieldId, replaceArray } from 'src/utils/ArrayUtils';
import { parseResourceAndVersion } from 'src/utils/StringUtils';
import { Asset } from './Asset';
import { ApiReleaseAsset } from './GraphqlClass';
import { ApiResource } from './Types';

export class Resource {
  readonly id: string;
  name: string;
  description: string;
  cover?: string;
  author: string;
  category: string;
  readonly tags: string[] = [];
  repo?: string;
  created: number;
  updated?: number;
  downloadCount?: number;
  releaseNodeId?: string;
  discussionNodeId?: string;
  readonly assets: Map<string, Asset> = new Map;

  constructor({ id, name, description, cover, author, category, repo, created, updated, downloadCount, releaseNodeId, discussionNodeId, assets = new Map }
    : {
      id: string,
      name: string,
      description: string,
      cover?: string,
      author: string,
      category: string,
      repo?: string,
      created: number,
      updated?: number,
      downloadCount?: number,
      releaseNodeId?: string,
      discussionNodeId?: string,
      assets?: Map<string, Asset>,
    }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.cover = cover;
    this.author = author;
    this.category = category;
    this.repo = repo;
    this.created = created;
    this.updated = updated;
    this.downloadCount = downloadCount;
    this.releaseNodeId = releaseNodeId;
    this.discussionNodeId = discussionNodeId;
    for (const [assetId, asset] of assets) {
      this.assets.set(assetId, asset);
    }
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

  static newById(id: string): Resource {
    return new Resource({
      id,
      name: id,
      description: id,
      author: 'None',
      category: 'Other',
      created: Date.now(),
    });
  }

  clearApiResourcetData() {
    this.repo = undefined;
    this.updated = undefined;
    this.downloadCount = undefined;
    this.releaseNodeId = undefined;
    this.discussionNodeId = undefined;
  }

  updateApiResource(onlineResource: ApiResource) {
    this.name = onlineResource.name;
    this.description = onlineResource.description;
    this.cover = onlineResource.cover;
    this.author = onlineResource.author;
    this.category = onlineResource.category;
    replaceArray(this.tags, onlineResource.tags);
    this.repo = onlineResource.repo;
    this.created = onlineResource.created;
    this.updated = onlineResource.updated;
    this.downloadCount = onlineResource.downloadCount;
    this.releaseNodeId = onlineResource.releaseNodeId;
    this.discussionNodeId = onlineResource.discussionNodeId;
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
}
