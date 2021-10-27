import {app, BrowserWindow, ipcMain} from 'electron'
import '../renderer/store'


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 500,
        minWidth: 500,
        resizable: false
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    if (process.env.NODE_ENV === 'development') {
        BrowserWindow.addDevToolsExtension('C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\nhdogjmejiglipccpnnnanhbledajbpd\\5.3.4_0')
    }

    mainWindow.webContents.on('did-finish-load', () => {
        let fs = require('fs');
        fs.readFile('./save.json', function (error, data) {
            if (error) {
                console.log('读取文件失败了')
            } else {
                let json = data.toString()
                let records = JSON.parse(json);
                mainWindow.webContents.send('initRecordData', records);
            }
        })
    })

    mainWindow.on('resize', function (event, args) {
        console.log(mainWindow.getBounds());
    });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('syncRecordData', function (event, args) {
    let fs = require('fs')
    fs.writeFile('./save.json', JSON.stringify(args), function () {
    })
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
