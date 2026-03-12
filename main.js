const {
  app,           
  BrowserWindow, 
  ipcMain,       
  dialog,        
  Menu,          
  Tray,          
  Notification,  
  nativeImage    
} = require('electron');

const path  = require('node:path');  
const fs    = require('node:fs');     
const Store = require('electron-store'); 

const store = new Store();


let mainWindow; 
let tray;      


function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  createMenu();

  mainWindow.on('close', (event) => {
    event.preventDefault(); 
    mainWindow.hide();     
  });
}


function createTray() {


  const iconPath = path.join(__dirname, 'icon.png');

  const icon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath) 
    : nativeImage.createEmpty();           

  tray = new Tray(icon);

  tray.setToolTip('Mon App Electron');

  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Afficher',
      click: () => mainWindow.show() 
    },
    {
      label: 'Quitter',
      click: () => {
      
        mainWindow.removeAllListeners('close');
        app.quit();
      }
    }
  ]));

  tray.on('double-click', () => mainWindow.show());
}

function createMenu() {

  const menu = Menu.buildFromTemplate([
    {
      label: 'Fichier',     
      submenu: [
        {
          label: 'Ouvrir',
          accelerator: 'CmdOrCtrl+O', 
          click: () => { void openFileDialog(); }
        },
        {
          label: 'Sauvegarder',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-save')
        },
        { type: 'separator' }, 
        { label: 'Quitter', role: 'quit' } 
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo'  }, 
        { role: 'redo'  }, 
        { type: 'separator' },
        { role: 'cut'   }, 
        { role: 'copy'  }, 
        { role: 'paste' }  
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

async function openFileDialog() {


  const result = await dialog.showOpenDialog({
    filters: [{ name: 'Texte', extensions: ['txt'] }], 
    properties: ['openFile'] 
  });

  if (!result.canceled) {
    const filePath = result.filePaths[0]; 

    const content = fs.readFileSync(filePath, 'utf-8');

    mainWindow.webContents.send('file-opened', { content, filePath });

    return filePath; 
  }

  return null; 
}

ipcMain.handle('open-file-dialog', () => openFileDialog());

ipcMain.handle('save-content', async (event, content) => {

  const result = await dialog.showSaveDialog({ defaultPath: 'doc.txt' });

  if (!result.canceled) {
  
    fs.writeFileSync(result.filePath, content);

    new Notification({
      title: 'Terminé',           
      body:  'Fichier sauvegardé.' 
    }).show(); 
  }
});

ipcMain.handle('store-get',    (_e, key, def)   => store.get(key, def));
ipcMain.handle('store-set',    (_e, key, value) => store.set(key, value));
ipcMain.handle('store-delete', (_e, key)        => store.delete(key));

app.whenReady().then(() => {
  createWindow(); 
  createTray();   // Crée l'icône dans la barre système
});
