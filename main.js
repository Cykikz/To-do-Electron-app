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
    minHeight: 46,
    maxWidth: 560,
    frame: false,
    transparent: false,
    backgroundColor: '#17171d',
    resizable: true,
    movable: true,
    alwaysOnTop: store.get('alwaysOnTop', true),
    skipTaskbar: false,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
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
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
  const trayIcon = icon.resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('TodoFloat');

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
      label: 'Start with Windows',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        app.setLoginItemSettings({ openAtLogin: item.checked });
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

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', (e) => { e.preventDefault(); });
app.on('activate', () => { if (!mainWindow) createWindow(); });

// Tasks
ipcMain.handle('tasks:load', () => store.get('tasks', []));
ipcMain.handle('tasks:save', (_, tasks) => { store.set('tasks', tasks); return true; });

// Window
ipcMain.on('window:minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window:hide', () => mainWindow && mainWindow.hide());
ipcMain.on('window:close', () => app.quit());

// Pin — original (kept as-is)
ipcMain.on('window:togglePin', (_, val) => {
  store.set('alwaysOnTop', val);
  if (mainWindow) mainWindow.setAlwaysOnTop(val);
});

// Pin — 3 states (NEW)
// state 0 = normal        (alwaysOnTop OFF, movable ON)
// state 1 = pinned        (alwaysOnTop ON,  movable ON)
// state 2 = locked        (alwaysOnTop ON,  movable OFF)
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

// Movable — original (kept as-is)
ipcMain.on('window:setMovable', (_, val) => {
  if (mainWindow) mainWindow.setMovable(val);
});

// Collapse — original (kept as-is)
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

// Settings
ipcMain.handle('settings:get', () => ({
  alwaysOnTop: store.get('alwaysOnTop', true),
  pinState: store.get('pinState', 1),
  openAtLogin: app.getLoginItemSettings().openAtLogin,
  collapsed: store.get('collapsed', false)
}));

ipcMain.on('settings:setStartup', (_, val) => {
  app.setLoginItemSettings({ openAtLogin: val });
});

// ── Notifications ─────────────────────────────────────────────────────────
const { Notification } = require('electron');
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

  // ── Daily 9 AM summary ──────────────────────────────────────────────────
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
      n.on('click', () => {
        if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
      });
      n.show();
    }
  }

  tasks.forEach(t => {
    if (t.done || !t.dueTs) return;
    const dueDate = new Date(t.dueTs);
    const isToday = dueDate.getFullYear() === now.getFullYear()
      && dueDate.getMonth() === now.getMonth()
      && dueDate.getDate() === now.getDate();

    // ── 12 AM reminder — fires after midnight if task is due today ─────────
    if (isToday && now.getHours() >= 0) {
      fireNotif(
        'TodoFloat — Due Today',
        `"${t.title}" is due today`,
        t.id, 'midnight'
      );
    }

    // ── 4 hour advance warning ─────────────────────────────────────────────
    const fourHoursBefore = t.dueTs - (4 * 60 * 60 * 1000);
    if (nowTs >= fourHoursBefore && nowTs < t.dueTs) {
      const minsLeft = Math.round((t.dueTs - nowTs) / 60000);
      fireNotif(
        'TodoFloat — Due Soon',
        `"${t.title}" is due in ${minsLeft} mins`,
        t.id, '4hr'
      );
    }

    // ── At due time ────────────────────────────────────────────────────────
    if (nowTs >= t.dueTs && nowTs < t.dueTs + 60000) {
      fireNotif(
        'TodoFloat — Task Due Now',
        `"${t.title}" is due now`,
        t.id, 'due'
      );
    }
  });
}

setInterval(checkDueNotifications, 30 * 1000);
app.whenReady().then(() => {
  setTimeout(checkDueNotifications, 5000);
});

// ── Global Shortcut ───────────────────────────────────────────────────────
const { globalShortcut } = require('electron');

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

app.whenReady().then(() => {
  const saved = store.get('globalShortcut', 'CommandOrControl+Shift+T');
  registerShowShortcut(saved);
});

app.on('will-quit', () => globalShortcut.unregisterAll());

ipcMain.on('shortcut:setGlobal', (_, accelerator) => {
  store.set('globalShortcut', accelerator);
  registerShowShortcut(accelerator);
});

ipcMain.handle('shortcut:getGlobal', () => {
  return store.get('globalShortcut', 'CommandOrControl+Shift+T');
});

const { shell } = require('electron');
ipcMain.on('window:openExternal', (_, url) => {
  shell.openExternal(url);
});