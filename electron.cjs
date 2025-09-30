const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');

// Variável global para manter a referência da janela principal
let mainWindow;

function createWindow() {
  // Atribui a nova janela à variável global
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // Remove a moldura padrão da janela
    titleBarStyle: 'hidden', // Importante para um visual limpo no macOS
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Corrigido o caminho para o build de produção
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

// --- Listeners de Eventos do IPC ---
// Devem estar no escopo principal para aceder à `mainWindow`

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});


// --- Ciclo de Vida da Aplicação ---
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

