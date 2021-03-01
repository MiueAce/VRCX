const { EventEmitter } = require('events');
const path = require('path');
const { app, ipcMain } = require('electron');
const chokidar = require('chokidar');
const { Tail } = require('tail');

/** @type {?VRChatLogWatcher} */
var vrchatLogWatcher = null;

function getLogBaseName(filePath) {
    var basename = path.basename(filePath);

    if (/^output_log_.+\.txt$/i.test(basename) === false) {
        return null;
    }

    return basename;
}

function parseLogAuth(file, line, offset) {
    // 2021.03.01 00:52:41 Log        -  [Behaviour] VRChat Build: VRChat 2021.1.3-1054-1c7ebce472-Release, Steam WindowsPlayer

    var firstLetter = line[offset];

    switch (firstLetter) {
        case 'C':
            if (line.startsWith('Client invoked disconnect', offset) === true) {
                var time = line.substr(0, 19);
                vrchatLogWatcher.emit('data', file, [time, 'disconnect']);
                return true;
            }
            break;

        case 'V':
            if (line.startsWith('VRChat Build: ', offset) === true) {
                var data = line.substr(offset);
                var time = line.substr(0, 19);
                vrchatLogWatcher.emit('data', file, [time, 'launch', data]);
                return true;
            }
            break;

        default:
            break;
    }

    return false;
}

function parseLogLocation(file, line, offset) {
    // 2020.10.31 23:36:28 Log        -  [VRCFlowManagerVRC] Destination fetching: wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd
    // 2020.10.31 23:36:28 Log        -  [VRCFlowManagerVRC] Destination set: wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd
    // 2020.10.31 23:36:31 Log        -  [RoomManager] Entering Room: VRChat Home
    // 2020.10.31 23:36:31 Log        -  [RoomManager] Joining wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd:67646~private(usr_4f76a584-9d4b-46f6-8209-8305eb683661)~nonce(D9298A536FEEEDDBB61633661A4BDAA09717C5178DEF865C4C09372FE12E09A6)
    // 2020.10.31 23:36:31 Log        -  [RoomManager] Joining or Creating Room: VRChat Home
    // 2021.02.03 10:18:58 Log        -  [ǄǄǅǅǅǄǄǅǅǄǅǅǅǅǄǄǄǅǅǄǄǅǅǅǅǄǅǅǅǅǄǄǄǄǄǅǄǅǄǄǄǅǅǄǅǅǅ] Destination fetching: wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd
    // 2021.02.28 21:54:12 Log        -  [Behaviour] Destination fetching: wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd
    // 2021.02.28 21:54:12 Log        -  [Behaviour] Destination set: wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd
    // 2021.02.28 21:54:16 Log        -  [Behaviour] Entering Room: VRChat Home
    // 2021.02.28 21:54:16 Log        -  [Behaviour] Joining wrld_4432ea9b-729c-46e3-8eaf-846aa0a37fdd:9686~private(usr_4f76a584-9d4b-46f6-8209-8305eb683661)~nonce(C19B3A1933A318261DFFA497750CB160757EFA8F1B6C4FE3E77D16C1E3A9A80C)
    // 2021.02.28 21:54:16 Log        -  [Behaviour] Joining or Creating Room: VRChat Home
    // 2021.02.28 23:55:01 Log        -  [Behaviour] OnLeftRoom

    var firstLetter = line[offset];

    switch (firstLetter) {
        case 'D':
            if (line.startsWith('Destination set: ', offset) === true) {
                var location = line.substr(offset + 17);
                var time = line.substr(0, 19);
                vrchatLogWatcher.emit('data', file, [time, 'destination', location]);
                return true;
            }
            break;

        case 'E':
            if (line.startsWith('Entering Room: ', offset) === true) {
                var world = line.substr(offset + 15);
                var time = line.substr(0, 19);
                vrchatLogWatcher.emit('data', file, [time, 'entering-room', world]);
                return true;
            }
            break;

        case 'J':
            if (line.startsWith('Joining wrld_', offset) === true) {
                var location = line.substr(offset + 8);
                var time = line.substr(0, 19);
                vrchatLogWatcher.emit('data', file, [time, 'joining-room', location]);
                return true;
            }
            break;

        case 'O':
            if (line.startsWith('OnLeftRoom', offset) === true) {
                var time = line.substr(0, 19);
                vrchatLogWatcher.emit('data', file, [time, 'left-room']);
                return true;
            }
            break;

        default:
            break;
    }

    return false;
}

