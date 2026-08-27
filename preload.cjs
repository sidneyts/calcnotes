const { contextBridge, ipcRenderer } = require('electron/renderer');

// Expõe um objeto 'electron' seguro para a janela de renderização (React)
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform, // Expor a plataforma para UI condicionada ao SO (ex: esconder botões windows no mac)
  // Função que envia mensagens para o processo principal
  send: (channel, data) => {
    // Lista de canais permitidos para maior segurança
    const validChannels = ['minimize-window', 'maximize-window', 'close-window', 'set-always-on-top'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // Ouve eventos vindo do main process e aciona o callback no React
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', () => callback()),
});

