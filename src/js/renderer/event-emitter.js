/** @type {?EventEmitter} */
var eventEmitter = null;

class EventEmitter {
    constructor() {
        this.events = {};
    }

    emit(event, ...args) {
        var handlers = this.events[event];
        if (typeof handlers === 'undefined') {
            return;
        }

        var { length } = handlers;
        for (var i = 0; i < length; ++i) {
            handlers[i].apply(this, args);
        }
    }

    on(event, handler) {
        if (typeof handler !== 'function') {
            return;
        }

        var handlers = this.events[event];
        if (typeof handlers !== 'undefined') {
            handlers.push(handler);
            return;
        }

        this.events[event] = [handler];
    }

    off(event, handler) {
        var handlers = this.events[event];
        if (typeof handlers === 'undefined') {
            return;
        }

        var index = handlers.indexOf(handler);
        if (index < 0) {
            return;
        }

        handlers.splice(index, 1);

        if (handlers.length === 0) {
            this.events[event] = undefined;
        }
    }
}

eventEmitter = new EventEmitter();

module.exports = eventEmitter;