function parseLogPlayerJoinedOrLeft(file, line, offset) {
    // 2020.10.31 23:36:58 Log        -  [NetworkManager] OnPlayerJoined pypy
    // 2020.10.31 23:36:58 Log        -  [Player] Initialized PlayerAPI "pypy" is local
    // 2020.10.31 23:36:58 Log        -  [NetworkManager] OnPlayerJoined Rize♡
    // 2020.10.31 23:36:58 Log        -  [Player] Initialized PlayerAPI "Rize♡" is remote
    // 2020.11.01 00:07:01 Log        -  [NetworkManager] OnPlayerLeft Rize♡
    // 2020.11.01 00:07:01 Log        -  [PlayerManager] Removed player 2 / Rize♡
    // 2020.11.01 00:07:02 Log        -  [Player] Unregistering Rize♡
    // 2021.02.28 21:54:19 Log        -  [Behaviour] OnPlayerJoined pypy
    // 2021.02.28 21:54:19 Log        -  [Behaviour] Initialized PlayerAPI "pypy" is local
    // 2021.02.28 23:43:09 Log        -  [Behaviour] OnLeftRoom
    // 2021.02.28 23:43:09 Log        -  [Behaviour] Unregistering pypy

    var firstLetter = line[offset];

    if (firstLetter === 'O') {
        if (line.startsWith('OnPlayerJoined ', offset) === true) {
            var user = line.substr(offset + 15);
            var time = line.substr(0, 19);
            vrchatLogWatcher.emit('data', file, [time, 'player-joined', user]);
            return true;
        }
        if (line.startsWith('OnPlayerLeft ', offset) === true) {
            var user = line.substr(offset + 13);
            var time = line.substr(0, 19);
            vrchatLogWatcher.emit('data', file, [time, 'player-left', user]);
            return true;
        }
    }

    return false;
}

function parseLogVideoPlayback(file, line, offset) {
    // 2021.02.28 22:22:23 Log        -  [Video Playback] Attempting to resolve URL 'https://youtu.be/SHIL6F4fz_Y'

    var firstLetter = line[offset];

    if (firstLetter === 'A' && line.startsWith('Attempting to resolve URL ', offset) === true) {
        var url = line.substr(offset + 26);
        if (url.length >= 2 && url[0] === "'" && url[url.length - 1] === "'") {
            url = url.substr(1, url.length - 2);
        }
        var time = line.substr(0, 19);
        vrchatLogWatcher.emit('data', file, [time, 'video-url', url]);
        return true;
    }

    return false;
}

function parseLogNotification(file, line, offset) {
    // 2021.01.03 05:48:58 Log        -  Received Notification: < Notification from username:pypy, sender user id:usr_4f76a584-9d4b-46f6-8209-8305eb683661 to of type: friendRequest, id: not_3a8f66eb-613c-4351-bee3-9980e6b5652c, created at: 01/14/2021 15:38:40 UTC, details: {{}}, type:friendRequest, m seen:False, message: ""> received at 01/02/2021 16:48:58 UTC

    var firstLetter = line[offset];

    if (firstLetter === 'R' && line.startsWith('Received Notification: <', offset) === true) {
        var pos = line.lastIndexOf('> received at ');
        if (pos < 0) {
            return false;
        }
        var json = line.substr(offset + 24, pos - (offset + 24));
        var time = line.substr(0, 19);
        vrchatLogWatcher.emit('data', file, [time, 'notification', json]);
        return true;
    }

    return false;
}

