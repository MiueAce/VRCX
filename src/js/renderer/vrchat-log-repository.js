const { ipcRenderer } = window;
const { ref } = require('vue');
const EventEmitter = require('./event-emitter.js');

/** @type {?VRChatLogRepository} */
var vrchatLogRepository = null;

class VRChatLogRepository extends EventEmitter {
    constructor() {
        super();

        this.contextMap = new Map();
        this.logCount = ref(0);
    }

    reset() {
        ipcRenderer.send('vrchat-log-watcher:reset');
    }

    onReset() {
        this.logCount.value = 0;
    }

    onWatch(file) {
        var context = this.contextMap.get(file);
        if (typeof context !== 'undefined') {
            return;
        }

        this.contextMap.set(file, {
            user: null,
            world: null,
            location: null,
        });
    }

    onUnwatch(file) {
        this.contextMap.delete(file);
    }

    onData(file, data) {
        var context = this.contextMap.get(file);
        if (typeof context === 'undefined') {
            return;
        }

        var time = data[0];
        var type = data[1];

        switch (type) {
            case 'launch':
                context.user = null;
                context.world = null;
                context.location = null;
                this.emit('launch', { time });
                break;

            case 'disconnect':
                context.user = null;
                context.world = null;
                context.location = null;
                this.emit('disconnect', { time });
                break;

            case 'destination':
                var location = data[2];
                var { user } = context;
                context.destination = location;
                this.emit('destination', { time, user, location });
                break;

            case 'entering-room':
                var world = data[2];
                context.world = world;
                break;

            case 'joining-room':
                var location = data[2];
                var { user, world } = context;
                context.location = location;
                this.emit('joining-room', { time, user, world, location });
                break;

            case 'left-room':
                context.world = null;
                context.location = null;
                context.destination = null;
                this.emit('left-room', { time, user, world, location });
                break;

            case 'player-joined':
                var user = data[2];
                if (context.user === null) {
                    context.user = user;
                }
                var { world, location } = context;
                this.emit('player-joined', { time, user, world, location });
                break;

            case 'player-left':
                var user = data[2];
                var { world, location } = context;
                this.emit('player-left', { time, user, world, location });
                break;
        }

        this.logCount.value += 1;
    }
}

vrchatLogRepository = new VRChatLogRepository();

ipcRenderer.on('vrchat-log-watcher:reset', function (event) {
    vrchatLogRepository.onReset();
});

ipcRenderer.on('vrchat-log-watcher:watch', function (event, file) {
    vrchatLogRepository.onWatch(file);
});

ipcRenderer.on('vrchat-log-watcher:unwatch', function (event, file) {
    vrchatLogRepository.onUnwatch(file);
});

ipcRenderer.on('vrchat-log-watcher:data', function (event, file, data) {
    vrchatLogRepository.onData(file, data);
});

module.exports = vrchatLogRepository;
