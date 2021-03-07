const { ipcRenderer } = window;
const { ref } = require('vue');
const { dispatchEvent } = require('../common/event-bus.js');

/** @type {Map<string, object>} */
var map_ = new Map();

var refCount_ = ref(0);

function watchLog(name) {
    var context = map_.get(name);
    if (context !== void 0) {
        return;
    }

    map_.set(name, {
        user: null,
        world: null,
        location: null,
    });
}

function unwatchLog(name) {
    map_.delete(name);
}

function handleLog(name, data) {
    var context = map_.get(name);
    if (context === void 0) {
        return;
    }

    var time = data[0];
    var type = data[1];

    switch (type) {
        case 'launch':
            context.user = null;
            context.world = null;
            context.location = null;
            dispatchEvent('vrchat-log:launch', { time });
            break;

        case 'disconnect':
            context.user = null;
            context.world = null;
            context.location = null;
            dispatchEvent('vrchat-log:disconnect', { time });
            break;

        case 'destination':
            var location = data[2];
            var { user } = context;
            context.destination = location;
            dispatchEvent('vrchat-log:destination', { time, user, location });
            break;

        case 'entering-room':
            var world = data[2];
            context.world = world;
            break;

        case 'joining-room':
            var location = data[2];
            var { user, world } = context;
            context.location = location;
            dispatchEvent('vrchat-log:joining-room', { time, user, world, location });
            break;

        case 'left-room':
            context.world = null;
            context.location = null;
            context.destination = null;
            dispatchEvent('vrchat-log:left-room', { time, user, world, location });
            break;

        case 'player-joined':
            var user = data[2];
            if (context.user === null) {
                context.user = user;
            }
            var { world, location } = context;
            dispatchEvent('vrchat-log:player-joined', { time, user, world, location });
            break;

        case 'player-left':
            var user = data[2];
            var { world, location } = context;
            dispatchEvent('vrchat-log:player-left', { time, user, world, location });
            break;
    }

    refCount_.value += 1;
}

function resetLogWatcher() {
    ipcRenderer.send('vrchat-log-watcher:reset');
}

ipcRenderer.on('vrchat-log-watcher:reset', function (event) {
    refCount_.value = 0;
});

ipcRenderer.on('vrchat-log-watcher:watch', function (event, name) {
    watchLog(name);
});

ipcRenderer.on('vrchat-log-watcher:unwatch', function (event, name) {
    unwatchLog(name);
});

ipcRenderer.on('vrchat-log-watcher:data', function (event, name, data) {
    handleLog(name, data);
});

module.exports = {
    refCount: refCount_,
    resetLogWatcher,
};
