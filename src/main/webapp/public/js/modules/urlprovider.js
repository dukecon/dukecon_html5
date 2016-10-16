define(
    [],
    function() {
        var jsonUrl = "${dukecon.server.jsonUrl}";
        var customCssUrl = "${dukecon.server.jsonUrl}/styles.css";

        // temporarely for retrieving conference id from url parameter for switching between conferences,
        // can be removed when conference switch is implemented in html5 client
        var getUrlVar = function(name) {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function(m,key,value) {
                    vars[key] = value;
                });
            return vars[name];
        };

        // temporarely for retrieving conference id from url parameter for switching between conferences,
        // can be removed when conference switch is implemented in html5 client
        if (getUrlVar("conference") != undefined) {
            jsonUrl = jsonUrl.replace(/\d+$/g, getUrlVar("conference"));
            customCssUrl = jsonUrl + "/styles.css";
        }

        return {
            jsonUrl : jsonUrl,
            customCssUrl : customCssUrl
        };
    }
); 
