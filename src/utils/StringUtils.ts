import { myLogger } from 'src/boot/logger';

export function clearUrlArgs(url: string) {
  return url.substring(0, url.indexOf('?'));
}

export function parseVersion(name: string): string {
  const re = /^[a-z,A-Z,_,0-9]*-?([0-9,.]+).zip$/;
  const result = re.exec(name);
  if (result) return result[1];
  else return '0';
}

export function parseAssetDir(name: string): { assetId: string, version: string } {
  const re = /^([a-z,A-Z,_,0-9]*)-([0-9,.]+)$/;
  const result = re.exec(name);
  if (result) return {
    assetId: result[1], version: result[2]
  };
  else {
    myLogger.warn(`Wrong asset dir name: ${name}`);
    return { assetId: name, version: '0' };
  }
}
