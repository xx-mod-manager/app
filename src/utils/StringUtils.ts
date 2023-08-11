
export function clearUrlArgs(url: string) {
  return url.substring(0, url.indexOf('?'));
}

export function parseResourceAndVersion(name: string): { resourceId: string, assetId: string } {
  if (name.length === 0) throw Error('parse name length is 0.');
  name = name.replace(/\.[z,Z][i,I][p,P]$/, '');
  let assetId: string | undefined = undefined;
  let resourceId = 'ErrorDefaultName';
  const versionRe = /([-,_,\s][v,V]?)?([0-9][0-9,\.]*\.[0-9,\.]*[0-9])/;
  const versionIndex = name.search(versionRe);
  // if index is 0, assetId is empty.
  if (versionIndex > 0) {
    assetId = versionRe.exec(name)?.[2];
    resourceId = name.slice(0, versionIndex).trim();
  } else {
    resourceId = name.trim();
  }
  return { assetId: assetId ?? '0.0.0', resourceId };
}

export function validateVersion(name: string): boolean {
  const versionRe = /^[0-9][0-9,\.]*\.[0-9,\.]*[0-9]$/;
  return versionRe.test(name);
}
