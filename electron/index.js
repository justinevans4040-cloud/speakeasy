const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const iconPath = fs.existsSync(path.join(__dirname, 'dist', 'assets', 'icon-512.png'))
    ? path.join(__dirname, 'dist', 'assets', 'icon-512.png')
    : path.join(__dirname, '..', 'web', 'assets', 'icon-512.png');

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0a0b0d',
    show: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  win.setMenuBarVisibility(false);

  // Security: Intercept window creation to open safe external URLs in system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        shell.openExternal(url);
      }
    } catch (_) {}
    return { action: 'deny' };
  });

  // Security: Intercept navigation attempts
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  // Item 1 Fix: Load packaged electron/dist/index.html with fallback for local dev
  const targetPath = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
    ? path.join(__dirname, 'dist', 'index.html')
    : path.join(__dirname, '..', 'dist', 'index.html');

  win.loadFile(targetPath);
}

app.whenReady().then(() => {
  // Item 3 Fix: Restrict media permission strictly to the local application origin (file://)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (!webContents) {
      return callback(false);
    }
    const requestingUrl = webContents.getURL();
    if (permission === 'media' && requestingUrl && requestingUrl.startsWith('file://')) {
      callback(true);
    } else {
      callback(false);
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
