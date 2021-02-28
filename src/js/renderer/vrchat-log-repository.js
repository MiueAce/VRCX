const { ipcRenderer } = window;

/** @type {?VRChatLogRepository} */
var vrchatLogRepository = null;

class VRChatLogRepository {
    constructor() {
        this.contextMap = new Map();
    }

    start() {
        ipcRenderer.send('vrchat-log-watcher', 'start');
    }

    stop() {
        ipcRenderer.send('vrchat-log-watcher', 'stop');
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

        // var time = data[0];
        var type = data[1];

        switch (type) {
            case 'launch':
                context.user = null;
                context.world = null;
                context.location = null;
                // emit('launch')
                break;

            case 'disconnect':
                context.user = null;
                context.world = null;
                context.location = null;
                // emit('disconnect')
                break;

            case 'destination':
                var location = data[2];
                var { user } = context;
                context.destination = location;
                // emit('destination', user, location)
                break;

            case 'entering-room':
                var world = data[2];
                context.world = world;
                break;

            case 'joining-room':
                var location = data[2];
                var { user, world } = context;
                context.location = location;
                // emit('joining-room', user, world, location)
                break;

            case 'left-room':
                context.world = null;
                context.location = null;
                context.destination = null;
                // event('left-room', user, world, location)
                break;

            case 'player-joined':
                var user = data[2];
                if (context.user === null) {
                    context.user = user;
                }
                var { world, location } = context;
                // event('player-joined', user, world, location)
                break;

            case 'player-left':
                var user = data[2];
                var { world, location } = context;
                // event('player-left', user, world, location)
                break;
        }
    }
}

vrchatLogRepository = new VRChatLogRepository();

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
