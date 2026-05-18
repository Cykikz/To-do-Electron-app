const { app, BrowserWindow, ipcMain, Tray, Menu, screen, nativeImage, shell, globalShortcut, Notification } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;
let tray;

// ── Platform-aware icon ───────────────────────────────────────────────────
function getIcon() {
  if (process.platform === 'darwin') return path.join(__dirname, 'assets', 'icon.icns');
  if (process.platform === 'linux') return path.join(__dirname, 'assets', 'icon.png');
  return path.join(__dirname, 'assets', 'icon.ico');
}

function getSavedBounds() {
  const display = screen.getPrimaryDisplay().workAreaSize;
  return store.get('windowBounds', {
    x: display.width - 380,
    y: 100,
    width: 360,
    height: 620
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
    minHeight: 46,
    maxWidth: 560,
    frame: false,
    transparent: false,
    backgroundColor: '#17171d',
    resizable: true,
    movable: true,
    alwaysOnTop: store.get('alwaysOnTop', true),
    skipTaskbar: false,
    icon: getIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('focus', () => {
    if (store.get('alwaysOnTop', true)) {
      mainWindow.setAlwaysOnTop(true);
    }
  });
  mainWindow.on('resize', () => {
    if (!mainWindow.isMinimized() && !store.get('collapsed', false)) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  });
  mainWindow.on('move', () => {
    store.set('windowBounds', mainWindow.getBounds());
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createTray() {
  const iconPath = process.platform === 'linux'
    ? path.join(__dirname, 'assets', 'icon.png')
    : path.join(__dirname, 'assets', process.platform === 'darwin' ? 'icon.png' : 'icon.png');

  const icon = nativeImage.createFromPath(iconPath);
  const trayIcon = icon.resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('TodoFloat');

  const startupLabel = process.platform === 'darwin' ? 'Start with macOS' :
    process.platform === 'linux' ? 'Start with Linux' :
      'Start with Windows';

  const buildMenu = () => Menu.buildFromTemplate([
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
        tray.setContextMenu(buildMenu());
      }
    },
    { type: 'separator' },
    {
      label: startupLabel,
      type: 'checkbox',
      checked: getStartupEnabled(),
      click: (item) => {
        setStartup(item.checked);
        tray.setContextMenu(buildMenu());
      }
    },
    { type: 'separator' },
    { label: 'Quit TodoFloat', click: () => app.quit() }
  ]);

  tray.setContextMenu(buildMenu());
  tray.on('double-click', () => {
    if (!mainWindow) { createWindow(); return; }
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// ── Cross-platform startup ────────────────────────────────────────────────
function getStartupEnabled() {
  if (process.platform === 'linux') {
    const desktopFile = path.join(os.homedir(), '.config', 'autostart', 'todofloat.desktop');
    return fs.existsSync(desktopFile);
  }
  return app.getLoginItemSettings().openAtLogin;
}

function setStartup(val) {
  if (process.platform === 'linux') {
    const autostartDir = path.join(os.homedir(), '.config', 'autostart');
    const desktopFile = path.join(autostartDir, 'todofloat.desktop');
    if (val) {
      const content = [
        '[Desktop Entry]',
        'Type=Application',
        'Name=TodoFloat',
        `Exec=${process.execPath}`,
        'Hidden=false',
        'NoDisplay=false',
        'X-GNOME-Autostart-enabled=true'
      ].join('\n') + '\n';
      try {
        fs.mkdirSync(autostartDir, { recursive: true });
        fs.writeFileSync(desktopFile, content);
      } catch (e) { console.log('Autostart write error:', e); }
    } else {
      try { fs.unlinkSync(desktopFile); } catch (e) { }
    }
    return;
  }
  app.setLoginItemSettings({ openAtLogin: val });
}

// ── App ready ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // Windows notification app ID
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.todo.sidebar');
  }
  createWindow();
  createTray();
  setTimeout(checkDueNotifications, 5000);
  const saved = store.get('globalShortcut', 'CommandOrControl+Shift+T');
  registerShowShortcut(saved);
});

app.on('window-all-closed', (e) => { e.preventDefault(); });
app.on('activate', () => { if (!mainWindow) createWindow(); });
app.on('will-quit', () => globalShortcut.unregisterAll());

// ── Tasks ─────────────────────────────────────────────────────────────────
ipcMain.handle('tasks:load', () => store.get('tasks', []));
ipcMain.handle('tasks:save', (_, tasks) => { store.set('tasks', tasks); return true; });

// ── Window ────────────────────────────────────────────────────────────────
ipcMain.on('window:minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window:hide', () => mainWindow && mainWindow.hide());
ipcMain.on('window:close', () => app.quit());

ipcMain.on('window:togglePin', (_, val) => {
  store.set('alwaysOnTop', val);
  if (mainWindow) mainWindow.setAlwaysOnTop(val);
});

ipcMain.on('window:setPinState', (_, state) => {
  store.set('pinState', state);
  if (!mainWindow) return;
  if (state === 0) {
    store.set('alwaysOnTop', false);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setMovable(true);
  } else if (state === 1) {
    store.set('alwaysOnTop', true);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setMovable(true);
  } else if (state === 2) {
    store.set('alwaysOnTop', true);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setMovable(false);
  }
});

ipcMain.on('window:setMovable', (_, val) => {
  if (mainWindow) mainWindow.setMovable(val);
});

ipcMain.on('window:setCollapsed', (_, collapsed) => {
  if (!mainWindow) return;
  store.set('collapsed', collapsed);
  const bounds = mainWindow.getBounds();
  if (collapsed) {
    store.set('expandedHeight', bounds.height);
    store.set('expandedWidth', bounds.width);
    mainWindow.setResizable(false);
    mainWindow.setMinimumSize(280, 46);
    mainWindow.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: 46 }, true);
  } else {
    const h = store.get('expandedHeight', 600);
    const w = store.get('expandedWidth', 320);
    mainWindow.setMinimumSize(280, 46);
    mainWindow.setBounds({ x: bounds.x, y: bounds.y, width: w, height: h }, true);
    mainWindow.setResizable(true);
  }
});

ipcMain.on('window:openExternal', (_, url) => {
  shell.openExternal(url);
});

// ── Settings ──────────────────────────────────────────────────────────────
ipcMain.handle('settings:get', () => ({
  alwaysOnTop: store.get('alwaysOnTop', true),
  pinState: store.get('pinState', 1),
  openAtLogin: getStartupEnabled(),
  collapsed: store.get('collapsed', false)
}));

ipcMain.on('settings:setStartup', (_, val) => {
  setStartup(val);
});

// ── Notifications ─────────────────────────────────────────────────────────
const notifiedIds = new Set();

function fireNotif(title, body, taskId, type) {
  const key = `${taskId}-${type}`;
  if (notifiedIds.has(key)) return;
  notifiedIds.add(key);
  const n = new Notification({ title, body, silent: false });
  n.on('click', () => {
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
  });
  n.show();
}

function checkDueNotifications() {
  const tasks = store.get('tasks', []);
  const now = new Date();
  const nowTs = now.getTime();

  const todayKey = `daily-summary-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  if (now.getHours() >= 9 && !notifiedIds.has(todayKey)) {
    const dueToday = tasks.filter(t => {
      if (t.done || !t.dueTs) return false;
      const d = new Date(t.dueTs);
      return d.getFullYear() === now.getFullYear()
        && d.getMonth() === now.getMonth()
        && d.getDate() === now.getDate();
    });
    if (dueToday.length > 0) {
      notifiedIds.add(todayKey);
      const n = new Notification({
        title: 'TodoFloat — Daily Summary',
        body: `You have ${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today`,
        silent: false
      });
      n.on('click', () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } });
      n.show();
    }
  }

  tasks.forEach(t => {
    if (t.done || !t.dueTs) return;
    const dueDate = new Date(t.dueTs);
    const isToday = dueDate.getFullYear() === now.getFullYear()
      && dueDate.getMonth() === now.getMonth()
      && dueDate.getDate() === now.getDate();

    if (isToday && now.getHours() >= 0) {
      fireNotif('TodoFloat — Due Today', `"${t.title}" is due today`, t.id, 'midnight');
    }

    const fourHoursBefore = t.dueTs - (4 * 60 * 60 * 1000);
    if (nowTs >= fourHoursBefore && nowTs < t.dueTs) {
      const minsLeft = Math.round((t.dueTs - nowTs) / 60000);
      fireNotif('TodoFloat — Due Soon', `"${t.title}" is due in ${minsLeft} mins`, t.id, '4hr');
    }

    if (nowTs >= t.dueTs && nowTs < t.dueTs + 60000) {
      fireNotif('TodoFloat — Task Due Now', `"${t.title}" is due now`, t.id, 'due');
    }
  });
}

setInterval(checkDueNotifications, 30 * 1000);

// ── Global Shortcut ───────────────────────────────────────────────────────
function registerShowShortcut(accelerator) {
  globalShortcut.unregisterAll();
  try {
    globalShortcut.register(accelerator, () => {
      if (!mainWindow) { createWindow(); return; }
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (e) {
    console.log('Invalid shortcut:', accelerator);
  }
}

ipcMain.on('shortcut:setGlobal', (_, accelerator) => {
  store.set('globalShortcut', accelerator);
  registerShowShortcut(accelerator);
});

ipcMain.handle('shortcut:getGlobal', () => {
  return store.get('globalShortcut', 'CommandOrControl+Shift+T');
});