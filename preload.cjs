const { contextBridge, ipcRenderer } = require('electron/renderer');

// Expõe um objeto 'electron' seguro para a janela de renderização (React)
contextBridge.exposeInMainWorld('electron', {
  // Função que envia mensagens para o processo principal
  send: (channel, data) => {
    // Lista de canais permitidos para maior segurança
    const validChannels = ['minimize-window', 'maximize-window', 'close-window'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
});

