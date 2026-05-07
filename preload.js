const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('todoAPI', {
  // Tasks
  loadTasks: () => ipcRenderer.invoke('tasks:load'),
  saveTasks: (tasks) => ipcRenderer.invoke('tasks:save', tasks),
  // Window
  minimize: () => ipcRenderer.send('window:minimize'),
  hide: () => ipcRenderer.send('window:hide'),
  close: () => ipcRenderer.send('window:close'),
  // Pin original
  togglePin: (val) => ipcRenderer.send('window:togglePin', val),
  // Pin 3-state
  setPinState: (state) => ipcRenderer.send('window:setPinState', state),
  // Collapse
  setCollapsed: (val) => ipcRenderer.send('window:setCollapsed', val),
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setStartup: (val) => ipcRenderer.send('settings:setStartup', val),
  // Movable
  setMovable: (val) => ipcRenderer.send('window:setMovable', val),
  // Shortcuts
  registerGlobalShortcut: (accelerator) => ipcRenderer.send('shortcut:setGlobal', accelerator),
  getGlobalShortcut: () => ipcRenderer.invoke('shortcut:getGlobal'),
  // Link
  openExternal: (url) => ipcRenderer.send('window:openExternal', url),
});