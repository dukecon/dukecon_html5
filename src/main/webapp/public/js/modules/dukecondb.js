define([], function() {

    // strip the file name from the URL to get the context (i.e. 'http://dev.dukecon.org/latest/speakers.html' -> '/dev.dukecon.org/latest')
    // so that all pages of the app use the same context
    var context = window.location.href.substring(window.location.href.indexOf(":") + 2);
    context = context.substring(0, context.lastIndexOf("/"));
    context = context.replace(/[\/:]/g, "_");
    console.log("db-context=" + context);
    var db_name = 'dukecon' + context;
    var talk_store = 'talks';
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.msIndexedDB || window.mozIndexedDB;

    var save = function(storeKey, data) {
        clear(storeKey);
        add(storeKey, data);
    };

    var get = function(storeKey, callback) {
        if (duke_privatemode) {
            callback(null);
            return;
        }
        console.log("Retrieve data from indexeddb for key " + storeKey);
        createDatabase(storeKey, function(store) {
            var cursor = store.openCursor();
            cursor.onsuccess = function(event) {
                var cursor = event.target.result;
                callback(cursor ? cursor.value : null);
            };
            cursor.onerror = function(e) {
                console.log("Retrieving data from indexeddb failed");
            };
        });
    };

    var clear = function(storeKey) {
        createDatabase(storeKey, function(store) {
            store.clear().onerror = function(e) {
                console.log("Clearing the indexeddb failed");
            };
        });
    };

    var add = function(storeKey, data) {
        createDatabase(storeKey, function(store) {
            store.add(data).onerror = function(e2) {
                console.log("Saving data to indexeddb failed");
            };
        });
    };

    var createDatabase = function(storeKey, callback) {
        //this.indexedDB.deleteDatabase(this.db_name); //please keep this line for debugging
        if (duke_privatemode || !indexedDB) {
            console.log("Cannot store in indexedDB");
            return;
        }
        try {
            var request = indexedDB.open(this.db_name, 3);
            request.onupgradeneeded = function (e) {
                if (!e || !e.target || !e.target.result) {
                    console.log("No db in " + e);
                }
                else {
                    assertObjectStore(e.target.result, storeKey);
                }
            };
            request.onsuccess = function (e) {
                if (!e || !e.target || !e.target.result) {
                    console.log("No db in " + e);
                }
                else {
                    var store = openTransaction(storeKey, e.target.result);
                    if (store) {
                        callback(store);
                    }
                }
            };
            request.onerror = function (e) {
                console.log("Opening database failed: " + e);
            };
        }
        catch (e) {
            console.log("Opening database throws error: " + e);
        }
    };

    var deleteDatabase = function() {
        if (indexedDB) {
            try {
                indexedDB.deleteDatabase(this.db_name);
            }
            catch(e) {
                console.log("Deleting database throws error: " + e);
            }
        }
    };

    var openTransaction = function(storeKey, db) {
        var trans = db.transaction(storeKey, 'readwrite');
        if (!trans) {
            console.log("Could not open transaction");
            return null;
        }
        else {
            return trans.objectStore(storeKey);
        }
    };

    var assertObjectStore = function(db, storeKey) {
        if (!db.objectStoreNames.contains(storeKey)){
            db.createObjectStore(storeKey, {
                keyPath: 'key',
                autoIncrement: true
            });
        }
    };

    return {
        get: get,
        save : save,
        clear : clear,
        add : add,
        purge: deleteDatabase,
        talk_store : talk_store,
        db_name : db_name
    };
});
