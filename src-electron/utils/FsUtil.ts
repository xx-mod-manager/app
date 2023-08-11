import { StatOptions, promises as fsPromises } from 'fs';
import { FileState } from 'src/class/Types';

export async function getState(path: string, opts?: StatOptions): Promise<FileState> {
  const stat = await fsPromises.stat(path, opts);
  return { isFile: stat.isFile(), isDirectory: stat.isDirectory(), isSymbolicLink: stat.isSymbolicLink(), size: stat.size };
}

export async function getLstate(path: string, opts?: StatOptions): Promise<FileState> {
  const stat = await fsPromises.lstat(path, opts);
  return { isFile: stat.isFile(), isDirectory: stat.isDirectory(), isSymbolicLink: stat.isSymbolicLink(), size: stat.size };
}
