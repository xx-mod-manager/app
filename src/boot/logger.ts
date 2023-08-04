import { boot } from 'quasar/wrappers';
import { LogEvent, LoggerHook, StringifyAndParseObjectsHook, createLogger } from 'vue-logger-plugin';

const ElectronLogHook: LoggerHook = {
  async run(event: LogEvent) {
    if (process !== undefined && process.type === 'browser') {
      const { BrowserWindow } = await import('electron');
      const win = BrowserWindow.getFocusedWindow();
      win?.webContents.send('onElectronLog', event);
    }
  }
};

const myLogger = createLogger({
  enabled: true,
  level: 'debug',
  callerInfo: true,
  beforeHooks: [StringifyAndParseObjectsHook],
  afterHooks: [ElectronLogHook]
});

export default boot(({ app }) => {
  app.use(myLogger);
});

export { myLogger };
