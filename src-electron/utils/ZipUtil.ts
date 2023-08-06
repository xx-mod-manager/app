import AdmZip from 'adm-zip';
import { join as pathJoin } from 'path';
import { deleteArrayItemByIndex } from 'src/utils/ArrayUtils';

function getTargetPath(targetPath: string, nestedPath: string | undefined, entry: AdmZip.IZipEntry) {
  const entryName = nestedPath == undefined ? entry.entryName : entry.entryName.replace(nestedPath, '');
  const paths = entryName.split('/');
  deleteArrayItemByIndex(paths, paths.length - 1);
  return pathJoin(targetPath, ...paths);
}

function getNestedPath(entries: AdmZip.IZipEntry[]): string | undefined {
  const result = entries[0];
  if (result.isDirectory) {
    for (const entry of entries) {
      if (!entry.entryName.startsWith(result.entryName))
        return undefined;
    }
    return result.entryName;
  } else {
    return undefined;
  }
}

export function unzipAsset(zipPath: string, targetPath: string) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  const nestedPath = getNestedPath(entries);
  for (const entry of entries) {
    if (!entry.isDirectory) {
      const targetFinalPath = getTargetPath(targetPath, nestedPath, entry);
      zip.extractEntryTo(entry.entryName, targetFinalPath, false, true);
    }
  }
}
