const { app } = require('electron');
const native = require('vrcx-native');
const { addEventListener } = require('../common/event-bus.js');
const { createTrayMenu, destroyTrayMenu } = require('./tray-menu.js');
const mainWindow = require('./main-window.js');
const vrchatLogWatcher = require('./vrchat-log-watcher.js');
const db = require('./db.js');

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
        db.create();
        createTrayMenu();
        mainWindow.create();
    });

    app.on('second-instance', function () {
        mainWindow.activate();
    });

    app.on('activate', function () {
        mainWindow.activate();
    });

    app.on('will-quit', function () {
        destroyTrayMenu();
        setImmediate(function () {
            db.destroy();
        });
    });

    addEventListener('tray-menu:double-click', function () {
        mainWindow.activate();
    });

    addEventListener('tray-menu:open', function () {
        mainWindow.activate();
    });

    addEventListener('tray-menu:quit', function () {
        app.isForceQuit = true;
        app.quit();

        // ensure exit
        setTimeout(function () {
            db.destroy();
            app.exit();
        }, 5000);
    });

    vrchatLogWatcher.on('reset', function () {
        mainWindow.send('vrchat-log-watcher:reset');
    });

    vrchatLogWatcher.on('watch', function (file) {
        mainWindow.send('vrchat-log-watcher:watch', file);
    });

    vrchatLogWatcher.on('unwatch', function (file) {
        mainWindow.send('vrchat-log-watcher:unwatch', file);
    });

    vrchatLogWatcher.on('data', function (file, data) {
        mainWindow.send('vrchat-log-watcher:data', file, data);
    });
})();
