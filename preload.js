/* HALOFLUX 桌面版 preload：向页面暴露安全的窗口控制 API（无 Node 能力泄漏） */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('haloDesktop', {
  minimize: () => ipcRenderer.send('halo:minimize'),
  toggleMaximize: () => ipcRenderer.send('halo:toggleMaximize'),
  close: () => ipcRenderer.send('halo:close'),
  onMaximizeState: cb => {
    ipcRenderer.on('halo:maximize', (_e, st) => cb(st));
  }
});
