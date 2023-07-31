import { ApiReleaseAsset } from 'src/class/GraphqlClass';
import { Asset, AssetStatus, ReleaseAsset } from 'src/class/Types';
import { parseVersion } from './StringUtils';


export function newOnlineAsset(apiReleaseAsset: ApiReleaseAsset): Asset {
  const version = parseVersion(apiReleaseAsset.name);
  const asset: Asset = {
    id: version,
    status: AssetStatus.NONE,
    downloadUrl: apiReleaseAsset.downloadUrl,
    nodeId: apiReleaseAsset.id
  };
  return asset;
}

export function newInstalledAsset(id: string): Asset {
  const asset: Asset = {
    id,
    status: AssetStatus.INTALLED,
  };
  return asset;
}

export function newDownloadedAsset(id: string): Asset {
  const asset: Asset = {
    id,
    status: AssetStatus.DOWNLOADED,
  };
  return asset;
}

export function updateOnlineAsset(oldAsset: Asset, onlineAsset: Asset) {
  if (oldAsset.id != onlineAsset.id)
    throw Error(`updateOnlineAsset asset id different, [${oldAsset.id}] and [${onlineAsset.id}].`);
  oldAsset.downloadUrl = onlineAsset.downloadUrl;
}

export function existLocalAsset(asset: Asset): boolean {
  return asset.status != AssetStatus.NONE;
}

export function existOnlineAsset(asset: Asset): boolean {
  return asset.nodeId != undefined && asset.downloadUrl != undefined;
}

export function filterReleaseAsset(releaseAssets: ReleaseAsset[]): ReleaseAsset[] {
  return releaseAssets.filter((it) => it.contentType == 'application/zip');
}
