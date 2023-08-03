
export function clearUrlArgs(url: string) {
  return url.substring(0, url.indexOf('?'));
}

export function parseResourceAndVersion(name: string): { resource: string, assetId: string } {
  if (name.length === 0) throw Error('parse name length is 0.');
  name = name.replace(/\.[z,Z][i,I][p,P]$/, '');
  let assetId: string | undefined = undefined;
  let resource = 'ErrorDefaultName';
  const versionRe = /([-,_,\s][v,V]?)?([0-9][0-9,\.]*\.[0-9,\.]*[0-9])/;
  const versionIndex = name.search(versionRe);
  // if index is 0, assetId is empty.
  if (versionIndex > 0) {
    assetId = versionRe.exec(name)?.[2];
    resource = name.slice(0, versionIndex).trim();
  } else {
    resource = name.trim();
  }
  return {
    assetId: assetId ?? '0.0.0', resource
  };
}
