const path = require('path');
const { app, ipcMain } = require('electron');
const BetterSqlite3 = require('better-sqlite3');

/** @type {?BetterSqlite3.Database} */
var sqlite3_ = null;

function openDb() {
    if (sqlite3_ !== null) {
        return;
    }

    var dbPath = path.join(app.getPath('userData'), 'VRCX.sqlite3');

    var sqlite3 = BetterSqlite3(dbPath, {
        verbose: console.log,
    });
    sqlite3_ = sqlite3;

    execDb('PRAGMA journal_mode=WAL');
    execDb('PRAGMA locking_mode=EXCLUSIVE');
    execDb('PRAGMA synchronous=FULL'); // better-sqlite3 is NORMAL
    execDb('PRAGMA wal_checkpoint(TRUNCATE)');
}

function closeDb() {
    var sqlite3 = sqlite3_;
    if (sqlite3 === null) {
        return;
    }

    sqlite3_ = null;

    try {
        sqlite3.close();
    } catch (err) {
        console.error(err);
    }
}

function execDb(query) {
    var sqlite3 = sqlite3_;
    if (sqlite3 === null) {
        return false;
    }

    try {
        sqlite3.exec(query);
        return true;
    } catch (err) {
        console.error(err);
    }

    return false;
}

function prepareDb(query) {
    var sqlite3 = sqlite3_;
    if (sqlite3 === null) {
        return null;
    }

    try {
        return sqlite3.prepare(query);
    } catch (err) {
        console.error(err);
    }

    return null;
}

ipcMain.handle('db:exec', function (event, query) {
    return execDb(query);
});

ipcMain.handle('db:query', function (event, query, ...params) {
    var stmt = prepareDb(query);
    if (stmt === null) {
        return null;
    }

    try {
        if (params.length > 0) {
            return stmt.all(stmt, ...params);
        }
        return stmt.all();
    } catch (err) {
        console.error(err);
    }

    return null;
});

module.exports = {
    openDb,
    closeDb,
    execDb,
    prepareDb,
};
