import { notNull } from './CommentUtils';

export async function openDialogSelectDirectory(title: string): Promise<{ name: string; path: string; } | undefined> {
  const electronApi = notNull(window.electronApi, 'ElectronApi');

  const dialogValue = await electronApi.dialog.showOpenDialog({ title, properties: ['openDirectory'] });
  if (dialogValue.filePaths.length > 0) {
    const path = dialogValue.filePaths[0];
    return { name: await electronApi.path.getBasename(path), path };
  } else {
    return undefined;
  }
}

export async function openDialogSelectZipFile(title: string): Promise<{ name: string; path: string; } | undefined> {
  const electronApi = notNull(window.electronApi, 'ElectronApi');

  const dialogValue = await electronApi.dialog.showOpenDialog({ title, properties: ['openFile'], filters: [{ name: 'Zip', extensions: ['zip'] }] });
  if (dialogValue.filePaths.length > 0) {
    const path = dialogValue.filePaths[0];
    return { name: await electronApi.path.getBasename(path), path };
  } else {
    return undefined;
  }
}
