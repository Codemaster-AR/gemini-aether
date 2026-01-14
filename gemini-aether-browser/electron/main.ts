
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'node:path';

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];


function createWindow() {
  win = new BrowserWindow({
    icon: path.join(__dirname, '../../public/electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  // Open the DevTools.
  win.webContents.openDevTools();

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // Intercept new window requests from webContents (including webviews)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      // Send the URL to the renderer process to be handled by the webview
      win?.webContents.send('navigate-webview', url);
      return { action: 'deny' }; // Deny opening a new BrowserWindow
    }
    return { action: 'deny' }; // Deny opening other types of windows
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

