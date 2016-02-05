define(['underscore', 'jquery', 'knockout', 'js/modules/dukecondb', 'js/modules/dukeconsettings', 'js/modules/dukecloak'], function(_, $, ko, dukecondb, dukeconsettings, dukecloak) {
    var jsonUrl = "rest/conferences/499959";

    var reloadInPrivateMode = ko.observable(false);

    var init = function() {
        // These variables are set when the application cache events are triggered before the init method
        if (duke_cachestatus === 'updateready') {
            onUpdateReady(duke_status);
        }
        else if (duke_cachestatus === 'error') {
            setOfflineStatus(true)
        }
        else if (duke_cachestatus === 'cached' || duke_cachestatus === 'noupdate') {
            setOfflineStatus(false)
        }

        // In case these events are triggered after the init method, we add a listener
        window.addEventListener('load', function(e) {
            window.applicationCache.addEventListener('updateready', function(e) {
                onUpdateReady(window.applicationCache.status);
            }, false);
            window.applicationCache.addEventListener("error", function(e) {
                setOfflineStatus(true);
            });
            window.applicationCache.addEventListener("cached", function(e) {
                setOfflineStatus(false);
            });
            window.applicationCache.addEventListener("noupdate", function(e) {
                setOfflineStatus(false);
            });
        }, false);


        window.onerror = function(msg, url, linenumber) {
            if (msg === 'InvalidStateError' && url.indexOf('dukecondb.js') != -1) {
                console.log('Error opening indexeddb; browser seems to be in private mode');
                duke_privatemode = true;
                reloadInPrivateMode(true);
                return true;
            }
            return false;
        };
    };

    function onUpdateReady(status) {
        var doPageReload = dukeconsettings.getSetting(dukeconsettings.keys.offline);
        setOfflineStatus(false);
        if (window.applicationCache.UPDATEREADY === status) {
            console.log("Loading new version of page");
            // Browser downloaded a new app cache.
            // Swap it in and reload the page to get the new hotness.
            window.applicationCache.swapCache();
            window.location.reload();
        }
        else if (doPageReload) {
            console.log("Back online - reload page in case there is new data");
            window.location.reload();
        }
        else {
            console.log("The manifest did not change!");
        }
    }

    function setOfflineStatus(offline) {
        if (offline) {
            console.log("We are offline");
            dukeconsettings.saveSetting(dukeconsettings.keys.offline, true);
            dukeconsettings.saveSetting(dukeconsettings.keys.previously_offline, false);
        }
        else {
            console.log("We are online - starting timer to check for updates");
            dukeconsettings.saveSetting(dukeconsettings.keys.previously_offline, dukeconsettings.getSetting(dukeconsettings.keys.offline));
            dukeconsettings.saveSetting(dukeconsettings.keys.offline, false);
            checkNewDataOnServer();
            setInterval(function() {
                dukeconTalkUtils.checkNewDataOnServer();
            }, 300000);
            dukecloak.dukecloak.nowOnline();
        }
    }

    var updateCheck = ko.observable(false);

    var getData = function(url, callback) {
        var offline = dukeconsettings.getSetting(dukeconsettings.keys.offline);
        var dataHash = dukeconsettings.getSetting(dukeconsettings.keys.last_updated_hash);
        if (!offline && !dataHash) {
            getDataFromServer(url, callback);
        }
        else {
            dukecondb.get(dukecondb.talk_store, function(data) {
                if (data) {
                    callback(data);
                }
                else if (!offline) {
                    getDataFromServer(url, callback);
                }
            });
        }
    };

    var checkNewDataOnServer = function() {
        updateCheck(true);
        console.log('Check for new data on server');
        var oldCacheHash = dukeconsettings.getSetting(dukeconsettings.keys.last_updated_hash);
        //var oldCacheHash = Math.random().toString(36).slice(2);

        var successCallback = function(data, status, xhr) {
            if (data) {
                console.log("New Data on server; replacing old data in store");
                dukecondb.save(dukecondb.talk_store, data);
                dukeconsettings.saveSetting(dukeconsettings.keys.last_updated_hash, xhr.getResponseHeader("ETag"));
            }
            updateCheck(false);
        };
        doServerRequest(jsonUrl, successCallback, function(error) {
            console.log('No connection to server');
            updateCheck(false);
        }, { "If-None-Match": oldCacheHash });
    };

    var getDataFromServer = function(url, callback) {
        console.log("Retrieving data from server");
        var successCallback = function(data, status, xhr) {
            if (data) {
                dukecondb.save(dukecondb.talk_store, data);
                dukeconsettings.saveSetting(dukeconsettings.keys.last_updated_hash, xhr.getResponseHeader("ETag"));
                callback(data);
            }
        };
        var errorCallback = function() {
            console.log('No connection to server, retrieving data from local storage');
            dukecondb.get(dukecondb.talk_store, function(data) {
                if (data) {
                    callback(data);
                }
                else {
                    console.log('Could not retrieve any data');
                }
            });
        };
        doServerRequest(url, successCallback, errorCallback);
    };

    var doServerRequest = function(url, successCallback, errorCallback, headers) {
        $.ajax({
            method: 'GET',
            dataType: "json",
            headers: headers,
            url: url,
            success: successCallback,
            error: errorCallback
        });
    };

    return {
        init : init,
        reloadInPrivateMode : reloadInPrivateMode,
        jsonUrl : jsonUrl,
        updateCheck : updateCheck,
        getData : getData
    }
});