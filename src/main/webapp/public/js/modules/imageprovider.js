define(
    ['jquery', 'js/modules/urlprovider'],
    function($, urlprovider) {
        var defaultImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1px transparent
        var currentBaseUrl = urlprovider.getCurrentBaseUrl();
        var imageResourceUrl = "/rest/image-resources.json";
        console.log('Image provider Using currentBaseUrl: "' + currentBaseUrl + '"');

        var imageResources = {};
        
        var pendingCallbacks = [];

        function loadResources(name, callback) {
            if(imageResources.loading && callback !== null) {
                pendingCallbacks.push(function () {
                    callback(imageResources[name] || defaultImage)
                })
                return;
            }
            imageResources.loading = true;
            console.log("Getting images from " + currentBaseUrl + imageResourceUrl);
            $.ajax({
                url: currentBaseUrl + imageResourceUrl,
                dataType: 'json',
                success: function (result) {
                    imageResources = result;
                    imageResources.loaded = true;
                    pendingCallbacks.forEach(function (element) {
                        element()
                    })
                },
                error: function(err) {
                    console.log("could not get resources: " + JSON.stringify(err));
                }
            });
        }

        function getByName(name, callback) {
            if (!imageResources.loaded) {
                loadResources(name, callback);
            }
            else {
                callback(imageResources[name] || defaultImage);
            }
        }

        loadResources();

        return {
            getByName: getByName,
            defaultImage: defaultImage
        };
    }
); 
