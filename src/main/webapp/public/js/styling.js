var styleUtils = { // TODO: Manifest! (images too)
     imageBase: "img/",
     imageExt: ".jpg",
     trackLookup: { // might be a better way to do this; also the icons are from 2016 and don't fully match
          "Cloud and Big Data" : "track_enterprise-java-cloud",
          "Core Java" : "track_jvm-languages",
          "Enterprise Java" : "track_enterprise-java-cloud",
          "Frontend" : "track_frontend-mobile",
          "IDEs and tools" : "track_ide-tools",
          "Internet of things" : "track_internet-of-things",
          "JVM languages" : "track_jvm-languages",
          "Mobile" : "track_frontend-mobile",
          "Security" : "track_newcomer",
          "Software architecture and methods" : "track_architecture"
     },

     getTrackCssStyle: function(track) {
          return (trackLookup[track] ? trackLookup[track] : "";
     },

     getTackIcon: function(track) {
          if (trackLookup[track]) {
               return imageBase + trackLookup[track] + imageBase;
          } else {
               return imageBase + "track_newcomer.jpg";
          }
     },

     getLanguageStyle: function(language) {
          return language.toLowerCase();
     }
};