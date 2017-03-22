define(['underscore', 'jquery', 'knockout', 'js/modules/urlprovider', 'js/modules/dukecondb', 'js/modules/dukeconsettings', 'js/modules/dukecloak'], function(_, $, ko, urlprovider, dukecondb, dukeconsettings, dukecloak) {
    var reloadInPrivateMode = ko.observable(false);

    var etag;

    var callbackOnNewData, checkUpdateIntervalSeconds = 90, checkUpdateIntervalHandle;

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
            if (checkUpdateIntervalHandle) {
                window.clearInterval(checkUpdateIntervalHandle);
            }
        }
        else {
            console.log("We are online - starting timer to check for updates");
            dukeconsettings.saveSetting(dukeconsettings.keys.previously_offline, dukeconsettings.getSetting(dukeconsettings.keys.offline));
            dukeconsettings.saveSetting(dukeconsettings.keys.offline, false);
			checkUpdateIntervalHandle = setInterval(function() {
                checkNewDataOnServer();
            }, checkUpdateIntervalSeconds * 1000);
            dukecloak.dukecloak.nowOnline();
        }
    }

    var updateCheck = ko.observable(false);

    var getData = function(callback) {
        callbackOnNewData = callback;

        dukecondb.get(dukecondb.talk_store, function (data) {
            var offline = dukeconsettings.getSetting(dukeconsettings.keys.offline);
            if (data) {
                etag = data.etag;
                callback(data);
                if(!offline) {
                    checkNewDataOnServer();
                }
            }
            else if (!offline) {
                urlprovider.getJsonUrl(function(url) {
                    getDataFromServer(url, callback);
                });
            }
        });
    };
	
    var updateBookingsAndFavorites = function(data, callback) {
        updateCheck(true);
		var findByEventId = function(events, eventId) {
			var i;
			for (i = 0; i < events.length; i += 1) {
				if (events[i].id == eventId) {
					return events[i];
				}
			}
			return null;
		};

		var addDeltaToConferences = function(events, delta) {
			var i;
			for (i = 0; i < delta.length; i += 1) {
				var event = findByEventId(events, delta[i].eventId);
				if (event) {
					event.fullyBooked = delta[i].fullyBooked;
					event.numberOfFavorites = delta[i].numberOfFavorites;
				}
			}
			return events;
		};

		urlprovider.getBookingsUrl(function(bookingsUrl) {
			doServerRequest(bookingsUrl,
				function(bookings) {
					data.events = addDeltaToConferences(data.events, bookings);
					dukecondb.save(dukecondb.talk_store, data);
   					callback(data);
					updateCheck(false);
				}, function () {
					console.log('No connection to server for bookings');
					updateCheck(false);
				});
		});
        
    };
    
    var checkNewDataOnServer = function() {
        if (callbackOnNewData) {
            updateCheck(true);
            console.log('Check for new data on server');
            var oldCacheHash = etag;
            // var oldCacheHash = Math.random().toString(36).slice(2);

            var successCallback = function (data, status, xhr) {
                if (data) {
                    data.etag = xhr.getResponseHeader("ETag");
                    etag = data.etag;
                    console.log("New Data on server; replacing old data in store");
					dukecondb.save(dukecondb.talk_store, data);
					updateBookingsAndFavorites(data, callbackOnNewData);
                } else {
                    console.log("No new talks, getting favorites and bookings");
					dukecondb.get(dukecondb.talk_store, function(dbValue) {
                        updateBookingsAndFavorites(dbValue, callbackOnNewData);
                    });
                }
                updateCheck(false);
            };
            urlprovider.getJsonUrl(function(url) {
                doServerRequest(url, successCallback, function () {
                    console.log('No connection to server');
                    updateCheck(false);
                }, {"If-None-Match": oldCacheHash});
            });
        }
    };

    var getDataFromServer = function(url, callback) {
        console.log("Retrieving data from server");
        var successCallback = function(data, status, xhr) {
            if (data) {
                data.etag = xhr.getResponseHeader("ETag");
                etag = data.etag;
                dukecondb.save(dukecondb.talk_store, data);
                updateCheck(true);
				updateBookingsAndFavorites(data, callbackOnNewData);
                callback(data);
            }
        };
        var errorCallback = function() {
            console.log('No connection to server, retrieving data from local storage');
            dukecondb.get(dukecondb.talk_store, function(data) {
                if (data) {
                    etag = data.etag;
					updateBookingsAndFavorites(data, callbackOnNewData);
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
        updateCheck : updateCheck,
        getData : getData
    }
});