const { app } = require('electron');
const native = require('vrcx-native');
const { addEventListener } = require('../common/event-bus.js');
const { openDb, closeDb } = require('./db.js');
const { createTrayMenu, destroyTrayMenu } = require('./tray-menu.js');
const { createMainWindow, destroyMainWindow, sendToMainWindow, activateMainWindow } = require('./main-window.js');
const vrchatLogWatcher = require('./vrchat-log-watcher.js');

(function () {
    app.setName('VRCX');
    app.setAppUserModelId('moe.pypy.vrcx');

    if (app.requestSingleInstanceLock() === false) {
        app.exit();
        return;
    }

    console.log('sample', native.sample());
    console.log('sum', native.sum(1, 2, 3, 4, 5, '6'));

    // for better performance to offscreen rendering
    app.disableHardwareAcceleration();

    app.isForceQuit = false;

    app.on('ready', function () {
        openDb();
        createTrayMenu();
        createMainWindow();
    });

    app.on('second-instance', function () {
        activateMainWindow();
    });

    app.on('activate', function () {
        activateMainWindow();
    });

    app.on('will-quit', function () {
        destroyMainWindow();
        destroyTrayMenu();
        setImmediate(function () {
            closeDb();
        });
    });

    addEventListener('tray-menu:double-click', function () {
        activateMainWindow();
    });

    addEventListener('tray-menu:open', function () {
        activateMainWindow();
    });

    addEventListener('tray-menu:quit', function () {
        app.isForceQuit = true;
        app.quit();

        // ensure exit
        setTimeout(function () {
            closeDb();
            app.exit();
        }, 5000);
    });

    vrchatLogWatcher.on('reset', function () {
        sendToMainWindow('vrchat-log-watcher:reset');
    });

    vrchatLogWatcher.on('watch', function (file) {
        sendToMainWindow('vrchat-log-watcher:watch', file);
    });

    vrchatLogWatcher.on('unwatch', function (file) {
        sendToMainWindow('vrchat-log-watcher:unwatch', file);
    });

    vrchatLogWatcher.on('data', function (file, data) {
        sendToMainWindow('vrchat-log-watcher:data', file, data);
    });
})();
