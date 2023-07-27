import { ReleaseAsset } from 'src/class/Types';

export function filterReleaseAsset(releaseAssets: ReleaseAsset[]) {
  return releaseAssets.filter((it) => it.contentType == 'application/zip');
}
