require.config({
    paths: {
        "jquery": "js/jquery-2.1.4.min",
        "underscore": "js/underscore-min",
        "knockout": "js/knockout-min-3.3.0"
    }
});

require(['jquery', 'js/modules/dukecondb', 'js/modules/dukeconsettings', 'domReady!'], function($, db, settings) {
    console.log("Clearing DB");
    db.purge();
    console.log("Clearing DB done; resetting localstore");
    settings.purge();
    console.log("Resetting localstore done; clearing the cache");
    window.parent.caches.delete("call");
    console.log("Clearing the cache done");
    $('#loading').hide();
    $('#layout').show();
});
