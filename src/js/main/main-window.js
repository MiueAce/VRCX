const path = require('path');
const { app, BrowserWindow, ipcMain, screen, shell } = require('electron');
const native = require('vrcx-native');
const { APP_ICON } = require('./constants.js');
const interceptWebRequest = require('./intercept-web-request.js');

/** @type {?BrowserWindow} */
var mainWindow_ = null;

function nothing() {
    var overlayWindow = new BrowserWindow({
        width: 512,
        height: 512,
        show: false,
        webPreferences: {
            offscreen: true,
        },
    });
    overlayWindow.webContents.on('paint', function (event, dirtyRect, image) {
        var result = native.setFrameBuffer(0, image.getBitmap());
        if (result !== 0) {
            console.log('native.setFrameBuffer', result);
        }
        if (window_ !== null) {
            // window_.webContents.send('setOverlayImage', {
            //     image: image.toDataURL(),
            // });
        }
    });
    // overlayWindow.loadURL('https://testdrive-archive.azurewebsites.net/performance/fishbowl/');
    overlayWindow.loadURL('https://youtube.com/');
}

function createMainWindow() {
    if (mainWindow_ !== null) {
        return;
    }

    var mainWindow = new BrowserWindow({
        width: 800,
        height: 500,
        minWidth: 400,
        minHeight: 250,
        fullscreenable: false,
        title: 'VRCX',
        icon: APP_ICON,
        frame: false,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'assets/preload.js'),
            sandbox: true,
            defaultEncoding: 'utf-8',
            contextIsolation: false,
            disableDialogs: true,
            autoplayPolicy: 'no-user-gesture-required',
            spellcheck: false,
        },
    });
    mainWindow_ = mainWindow;

    var { webContents } = mainWindow;
    var { session } = webContents;

    webContents.openDevTools();

    // hide fingerprints :p
    webContents.userAgent = webContents.userAgent.replace(/(vrcx|electron)\/.+? /gi, '');

    // bypass CORS
    interceptWebRequest(session.webRequest);

    mainWindow.on('close', function (event) {
        if (app.isForceQuit === true) {
            return;
        }

        event.preventDefault();
        this.hide();
    });

    mainWindow.on('move', function () {
        // var [x, y] = this.getPosition();
        // var [width, height] = this.getSize();
    });

    mainWindow.on('resize', function () {
        // var [x, y] = this.getPosition();
        // var [width, height] = this.getSize();
    });

    mainWindow.on('show', function () {
        var { x: winX, y: winY } = this.getBounds();

        for (var { bounds } of screen.getAllDisplays()) {
            var { height, width, x, y } = bounds;
            if (winX >= x && winX <= x + width && winY >= y && winY <= y + height) {
                // okay, windows in a display
                return;
            }
        }

        this.center();
    });

    webContents.on('did-finish-load', function (event) {
        // reset zoom
        this.setZoomFactor(1);
        this.setZoomLevel(0);
    });

    webContents.on('will-navigate', function (event, url) {
        console.log('will-navigate', url);
        event.preventDefault();
    });

    webContents.setWindowOpenHandler(function ({ url }) {
        console.log('new-window', url);

        shell.openExternal(url);
        return false;
    });

    session.on('will-download', function (event, item, webContents) {
        console.log('will-download', item);
        event.preventDefault();
    });

    // webContents.session.cookies.flushStore();
    // webContents.session.cookies.set({
    //     url: 'https://api.vrchat.cloud/',
    //     name: 'auth',
    //     value: ''
    // });

    mainWindow.loadFile('assets/index.html');
}

function destroyMainWindow() {
    var mainWindow = mainWindow_;
    if (mainWindow === null) {
        return;
    }

    mainWindow_ = null;

    try {
        mainWindow.destroy();
    } catch (err) {
        console.error(err);
    }
}

function sendToMainWindow(channel, ...args) {
    var mainWindow = mainWindow_;
    if (mainWindow === null) {
        return;
    }

    mainWindow.webContents.send(channel, ...args);
}

function activateMainWindow() {
    var mainWindow = mainWindow_;
    if (mainWindow === null) {
        return;
    }

    if (mainWindow.isMinimized() === true) {
        mainWindow.restore();
    }

    mainWindow.show();
    mainWindow.focus();
}

function closeMainWindow() {
    var mainWindow = mainWindow_;
    if (mainWindow === null) {
        return;
    }

    mainWindow.close();
}

function minimizeMainWindow() {
    var mainWindow = mainWindow_;
    if (mainWindow === null) {
        return;
    }

    mainWindow.minimize();
}

function maximizeMainWindow() {
    var mainWindow = mainWindow_;
    if (mainWindow === null) {
        return;
    }

    if (mainWindow.isMaximized() === true) {
        mainWindow.restore();
        return;
    }

    mainWindow.maximize();
}

ipcMain.on('main-window:close', function (event) {
    event.returnValue = null;
    closeMainWindow();
});

ipcMain.on('main-window:minimize', function (event) {
    event.returnValue = null;
    minimizeMainWindow();
});

ipcMain.on('main-window:maximize', function (event) {
    event.returnValue = null;
    maximizeMainWindow();
});

module.exports = {
    createMainWindow,
    destroyMainWindow,
    sendToMainWindow,
    activateMainWindow,
};
