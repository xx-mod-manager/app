import { BrowserWindow, app } from 'electron';
import { File, Progress, download } from 'electron-dl';
import { myLogger } from 'src/boot/logger';
import { notNull } from 'src/utils/CommentUtils';

export async function downloadAndUnzipAsset(url: string, gameId: string, resourceId: string, assetId: string) {
  const win = notNull(BrowserWindow.getFocusedWindow(), 'Foused window');
  myLogger.debug(`Ready download asset:[${gameId}][${resourceId}][${assetId}], url:[${url}]`);
  const assetFullId = gameId + '-' + resourceId + '-' + assetId;
  await download(win, url, { overwrite: true, directory: app.getPath('temp'), onStarted, onProgress, onCompleted });
  function onStarted() {
    win.webContents.send('onDownloadStarted', assetFullId);
  }
  function onProgress(progress: Progress) {
    win.webContents.send('onDownloadProgress', assetFullId, progress);
  }
  function onCompleted(file: File) {
    // unzipAsset(file.path, getGameResourcesPath(gameId), resourceId, assetId);
    win.webContents.send('onDownloadCompleted', assetFullId, file);
  }
}
