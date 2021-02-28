const { app } = require('electron');

function disableAutoStart() {
    app.setLoginItemSettings({
        openAtLogin: false,
    });
}

function enableAutoStart() {
    app.setLoginItemSettings({
        openAtLogin: true,
    });
}

module.exports = {
    enableAutoStart,
    disableAutoStart,
};
