const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const STORE_PRODUCTS = Object.freeze({
  monthly: 'speakeasy_monthly',
  lifetime: 'speakeasy_lifetime',
});

function demoLicense(reason) {
  return {
    access: 'demo',
    entitlement: null,
    products: {},
    reason,
  };
}

function readStoreLicense() {
  if (process.platform !== 'win32') {
    return Promise.resolve(demoLicense('Microsoft Store licensing is available in the packaged Windows app.'));
  }

  const scriptPath = path.join(__dirname, 'store-license.ps1');
  return new Promise((resolve) => {
    const child = spawn('powershell.exe', [
      '-NoLogo',
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath,
    ], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => resolve(demoLicense(error.message)));
    child.on('close', (code) => {
      if (code !== 0) {
        resolve(demoLicense(stderr.trim() || `Microsoft Store license check exited with code ${code}.`));
        return;
      }
      try {
        const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
        const result = JSON.parse(lines.at(-1));
        resolve(result && typeof result === 'object' ? result : demoLicense('No Store license was returned.'));
      } catch (error) {
        resolve(demoLicense(`Microsoft Store license response was invalid: ${error.message}`));
      }
    });
  });
}

ipcMain.handle('license:get-status', () => readStoreLicense());
ipcMain.handle('license:open-purchase', async (_event, productName) => {
  if (!Object.hasOwn(STORE_PRODUCTS, productName)) {
    return { ok: false, message: 'Unknown SpeakEasy product.' };
  }
  const state = await readStoreLicense();
  const product = state.products?.[productName];
  if (!product?.storeId) {
    return { ok: false, message: 'This purchase is not available from Microsoft Store yet.' };
  }
  await shell.openExternal(`ms-windows-store://pdp/?productid=${encodeURIComponent(product.storeId)}`);
  return { ok: true };
});

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
      preload: path.join(__dirname, 'preload.js'),
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
