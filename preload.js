const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('todoAPI', {
  // Tasks
  loadTasks:    ()        => ipcRenderer.invoke('tasks:load'),
  saveTasks:    (tasks)   => ipcRenderer.invoke('tasks:save', tasks),

  // Window controls
  minimize:     ()        => ipcRenderer.send('window:minimize'),
  hide:         ()        => ipcRenderer.send('window:hide'),
  close:        ()        => ipcRenderer.send('window:close'),
  togglePin:    (val)     => ipcRenderer.send('window:togglePin', val),

  // Settings
  getSettings:  ()        => ipcRenderer.invoke('settings:get'),
  setStartup:   (val)     => ipcRenderer.send('settings:setStartup', val),
});
