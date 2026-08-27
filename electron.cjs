const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron/main');
const path = require('node:path');

// Variável global para manter a referência da janela principal e do tray
let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: 'hidden',
    show: false, // Oculta a janela até que esteja pronta para evitar o 'piscar branco'
    backgroundColor: '#1D1E22', // Define a cor de fundo nativa para a cor do seu app
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
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Só mostra a tela quando o React/HTML estiverem renderizados em memória
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Intercepta o evento de fechamento para não destruir a janela, apenas escondê-la
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // Nota: sufixo 'Template' no macOS significa que a cor do ícone
  // se adapta ao modo claro/escuro do sistema
  const iconPath = path.join(__dirname, 'public', 'tray-iconTemplate.png');

  // Usar nativeImage nos permite gerenciar o redimensionamento de forma mais nativa
  let nImage = require('electron/main').nativeImage.createFromPath(iconPath);
  nImage = nImage.resize({ height: 16 }); // 16px de altura é o padrão nativo ideal do macOS menu bar
  nImage.setTemplateImage(true);

  tray = new Tray(nImage);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Configurações',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('open-settings');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Sidy Calculator/Notes');

  // IMPORTANTE: NÃO definimos tray.setContextMenu(contextMenu) aqui no macOS
  // pois isso força o clique esquerdo a sempre abrir o menu e previne o evento 'click'.
  // Em vez disso, capturamos o right-click para abrir o menu manualmente.

  // Clique esquerdo: Apenas Mostra ou Oculta o aplicativo rapidamente
  tray.on('click', () => {
    if (mainWindow.isVisible() && mainWindow.isFocused()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Clique direito: Abre o menu de contexto com Configurações e Sair
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });
}

// --- Listeners de Eventos do IPC ---
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    if (process.platform === 'darwin') {
      mainWindow.hide(); // No macOS de menu bar hides em vez de minimizar padrão
    } else {
      mainWindow.minimize();
    }
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
    mainWindow.hide(); // Oculta a janela em vez de fechar a app
  }
});

ipcMain.on('set-always-on-top', (_event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(Boolean(flag), 'floating');
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });

  if (process.platform === 'darwin') {
    app.dock.hide(); // Oculta o ícone da dock do macOS, pois agora é um app de Tray
  }
});

app.on('window-all-closed', () => {
  // A aplicação continua correndo porque é um app de Tray
});

