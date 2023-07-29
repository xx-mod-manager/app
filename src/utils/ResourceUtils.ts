import { ApiResource, Resource } from 'src/class/Types';
import { existLocalAsset } from './AssetUtils';

export function newOnlineResource(apiAsset: ApiResource): Resource {
  const resource: Resource = {
    ...apiAsset,
    existOnline: true,
    assets: []
  };
  return resource;
}

export function newLocalResource(id: string): Resource {
  const resource: Resource = {
    id,
    name: id,
    description: id,
    author: 'none',
    category: 'other',
    tags: [],
    repo: 'local',
    created: 0,
    updated: 0,
    downloadCount: 0,
    releaseNodeId: '',
    discussionNodeId: '',
    existOnline: false,
    assets: []
  };
  return resource;
}

export function updateOnlineResource(oldResource: Resource, onlineResource: Resource): void {
  if (oldResource.id != onlineResource.id)
    throw Error(`updateOnlineResource resource id different, [${oldResource.id}] and [${onlineResource.id}].`);
  oldResource.name = onlineResource.name;
  oldResource.description = onlineResource.description;
  oldResource.cover = onlineResource.cover;
  oldResource.author = onlineResource.author;
  oldResource.category = onlineResource.category;
  oldResource.tags = onlineResource.tags;
  oldResource.repo = onlineResource.repo;
  oldResource.created = onlineResource.created;
  oldResource.updated = onlineResource.updated;
  oldResource.downloadCount = onlineResource.downloadCount;
  oldResource.releaseNodeId = onlineResource.releaseNodeId;
  oldResource.discussionNodeId = onlineResource.discussionNodeId;
  oldResource.existOnline = true;
}

export function existLocalResource(resource: Resource): boolean {
  for (const asset of resource.assets.values()) {
    if (existLocalAsset(asset)) return true;
  }
  return false;
}
