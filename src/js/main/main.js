const { app, ipcMain } = require('electron');
const { APP_NAME } = require('./constants');
const {
    createMainWindow,
    activateMainWindow,
    minimizeMainWindow,
    maximizeMainWindow,
    closeMainWindow,
} = require('./main-window');
const { createTrayMenu, destroyTrayMenu } = require('./tray-menu');
const native = require('vrcx-native');

console.log('sample', native.sample());
console.log('sum', native.sum(1, 2, 3, 4, 5, '6'));

(function () {
    app.setName(APP_NAME);
    app.setAppUserModelId('moe.pypy.vrcx');

    if (app.requestSingleInstanceLock() === false) {
        app.quit();
        return;
    }

    // for better performance to offscreen rendering
    app.disableHardwareAcceleration();

    ipcMain.on('vrcx', function (event, ...args) {
        console.log('ipcMain.on(vrcx)', args);
        var params = args[0];
        console.log('params', params);
        if (Array.isArray(params) === true) {
            switch (params[0]) {
                case 'minimize-window':
                    minimizeMainWindow();
                    break;
                case 'maximize-window':
                    maximizeMainWindow();
                    break;
                case 'close-window':
                    closeMainWindow();
                    break;
            }
        }
        // sendSync를 쓰는거 아니면 딱히
        // event.reply('vrcx', ...args);
    });

    ipcMain.handle('vrcx', function (event, ...args) {
        console.log('ipcMain.handle(vrcx)', args);
        return args;
    });

    if (process.platform === 'darwin') {
        app.on('before-quit', function () {
            app.isForceQuit = true;
        });
    }

    app.on('ready', function () {
        createMainWindow();
        createTrayMenu();
    });

    app.on('second-instance', function () {
        activateMainWindow();
    });

    app.on('activate', function () {
        activateMainWindow();
    });

    app.on('will-quit', function () {
        destroyTrayMenu();
    });
})();
