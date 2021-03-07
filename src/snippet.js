//
// ipc messaging
//

// on renderer side
const { ipcRenderer } = require('electron');

ipcRenderer.send('vrcx', 'send'); // void
ipcRenderer.sendSync('vrcx', 'sendSync'); // void

ipcRenderer.invoke('vrcx', 'invoke'); // Promise<any>

// webContents.send('vrcx', 'yo');
ipcRenderer.on('vrcx', function (events, ...args) {
    console.log('ipcRenderer.on(vrcx)', args);
});

// on main side
const { ipcMain } = require('electron');

ipcMain.on('vrcx', function (event, ...args) {
    console.log('ipcMain.on(vrcx)', args);
    // event.returnValue = ~~ or event.reply('vrcx', ...args); // for sendSync()
});

ipcMain.handle('vrcx', function (event, ...args) {
    console.log('ipcMain.handle(vrcx)', args);
    return args;
});