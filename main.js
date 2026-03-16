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
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABQSURBVFhH7c4xAQAgDACh+jd9UgIOJBDs3AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBcqNAABHgABHgABHgABHgABHgAAAABJRU5ErkJggg=='
  );

  tray = new Tray(icon);
  tray.setToolTip('TodoFloat');

  const contextMenu = Menu.buildFromTemplate([
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

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (!mainWindow) { createWindow(); return; }
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});

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
