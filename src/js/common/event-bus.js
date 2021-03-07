/** @type {Map<string, Set<Function>>} */
var map_ = new Map();

function dispatchEvent(name, ...args) {
    var set = map_.get(name);
    if (set === void 0) {
        return;
    }

    switch (args.length) {
        case 0:
            for (var fn of set) {
                fn();
            }
            break;

        case 1:
            var [a] = args;
            for (var fn of set) {
                fn(a);
            }
            break;

        case 2:
            var [a, b] = args;
            for (var fn of set) {
                fn(a, b);
            }
            break;

        case 3:
            var [a, b, c] = args;
            for (var fn of set) {
                fn(a, b, c);
            }
            break;

        case 4:
            var [a, b, c, d] = args;
            for (var fn of set) {
                fn(a, b, c, d);
            }
            break;

        case 5:
            var [a, b, c, d, e] = args;
            for (var fn of set) {
                fn(a, b, c, d, e);
            }
            break;

        default:
            for (var fn of set) {
                fn(...args);
            }
            break;
    }
}

function addEventListener(name, fn) {
    var set = map_.get(name);
    if (set !== void 0) {
        set.add(fn);
        return;
    }

    set = new Set();
    set.add(fn);
    map_.set(name, set);
}

function removeEventHandler(name, fn) {
    var set = map_.get(name);
    if (set === void 0) {
        return;
    }

    set.delete(fn);

    if (set.size === 0) {
        map_.delete(name);
    }
}

module.exports = {
    dispatchEvent,
    addEventListener,
    removeEventHandler,
};
