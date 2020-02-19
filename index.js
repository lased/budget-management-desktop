const {
  app,
  BrowserWindow
} = require('electron');

let serve = process.argv.slice(1).some(val => val === '--serve');
let win = null;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
  // If serve === true then dev mode
  if (serve) {
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    win.removeMenu();
    win.loadURL(`file://${__dirname}/dist/index.html`);
  }
  // Event when the window is closed.
  win.on('closed', function () {
    win = null;
  })
}

// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow();
  }
})