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
        return null;
    }

    return basename;
}

function parseLogDate(line) {
    try {
        return new Date(
            +line.substr(0, 4),
            +line.substr(5, 2) - 1,
            +line.substr(8, 2),
            +line.substr(11, 2),
            +line.substr(14, 2),
            +line.substr(17, 2)
        );
    } catch (err) {
        return line;
    }
}

function parseLogLocation(line, offset) {
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

    if (line[offset] === 'E' && line.substr(offset, 15) === 'Entering Room: ') {
        var worldName = escape(line.substr(offset + 15));
        this.worldName = worldName;
        return parsed;
    }

    if (line[offset] === 'J' && line.substr(offset, 13) === 'Joining wrld_') {
        var worldName = 'worldName' in this ? this.worldName : null;
        var location = escape(line.substr(offset + 8));
        var date = parseLogDate(line);
        var parsed = [date, 'location', location, worldName];
        console.log(parsed);
        return parsed;
    }

    return null;
}

function parseLogOnPlayerJoinedOrLeft(line, offset) {
    // 2020.10.31 23:36:58 Log        -  [NetworkManager] OnPlayerJoined pypy
    // 2020.10.31 23:36:58 Log        -  [Player] Initialized PlayerAPI "pypy" is local
    // 2020.10.31 23:36:58 Log        -  [NetworkManager] OnPlayerJoined Rize♡
    // 2020.10.31 23:36:58 Log        -  [Player] Initialized PlayerAPI "Rize♡" is remote
    // 2020.11.01 00:07:01 Log        -  [NetworkManager] OnPlayerLeft Rize♡
    // 2020.11.01 00:07:01 Log        -  [PlayerManager] Removed player 2 / Rize♡
    // 2020.11.01 00:07:02 Log        -  [Player] Unregistering Rize♡
    // 2021.02.28 21:54:19 Log        -  [Behaviour] OnPlayerJoined pypy
    // 2021.02.28 21:54:19 Log        -  [Behaviour] Initialized PlayerAPI "pypy" is local

    // if (line.substr(offset, 23) === 'Initialized PlayerAPI "') {
    //     var pos = line.lastIndexOf('" is ');
    //     if (pos < 0) {
    //         return null;
    //     }
    //     var userDisplayName = line.substr(offset + 23, pos - (offset + 23));
    //     var userType = line.substr(pos + 5);
    //     var date = parseLogDate(line);
    //     var parsed = ['player-joined', date, userDisplayName, userType];
    //     console.log(parsed);
    //     return parsed;
    // }

    if (line[offset] === 'O') {
        if (line.substr(offset, 15) === 'OnPlayerJoined ') {
            var userDisplayName = escape(line.substr(offset + 15));
            var date = parseLogDate(line);
            var parsed = [date, 'player-joined', userDisplayName];
            console.log(parsed);
            return parsed;
        }
        if (line.substr(offset, 13) === 'OnPlayerLeft ') {
            var userDisplayName = escape(line.substr(offset + 13));
            var date = parseLogDate(line);
            var parsed = [date, 'player-left', userDisplayName];
            console.log(parsed);
            return parsed;
        }
    }

    return null;
}

function parseLogVideoPlayback(line, offset) {
    // 2021.02.28 22:22:23 Log        -  [Video Playback] Attempting to resolve URL 'https://youtu.be/SHIL6F4fz_Y'

    if (line[offset] === 'A' && line.substr(offset, 26) === 'Attempting to resolve URL ') {
        var url = line.substr(offset + 26);
        if (url.startsWith("'") === true && url.endsWith("'") === true) {
            url = url.substr(1, url.length - 2);
        }
        url = escape(url);
        var date = parseLogDate(line);
        var parsed = [date, 'video-url', url];
        console.log(parsed);
        return parsed;
    }

    return null;
}

function parseLogNotification(line, offset) {
    // 2021.01.03 05:48:58 Log        -  Received Notification: < Notification from username:pypy, sender user id:usr_4f76a584-9d4b-46f6-8209-8305eb683661 to of type: friendRequest, id: not_3a8f66eb-613c-4351-bee3-9980e6b5652c, created at: 01/14/2021 15:38:40 UTC, details: {{}}, type:friendRequest, m seen:False, message: ""> received at 01/02/2021 16:48:58 UTC

    if (line[offset] === 'R' && line.substr(offset, 24) === 'Received Notification: <') {
        var pos = line.lastIndexOf('> received at ');
        if (pos < 0) {
            return null;
        }
        var data = escape(line.substr(offset + 24, pos - (offset + 24)));
        var date = parseLogDate(line);
        var parsed = [date, 'notification', data];
        console.log(parsed);
        return parsed;
    }

    return null;
}

function parseLog(line) {
    if (line.length <= 36 || line[20] !== 'L' || line[31] != '-') {
        return;
    }

    if (line[34] !== '[') {
        parseLogNotification.call(this, line, 34);
        return;
    }

    var offset = line.indexOf('] ', 35);
    if (offset < 0) {
        return;
    }

    offset += 2;
    if (
        parseLogOnPlayerJoinedOrLeft.call(this, line, offset) !== null ||
        parseLogLocation.call(this, line, offset) !== null ||
        parseLogVideoPlayback.call(this, line, offset) !== null
    ) {
        // yo
    }
}

class VRChatLogWatcher extends EventEmitter {
    constructor() {
        super();

        /** @type {?chokidar.FSWatcher} */
        this.watcher = null;

        this.tailMap = new Map();

        this.logs = [];
    }

    start() {
        if (this.watcher !== null) {
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
            .on('add', (path) => console.log(`File ${path} has been added`))
            .on('change', (path) => console.log(`File ${path} has been changed`))
            .on('unlink', (path) => console.log(`File ${path} has been removed`));

        watcher
            .on('addDir', (path) => console.log(`Directory ${path} has been added`))
            .on('unlinkDir', (path) => console.log(`Directory ${path} has been removed`))
            .on('error', (error) => console.error(`Watcher error: ${error}`))
            .on('ready', () => console.log('Initial scan complete. Ready for changes'));

        watcher.on('add', function (filePath) {
            vrchatLogWatcher.watchLog(filePath);
        });

        watcher.on('change', function (filePath) {
            vrchatLogWatcher.watchLog(filePath);
        });

        watcher.on('unlink', function (filePath) {
            vrchatLogWatcher.unwatchLog(filePath);
        });

        this.watcher = watcher;
    }

    stop() {
        var { watcher } = this;

        if (watcher === null) {
            return;
        }

        this.logs.length = 0;

        for (var tail of this.tailMap.values()) {
            tail.unwatch();
        }

        this.tailMap.clear();

        this.watcher = null;
        watcher.close();
    }

    watchLog(filePath) {
        var name = getLogBaseName(filePath);
        if (name === null) {
            return;
        }

        var tail = this.tailMap.get(name);
        if (typeof tail !== 'undefined') {
            return;
        }

        tail = new Tail(filePath, {
            fromBeginning: true,
        });

        tail.on('error', function (err) {
            console.error(err);
            vrchatLogWatcher.unwatchLog(filePath);
        });

        tail.on('line', parseLog);

        this.tailMap.set(name, tail);
    }

    unwatchLog(filePath) {
        var name = getLogBaseName(filePath);
        if (name === null) {
            return;
        }

        var tail = this.tailMap.get(name);
        if (typeof tail === 'undefined') {
            return;
        }

        tail.unwatch();
        this.tailMap.delete(name);
    }
}

vrchatLogWatcher = new VRChatLogWatcher();
module.exports = vrchatLogWatcher;
