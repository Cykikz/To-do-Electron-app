const { app, BrowserWindow, ipcMain, Tray, Menu, screen, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let tray;

function getSavedBounds() {
  const display = screen.getPrimaryDisplay().workAreaSize;
  return store.get('windowBounds', {
    x: display.width - 340,
    y: 100,
    width: 320,
    height: 600
  });
}

function createWindow() {
  const bounds = getSavedBounds();

  mainWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    minWidth: 280,
    minHeight: 400,
    maxWidth: 480,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: store.get('alwaysOnTop', true),
    skipTaskbar: false,
    hasShadow: true,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  ['move', 'resize'].forEach(evt => {
    mainWindow.on(evt, () => {
      if (!mainWindow.isMinimized()) {
        store.set('windowBounds', mainWindow.getBounds());
      }
    });
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function createTray() {
  const iconB64 = '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';
  const icon = nativeImage.createFromDataURL('data:image/png;base64,' + iconB64);
  const trayIcon = icon.resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('TodoFloat');

  const updateMenu = () => Menu.buildFromTemplate([
    {
      label: 'Show / Hide',
      click: () => {
        if (!mainWindow) { createWindow(); return; }
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: store.get('alwaysOnTop', true),
      click: (item) => {
        store.set('alwaysOnTop', item.checked);
        if (mainWindow) mainWindow.setAlwaysOnTop(item.checked);
      }
    },
    { type: 'separator' },
    {
      label: 'Start with Windows',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        app.setLoginItemSettings({ openAtLogin: item.checked });
      }
    },
    { type: 'separator' },
    { label: 'Quit TodoFloat', click: () => app.quit() }
  ]);

  tray.setContextMenu(updateMenu());

  tray.on('double-click', () => {
    if (!mainWindow) { createWindow(); return; }
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', (e) => { e.preventDefault(); });
app.on('activate', () => { if (!mainWindow) createWindow(); });

ipcMain.handle('tasks:load', () => store.get('tasks', []));
ipcMain.handle('tasks:save', (_, tasks) => { store.set('tasks', tasks); return true; });

ipcMain.on('window:minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window:hide',     () => mainWindow && mainWindow.hide());
ipcMain.on('window:close',    () => app.quit());

ipcMain.on('window:togglePin', (_, val) => {
  store.set('alwaysOnTop', val);
  if (mainWindow) mainWindow.setAlwaysOnTop(val);
});

ipcMain.handle('settings:get', () => ({
  alwaysOnTop: store.get('alwaysOnTop', true),
  openAtLogin: app.getLoginItemSettings().openAtLogin
}));

ipcMain.on('settings:setStartup', (_, val) => {
  app.setLoginItemSettings({ openAtLogin: val });
});
