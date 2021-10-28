import {app, BrowserWindow, ipcMain, Menu, MenuItem, Tray, Notification, globalShortcut} from 'electron'
import path from 'path';
import '../renderer/store'
import config from '../config'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
let tray = null;
let mainWindow;
let isMac = process.platform == 'darwin';
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

const menu = new Menu()
menu.append(new MenuItem({
    label: 'Electron',
    submenu: [{
        role: 'help',
        label: '退出程序',
        accelerator: process.platform === 'darwin' ?
            config.shortcut_key.mac.quit : config.shortcut_key.win.quit,
        click: () => {
            app.quit()
        }
    }]
}))

Menu.setApplicationMenu(menu)

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 700,
        useContentSize: true,
        width: 500,
        minWidth: 500,
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    if (process.env.NODE_ENV === 'development') {
        // window系统加载vue开发工具
        if (process.platform == 'win32') {
            BrowserWindow.addDevToolsExtension('C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\nhdogjmejiglipccpnnnanhbledajbpd\\5.3.4_0')
        }
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
}

function openMessage(title, content, callback = null) {
    let msg = new Notification({title: title, body: content});

    if (!callback) {
        msg.onclick = callback;
    }

    msg.show();
}

app.on('ready', () => {
    globalShortcut.register(isMac ? config.shortcut_key.mac.show : config.shortcut_key.win.show, () => {
        if (mainWindow != null) {
            mainWindow.show();
        } else {
            createWindow();
        }
    })

    let showKey = isMac ? config.shortcut_key.mac.show : config.shortcut_key.win.show;

    openMessage('cpdd', '程序已启动,并运行在后台,双击托盘图标或' + showKey + '显示界面!');

    let iconPath = path.join(__static, 'clipboard.ico');
    console.log(iconPath);
    tray = new Tray(iconPath);
    // const contextMenu = Menu.buildFromTemplate([
    //     {label: 'Item1', type: 'radio'},
    //     {label: 'Item2', type: 'radio'},
    //     {label: 'Item3', type: 'radio', checked: true},
    //     {label: 'Item4', type: 'radio'}
    // ])

    tray.setToolTip('cpdd 剪贴板')
    // tray.setContextMenu(contextMenu)

    tray.on('double-click', function (event, bounds) {
        if (mainWindow != null) {
            mainWindow.show();
        } else {
            createWindow();
        }
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // app.quit()
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
