const { app, BrowserWindow, session, shell } = require('electron');
const path = require('path');

const DEV_ORIGIN = 'http://localhost:5173';

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isAllowedAppNavigation(value) {
  const parsed = parseUrl(value);
  if (!parsed) return false;
  if (parsed.protocol === 'file:') return true;
  return process.env.SPEAKEASY_DEV_SERVER === '1' && parsed.origin === DEV_ORIGIN;
}

function openExternalSafely(value) {
  const parsed = parseUrl(value);
  if (!parsed || !['https:', 'http:'].includes(parsed.protocol)) return;
  void shell.openExternal(parsed.toString());
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 760,
    minHeight: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      spellcheck: true,
    },
  });
  win.setMenuBarVisibility(false);
  win.once('ready-to-show', () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternalSafely(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedAppNavigation(url)) {
      event.preventDefault();
      openExternalSafely(url);
    }
  });

  win.webContents.on('will-attach-webview', (event) => event.preventDefault());

  if (process.env.SPEAKEASY_DEV_SERVER === '1') {
    void win.loadURL(DEV_ORIGIN);
  } else {
    void win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.forgefront.speakeasy');
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const requestingUrl = details?.requestingUrl || webContents.getURL();
    callback(permission === 'media' && isAllowedAppNavigation(requestingUrl));
  });
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
