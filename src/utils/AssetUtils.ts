import { Asset, AssetStatus, ReleaseAsset } from 'src/class/Types';

export function filterReleaseAsset(releaseAssets: ReleaseAsset[]) {
  return releaseAssets.filter((it) => it.contentType == 'application/zip');
}

export function existLocal(asset: Asset): boolean {
  if (asset.versions.size == 0) return false;
  for (const status of asset.versions.values()) {
    if (status != AssetStatus.NONE) return true;
  }
  return false;
}
