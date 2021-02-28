const { app, BrowserWindow, screen, shell } = require('electron');
const { APP_NAME, APP_PRELOAD_JS, APP_ICON } = require('./constants');
const interceptWebRequest = require('./intercept-webrequest');
const native = require('vrcx-native');

/** @type {?BrowserWindow} */
var window_ = null;

function handleClose(event) {
    if (app.isForceQuit === true) {
        return;
    }
    event.preventDefault();
    window_.hide();
}

function handleMoveOrResize() {
    // var [x, y] = window_.getPosition();
    // var [width, height] = window_.getSize();
}

function handleShow() {
    // ensure window is on a display
    var { x: winX, y: winY } = window_.getBounds();
    for (var {
        bounds: { x, y, width, height },
    } of screen.getAllDisplays()) {
        if (winX >= x && winX <= x + width && winY >= y && winY <= y + height) {
            return;
        }
    }
    window_.center();
}

function handleDidFinishLoad() {
    // reset zoom
    window_.webContents.setZoomFactor(1);
    window_.webContents.setZoomLevel(0);
    window_.webContents.send('vrcx', 'did-finish-load');
}

function handleWillNavigation(event, target) {
    console.log('handleWillNavigation', event, target);
    event.preventDefault();
    shell.openExternal(target);
}

function handleWillDownload(event) {
    console.log('handleWillDownload', event);
    event.preventDefault();
}

function createMainWindow() {
    if (window_ !== null) {
        return;
    }

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

    window_ = new BrowserWindow({
        width: 800,
        height: 500,
        minWidth: 800,
        minHeight: 500,
        fullscreenable: false,
        title: APP_NAME,
        icon: APP_ICON,
        frame: false,
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        webPreferences: {
            preload: APP_PRELOAD_JS,
            // partition: 'persist:vrcx',
            defaultEncoding: 'utf-8',
            spellcheck: false,
        },
    });

    // hide unnecessary things :p
    window_.webContents.userAgent = window_.webContents.userAgent.replace(/(vrcx|electron)\/.+? /gi, '');

    // bypass CORS
    interceptWebRequest(window_.webContents.session.webRequest);

    window_.on('close', handleClose);
    window_.on('move', handleMoveOrResize);
    window_.on('resize', handleMoveOrResize);
    window_.on('show', handleShow);
    window_.webContents.on('did-finish-load', handleDidFinishLoad);
    window_.webContents.on('new-window', handleWillNavigation);
    window_.webContents.on('will-navigate', handleWillNavigation);
    window_.webContents.session.on('will-download', handleWillDownload);

    // mainWindow_.webContents.session.cookies.flushStore();
    // mainWindow_.webContents.session.cookies.set({
    //     url: 'https://api.vrchat.cloud/',
    //     name: 'auth',
    //     value: ''
    // });

    window_.webContents.openDevTools();
    window_.loadFile('assets/index.html');
}

function activateMainWindow() {
    if (window_ === null) {
        return;
    }
    if (window_.isMinimized() === true) {
        window_.restore();
    }
    window_.show();
    window_.focus();
}

function minimizeMainWindow() {
    window_.minimize();
}

function maximizeMainWindow() {
    if (window_.isMaximized() === true) {
        window_.restore();
    } else {
        window_.maximize();
    }
}

function closeMainWindow() {
    window_.close();
}

module.exports = {
    createMainWindow,
    activateMainWindow,
    minimizeMainWindow,
    maximizeMainWindow,
    closeMainWindow,
};
