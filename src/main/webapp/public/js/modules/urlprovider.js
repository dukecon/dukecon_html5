define(
    ['jquery'],
    function($) {
        var cssFile = "/styles.css";
        var emtpyFunc = function() {};
        
        var currentBaseUrl = window.location.href.replace(/\/[^\/]+\.html/ig, "");
        var jsonUrl, customCssUrl;
        var allQueryParams;

        function getQueryParams() {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function(m,key,value) {
                    vars[key] = decodeURIComponent(value);
                    console.log(vars[key]);
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

        function setUrls(newUrl, allowOverride) {
             jsonUrl = newUrl;
             if (allowOverride && getUrlVar("conference") != undefined) {
                 jsonUrl = jsonUrl.replace(/\d+$/g, getUrlVar("conference"));
                 console.log('detected conference id from url parameter: ' + getUrlVar("conference"))
             }
             customCssUrl = jsonUrl + cssFile;
         }

        // temporarily for retrieving conference id from url parameter for switching between conferences,
        // can be removed when conference switch is implemented in html5 client

        function loadInitData(callback) {
            $.ajax({
                url: currentBaseUrl + '/rest/init.json',
                dataType: 'json',
                success: function (data) {
                    if (data.id != undefined) {
                        setUrls(jsonUrl.replace(/\d+$/g, data.id), false);
                        console.log('detected conference id from init call: ' + data.id)
                    }
                    if (callback) {
                        callback(jsonUrl, customCssUrl);
                    }
                },
                error: function() {
                }
            });
        }

        setUrls("${dukecon.server.jsonUrl}", true);
        loadInitData();
        
        return {
            getJsonUrl: function(callback) {
                callback = callback || emptyFunc;
                if (!jsonUrl) {
                    loadInitData(function(jsonUrl, unused) {
                        callback(jsonUrl);
                    });
                }
                else {
                    callback(jsonUrl);
                }
            },
            getCustomCssUrl: function(callback) {
                callback = callback || emptyFunc;
                if (!customCssUrl) {
                    loadInitData(function(unused, customCssUrl) {
                        callback(customCssUrl);
                    });
                }
                else {
                    callback(customCssUrl);
                }
            },
            getUrlParam: getUrlVar,
            setUrlParam: setUrlVar
        };
    }
); 
