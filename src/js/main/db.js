const path = require('path');
const { app, ipcMain } = require('electron');
const BetterSqlite3 = require('better-sqlite3');

/** @type {?DB} */
var db = null;

class DB {
    constructor() {
        /** @type {?BetterSqlite3.Database} */
        this.sqlite3 = null;
    }

    create() {
        if (this.sqlite3 !== null) {
            return;
        }

        var dbPath = path.join(app.getPath('userData'), 'VRCX.sqlite3');

        var sqlite3 = BetterSqlite3(dbPath, {
            verbose: console.log,
        });

        sqlite3.exec('PRAGMA journal_mode=WAL');
        sqlite3.exec('PRAGMA locking_mode=EXCLUSIVE');
        sqlite3.exec('PRAGMA synchronous=FULL'); // better-sqlite3 is NORMAL
        sqlite3.exec('PRAGMA wal_checkpoint(TRUNCATE)');

        this.sqlite3 = sqlite3;
    }

    destroy() {
        var { sqlite3 } = this;

        if (sqlite3 === null) {
            return;
        }

        sqlite3.close();
        this.sqlite3 = null;
    }

    transaction(fn) {
        var { sqlite3 } = this;

        if (sqlite3 === null) {
            return null;
        }

        return sqlite3.transaction(fn);
    }

    prepare(source) {
        var { sqlite3 } = this;

        if (sqlite3 === null) {
            return null;
        }

        return sqlite3.prepare(source);
    }

    exec(source) {
        var { sqlite3 } = this;

        if (sqlite3 === null) {
            return null;
        }

        return sqlite3.exec(source);
    }
}

ipcMain.handle('db:query', function (event, query, args) {
    try {
        var stmt = db.prepare(query);

        if (Array.isArray(args) === true) {
            return stmt.all.apply(stmt, args);
        }

        return stmt.all();
    } catch (err) {
        console.error(err);
        return null;
    }
});

ipcMain.handle('db:exec', function (event, source) {
    try {
        return db.exec(query);
    } catch (err) {
        console.error(err);
        return null;
    }
});

db = new DB();
module.exports = db;
