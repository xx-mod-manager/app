import { parseResourceAndVersion } from 'src/utils/StringUtils';
import { ApiReleaseAsset } from './GraphqlClass';

export enum AssetStatus {
  NONE = 'none', DOWNLOADED = 'downloaded', INTALLED = 'intalled'
}

export class Asset {
  readonly id: string;
  status: AssetStatus;
  nodeId?: string;
  downloadUrl?: string;

  constructor({ id, status, nodeId, downloadUrl }: { id: string; status: AssetStatus; nodeId?: string; downloadUrl?: string; }) {
    this.id = id;
    this.status = status;
    this.nodeId = nodeId;
    this.downloadUrl = downloadUrl;
  }

  static newByApiReleaseAsset(apiReleaseAsset: ApiReleaseAsset): Asset {
    const { assetId } = parseResourceAndVersion(apiReleaseAsset.name);
    return new Asset({
      id: assetId,
      status: AssetStatus.NONE,
      downloadUrl: apiReleaseAsset.downloadUrl,
      nodeId: apiReleaseAsset.id
    });
  }

  clearApiReleaseAssetData() {
    this.nodeId = undefined;
    this.downloadUrl = undefined;
  }

  updateApiReleaseAsset(apiReleaseAsset: ApiReleaseAsset) {
    this.downloadUrl = apiReleaseAsset.downloadUrl;
    this.nodeId = apiReleaseAsset.id;
  }

  isLocal(): boolean {
    return this.status != AssetStatus.NONE;
  }

  isOnline(): boolean {
    return this.nodeId != undefined && this.downloadUrl != undefined;
  }
}
