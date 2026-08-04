const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('speakeasyStore', Object.freeze({
  getStatus: () => ipcRenderer.invoke('license:get-status'),
  openPurchase: (productName) => ipcRenderer.invoke('license:open-purchase', productName),
}));
