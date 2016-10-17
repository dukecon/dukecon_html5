define(
    ['jquery'],
    function() {
        var jsonUrl = "${dukecon.server.jsonUrl}";

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
            console.log('detected conference id from url parameter: ' + getUrlVar("conference"))
        }

        // TODO refactor to use async instead of deprecated synchronuous call
        var idFromInitCall = $.ajax({
                url: window.location.href + 'init.json',
                async: false,
                dataType: 'json'
            }).responseJSON.id

        if(idFromInitCall != undefined) {
            jsonUrl = jsonUrl.replace(/\d+$/g, idFromInitCall);
            console.log('detected conference id from init call: ' + idFromInitCall)
        }

        return {
            jsonUrl : jsonUrl,
            customCssUrl : jsonUrl + "/styles.css"
        };
    }
); 
