const { EventEmitter } = require('events');
const { Menu, Tray } = require('electron');
const { APP_ICON } = require('./constants');

/** @type {?TrayMenu} */
var trayMenu = null;

class TrayMenu extends EventEmitter {
    constructor() {
        super();

        /** @type {?Tray} */
        this.tray = null;
    }

    create() {
        if (this.tray !== null) {
            return;
        }

        var tray = new Tray(APP_ICON);

        tray.setToolTip('VRCX');

        tray.on('double-click', function () {
            trayMenu.emit('double-click');
        });

        tray.setContextMenu(
            Menu.buildFromTemplate([
                {
                    label: 'Open',
                    click: function () {
                        trayMenu.emit('menu:open');
                    },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Quit VRCX',
                    click: function () {
                        trayMenu.emit('menu:quit');
                    },
                },
            ])
        );

        this.tray = tray;
    }

    destroy() {
        var { tray } = this;

        if (tray === null) {
            return;
        }

        this.tray = null;
        tray.destroy();
    }
}

trayMenu = new TrayMenu();
module.exports = trayMenu;