function parseLog(file, line) {
    if (line.length <= 37 || line[20] !== 'L' || line[31] != '-') {
        return;
    }

    if (line[34] !== '[') {
        // not use
        // parseLogNotification(file, line, 34);
        return;
    }

    var offset = 46;

    // 2021.03.01 00:13:30 Log        -  [Behaviour] VRChat Build: VRChat 2021.1.3-1054-1c7ebce472-Release, Steam WindowsPlayer
    if (line[44] !== ']') {
        offset = line.indexOf('] ', 35);
        if (offset < 0) {
            return;
        }
        offset += 2;
    }

    if (
        parseLogPlayerJoinedOrLeft(file, line, offset) === true ||
        parseLogLocation(file, line, offset) === true ||
        parseLogVideoPlayback(file, line, offset) === true ||
        parseLogAuth(file, line, offset) === true
    ) {
        // yo
    }
}

class VRChatLogWatcher extends EventEmitter {
    constructor() {
        super();

        /** @type {?Promise} */
        this.pendingStop = null;

        /** @type {?chokidar.FSWatcher} */
        this.watcher = null;

        this.tailMap = new Map();
    }

    start() {
        if (this.pendingStop !== null || this.watcher !== null) {
            return;
        }

        var watcher = chokidar.watch(path.join(app.getPath('home'), 'AppData/LocalLow/VRChat/VRChat'), {
            followSymlinks: false,
            usePolling: true,
            interval: 1000,
            useFsEvents: false,
            depth: 0,
        });

        // watcher
        //     .on('error', (error) => console.error(`Watcher error: ${error}`))
        //     .on('ready', () => console.log('Initial scan complete. Ready for changes'))
        //     .on('add', (path) => console.log(`File ${path} has been added`))
        //     .on('unlink', (path) => console.log(`File ${path} has been removed`));

        watcher.on('add', function (filePath) {
            setImmediate(function () {
                vrchatLogWatcher.watchLog(filePath);
            });
        });

        watcher.on('change', function (filePath) {
            setImmediate(function () {
                vrchatLogWatcher.watchLog(filePath);
            });
        });

        watcher.on('unlink', function (filePath) {
            vrchatLogWatcher.unwatchLog(filePath);
        });

        this.watcher = watcher;
        this.emit('start');
    }

    stop() {
        if (this.pendingStop !== null) {
            return this.pendingStop;
        }

        if (this.watcher === null) {
            return Promise.resolve();
        }

        var self = this;

        return new Promise(async function (resolve) {
            self.pendingStop = this;

            try {
                await self.watcher.close();
            } catch (err) {
                console.error(err);
            }

            self.watcher = null;

            setImmediate(function () {
                for (var filePath of self.tailMap.keys()) {
                    self.unwatchLog(filePath);
                }
                resolve();
                self.pendingStop = null;
                self.emit('stop');
            });
        });
    }

    async reset() {
        await vrchatLogWatcher.stop();
        this.emit('reset');
        vrchatLogWatcher.start();
    }

    watchLog(filePath) {
        var file = getLogBaseName(filePath);
        if (file === null) {
            return;
        }

        var tail = this.tailMap.get(file);
        if (typeof tail !== 'undefined') {
            return;
        }

        tail = new Tail(filePath, {
            fromBeginning: true,
        });

        tail.on('error', function (err) {
            console.error(file, err);
            vrchatLogWatcher.unwatchLog(filePath);
        });

        tail.on('line', function (line) {
            parseLog(file, line);
        });

        this.tailMap.set(file, tail);
        this.emit('watch', file);
    }

    unwatchLog(filePath) {
        var file = getLogBaseName(filePath);
        if (file === null) {
            return;
        }

        var tail = this.tailMap.get(file);
        if (typeof tail === 'undefined') {
            return;
        }

        tail.unwatch();

        this.tailMap.delete(file);
        this.emit('unwatch', file);
    }
}

vrchatLogWatcher = new VRChatLogWatcher();

ipcMain.on('vrchat-log-watcher:start', function (event) {
    event.returnValue = null;
    vrchatLogWatcher.start();
});

ipcMain.on('vrchat-log-watcher:stop', function (event) {
    event.returnValue = null;
    vrchatLogWatcher.stop();
});

ipcMain.on('vrchat-log-watcher:reset', function (event) {
    event.returnValue = null;
    vrchatLogWatcher.reset();
});

module.exports = vrchatLogWatcher;
