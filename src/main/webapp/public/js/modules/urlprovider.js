define(
    ['jquery'],
    function($) {
        var cssFile = "/styles.css";
        var currentBaseUrl = window.location.href
            .replace(/\/[^\/]+\.html\S*/ig, "")
            .replace(/#\S*/g, "")
            .replace(/\/$/ig, "");
        console.log('Using currentBaseUrl: "' + currentBaseUrl + '"');
        var jsonUrl, customCssUrl, bookingsUrl, initialized = false;
        var allQueryParams;

        function getQueryParams() {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function(m,key,value) {
                    vars[key] = decodeURIComponent(value);
                });
            allQueryParams = vars;
        }
        
        var getUrlVar = function(name) {
            if (!allQueryParams) {
                getQueryParams();
            }
            return allQueryParams[name];
        };

        var setUrlVar = function(name, value) {
            if (!allQueryParams) {
                getQueryParams();
            }
            allQueryParams[name] = value;
            var newUrl = window.location.href.replace(/\?\S*/g, "");
            var first = true;
            for (paramName in allQueryParams) {
                if (allQueryParams[paramName]) {
                    newUrl += first ? "?" : "&";
                    first = false;
                    newUrl += paramName + "=" + encodeURIComponent(allQueryParams[paramName]);
                }
            }
            // write modified querystring without reloading the page
            if (history.pushState) {
                window.history.pushState({path:newUrl},'',newUrl);
            }
        };

        function insertConferenceIdIntoUrl(oldUrl, newId) {
            if (oldUrl.indexOf(newId) >= 0) {
                return oldUrl;
            }
            return oldUrl.replace(/[^\/]+[\/]?$/g, newId);
        }

        function setUrls(newUrl, allowOverride) {
             jsonUrl = newUrl;
             if (allowOverride && getUrlVar("conference") != undefined) {
                 jsonUrl = insertConferenceIdIntoUrl(jsonUrl, getUrlVar("conference"));
                 console.log('detected conference id from url parameter: ' + getUrlVar("conference"));
             }
             bookingsUrl = jsonUrl.replace("conferences", "eventsBooking");
             customCssUrl = jsonUrl.replace(".json", "") + cssFile;
         }

        function loadInitData(callback) {
            console.log("initializing via " + currentBaseUrl + '/rest/init.json');
            $.ajax({
                url: currentBaseUrl + '/rest/init.json',
                dataType: 'json',
                success: function (data) {
                    if (data.id != undefined) {
                        setUrls(insertConferenceIdIntoUrl(jsonUrl, data.id), false);
                        console.log('detected conference id from init call: ' + data.id)
                    }
                    if (callback) {
                        callback(jsonUrl, customCssUrl, bookingsUrl);
                    }
                    initialized = true;
                },
                error: function(err) {
                    console.log("could not initialize: " + JSON.stringify(err));
                    initialized = false;
                }
            });
        }

        setUrls("${dukecon.server.jsonUrl}", true);
        loadInitData();

        var emtpyFunc = function() {};

        return {
            imageBaseUrl: currentBaseUrl + '/rest/speaker/images/',
            getJsonUrl: function(callback) {
                callback = callback || emptyFunc;
                if (!initialized) {
                    loadInitData(function(jsonUrl, unused1, unused2) {
                        callback(jsonUrl);
                    });
                }
                else {
                    callback(jsonUrl);
                }
            },
            getCustomCssUrl: function(callback) {
                callback = callback || emptyFunc;
                if (!initialized) {
                    loadInitData(function(unused1, customCssUrl, unused2) {
                        callback(customCssUrl);
                    });
                }
                else {
                    callback(customCssUrl);
                }
            },
            getBookingsUrl: function(callback) {
                callback = callback || emptyFunc;
                if (!initialized) {
                    loadInitData(function(unused1, unused2, bookingsUrl) {
                        callback(bookingsUrl);
                    });
                }
                else {
                    callback(bookingsUrl);
                }
            },
            getUrlParam: getUrlVar,
            setUrlParam: setUrlVar
        };
    }
); 
