var privateMode = false;

window.onerror = function(msg, url, linenumber) {
    if (msg === 'InvalidStateError' && url.indexOf('dukecondb.js') != -1) {
        console.log('Error opening indexeddb; browser seems to be in private mode');
        privateMode = true;
        if (typeof dukeconTalklistModel !== 'undefined') {
            dukeconTalkUtils.getData(jsonUrl, dukeconTalklistModel.initialize);
        }
        if (typeof speakerModel !== 'undefined') {
            dukeconTalkUtils.getData(jsonUrl, speakerModel.initializeData);
        }
        if (typeof talkModel !== 'undefined') {
            dukeconTalkUtils.getData(jsonUrl, talkModel.initializeData);
        }
        return true;
    }
    return false;
};

var dukeconDb = {
    db_name : 'dukecon',
    talk_store : 'talks',
    indexedDB : window.indexedDB || window.webkitIndexedDB || window.msIndexedDB || window.mozIndexedDB,

    save : function(storeKey, data) {
        dukeconDb.clear(storeKey);
        dukeconDb.add(storeKey, data);
    },

    get : function(storeKey, callback) {
        if (privateMode) {
            callback(null);
            return;
        }
        console.log("Retrieve data from indexeddb");
        dukeconDb.createDatabase(storeKey, function(store) {
            var cursor = store.openCursor();
            cursor.onsuccess = function(event) {
                var cursor = event.target.result;
                callback(cursor ? cursor.value : null);
            };
            cursor.onerror = function(e) {
                console.log("Retrieving data from indexeddb failed");
            };
        });
    },

    clear : function(storeKey) {
        dukeconDb.createDatabase(storeKey, function(store) {
            store.clear().onerror = function(e) {
                console.log("Clearing the indexeddb failed");
            };
        });
    },

    add : function(storeKey, data) {
        dukeconDb.createDatabase(storeKey, function(store) {
            store.add(data).onerror = function(e2) {
                console.log("Saving data to indexeddb failed");
            };
        });
    },

    createDatabase : function(storeKey, callback) {
        //this.indexedDB.deleteDatabase(this.db_name); //please keep this line for debugging
        if (privateMode || !this.indexedDB) {
            console.log("Cannot store in indexedDB");
            return;
        }
        try {
            var request = this.indexedDB.open(this.db_name, 3);
            request.onupgradeneeded = function (e) {
                if (!e || !e.target || !e.target.result) {
                    console.log("No db in " + e);
                }
                else {
                    dukeconDb.assertObjectStore(e.target.result, storeKey);
                }
            };
            request.onsuccess = function (e) {
                if (!e || !e.target || !e.target.result) {
                    console.log("No db in " + e);
                }
                else {
                    var store = dukeconDb.openTransaction(storeKey, e.target.result);
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
    },

    openTransaction : function(storeKey, db) {
        var trans = db.transaction(storeKey, 'readwrite');
        if (!trans) {
            console.log("Could not open transaction");
            return null;
        }
        else {
            return trans.objectStore(storeKey);
        }
    },

    assertObjectStore : function(db, storeKey) {
        if (!db.objectStoreNames.contains(storeKey)){
            db.createObjectStore(storeKey, {
                keyPath: 'key',
                autoIncrement: true
            });
        }
    }
};
