const { EventEmitter } = require('events');
const path = require('path');
const { app } = require('electron');
const chokidar = require('chokidar');
const { Tail } = require('tail');

/** @type {?VRChatLogWatcher} */
var vrchatLogWatcher = null;

function getLogBaseName(filePath) {
    var basename = path.basename(filePath);

    if (/^output_log_.+\.txt$/i.test(basename) === false) {
        return false;
    }

    return basename;
}

function emitLog(file, data) {
    vrchatLogWatcher.emit('data', file, data);
}

function parseLogTime(line) {
    // try {
    //     return new Date(
    //         +line.substr(0, 4),
    //         +line.substr(5, 2) - 1,
    //         +line.substr(8, 2),
    //         +line.substr(11, 2),
    //         +line.substr(14, 2),
    //         +line.substr(17, 2)
    //     );
    // } catch (err) {
    //     return line;
    // }
    return line.substr(0, 19);
}

function parseLogAuth(file, line, offset) {
    // 2021.03.01 00:52:41 Log        -  [Behaviour] VRChat Build: VRChat 2021.1.3-1054-1c7ebce472-Release, Steam WindowsPlayer

    var c = line[offset];

    if (c === 'C' && line.substr(offset, 25) === 'Client invoked disconnect') {
        var time = parseLogTime(line);
        emitLog(file, [time, 'disconnect']);
        return true;
    }

    if (c === 'V' && line.substr(offset, 14) === 'VRChat Build: ') {
        var data = line.substr(offset);
        var time = parseLogTime(line);
        emitLog(file, [time, 'launch', data]);
        return true;
    }
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

    var c = line[offset];

    if (c === 'D' && line.substr(offset, 17) === 'Destination set: ') {
        var location = line.substr(offset + 17);
        var time = parseLogTime(line);
        emitLog(file, [time, 'destination-set', location]);
        return true;
    }

    if (c === 'E' && line.substr(offset, 15) === 'Entering Room: ') {
        var world = line.substr(offset + 15);
        var time = parseLogTime(line);
        emitLog(file, [time, 'entering-room', world]);
        return true;
    }

    if (c === 'J' && line.substr(offset, 13) === 'Joining wrld_') {
        var location = line.substr(offset + 8);
        var time = parseLogTime(line);
        emitLog(file, [time, 'joining-room', location]);
        return true;
    }

    if (c === 'O' && line.substr(offset, 10) === 'OnLeftRoom') {
        var time = parseLogTime(line);
        emitLog(file, [time, 'left-room']);
        return true;
    }

    return false;
}

function parseLogOnPlayerJoinedOrLeft(file, line, offset) {
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

    var c = line[offset];

    if (c === 'O') {
        if (line.substr(offset, 15) === 'OnPlayerJoined ') {
            var user = line.substr(offset + 15);
            var time = parseLogTime(line);
            emitLog(file, [time, 'player-joined', user]);
            return true;
        }
        if (line.substr(offset, 13) === 'OnPlayerLeft ') {
            var user = line.substr(offset + 13);
            var time = parseLogTime(line);
            emitLog(file, [time, 'player-left', user]);
            return true;
        }
    }

    return false;
}

function parseLogVideoPlayback(file, line, offset) {
    // 2021.02.28 22:22:23 Log        -  [Video Playback] Attempting to resolve URL 'https://youtu.be/SHIL6F4fz_Y'

    var c = line[offset];

    if (c === 'A' && line.substr(offset, 26) === 'Attempting to resolve URL ') {
        var url = line.substr(offset + 26);
        if (url.startsWith("'") === true && url.endsWith("'") === true) {
            url = url.substr(1, url.length - 2);
        }
        var time = parseLogTime(line);
        emitLog(file, [time, 'video-url', url]);
        return true;
    }

    return false;
}

function parseLogNotification(file, line, offset) {
    // 2021.01.03 05:48:58 Log        -  Received Notification: < Notification from username:pypy, sender user id:usr_4f76a584-9d4b-46f6-8209-8305eb683661 to of type: friendRequest, id: not_3a8f66eb-613c-4351-bee3-9980e6b5652c, created at: 01/14/2021 15:38:40 UTC, details: {{}}, type:friendRequest, m seen:False, message: ""> received at 01/02/2021 16:48:58 UTC

    var c = line[offset];

    if (c === 'R' && line.substr(offset, 24) === 'Received Notification: <') {
        var pos = line.lastIndexOf('> received at ');
        if (pos < 0) {
            return false;
        }
        var json = line.substr(offset + 24, pos - (offset + 24));
        var time = parseLogTime(line);
        emitLog(file, [time, 'notification', json]);
        return true;
    }

    return false;
}

function parseLog(file, line) {
    if (line.length <= 36 || line[20] !== 'L' || line[31] != '-') {
        return;
    }

    if (line[34] !== '[') {
        // not use
        // parseLogNotification(file, line, 34);
        return;
    }

    var offset = line.indexOf('] ', 35);
    if (offset < 0) {
        return;
    }

    offset += 2;
    if (
        parseLogOnPlayerJoinedOrLeft(file, line, offset) === true ||
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

        this.isBusy = false;

        /** @type {?chokidar.FSWatcher} */
        this.watcher = null;

        this.tailMap = new Map();
    }

    start() {
        if (this.isBusy === true || this.watcher !== null) {
            return;
        }

        var watcher = chokidar.watch(path.join(app.getPath('home'), 'AppData/LocalLow/VRChat/VRChat'), {
            followSymlinks: false,
            usePolling: true,
            interval: 1000,
            useFsEvents: false,
            depth: 0,
        });

        watcher
            .on('error', (error) => console.error(`Watcher error: ${error}`))
            .on('ready', () => console.log('Initial scan complete. Ready for changes'))
            .on('add', (path) => console.log(`File ${path} has been added`))
            .on('unlink', (path) => console.log(`File ${path} has been removed`));

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
    }

    async stop() {
        if (this.isBusy === true || this.watcher === null) {
            return;
        }

        this.isBusy = true;

        try {
            await this.watcher.close();

            var self = this;

            setImmediate(function () {
                for (var filePath of self.tailMap.keys()) {
                    self.unwatchLog(filePath);
                }
                self.watcher = null;
                self.isBusy = false;
            });
        } catch (err) {
            console.error(err);
        }
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
module.exports = vrchatLogWatcher;
