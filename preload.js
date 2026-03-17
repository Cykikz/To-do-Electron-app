const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('todoAPI', {
  // Tasks
  loadTasks: () => ipcRenderer.invoke('tasks:load'),
  saveTasks: (tasks) => ipcRenderer.invoke('tasks:save', tasks),

  // Window
  minimize: () => ipcRenderer.send('window:minimize'),
  hide: () => ipcRenderer.send('window:hide'),
  close: () => ipcRenderer.send('window:close'),

  // Pin — invoke so we can await confirmation
  togglePin: (val) => ipcRenderer.send('window:togglePin', val),

  // Collapse
  setCollapsed: (val) => ipcRenderer.send('window:setCollapsed', val),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setStartup: (val) => ipcRenderer.send('settings:setStartup', val),
});