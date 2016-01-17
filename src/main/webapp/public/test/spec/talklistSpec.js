var hideLoading = function(timeout) {
    console.log("Mocking hideLoading() Method");
};

describe("talklist", function () {
    var talk_json = {
        "metaData": {
            "audiences": [
                { "id": "1", "order": 1, "names": { "de": "Anf�nger", "en": "beginners" }},
                { "id": "2", "order": 2, "names": { "de": "Fortgeschrittene", "en": "advanced" }}
            ],
            "talkTypes": [
                { "id": "1", "order": 1, "names": { "de": "Best Practices", "en": "best practices" }},
                { "id": "2", "order": 2, "names": { "de": "Keynote", "en": "keynote" }}
            ],
            "languages": [
                { "id": "de", "order": 1, "names": { "de": "Deutsch", "en": "German" }},
                { "id": "en", "order": 2, "names": { "de": "Englisch", "en": "English" }}
            ],
            "tracks": [
                { "id": "1", "order": 1, "names": { "de": "Container & Microservices", "en": "container & microservices" }},
                { "id": "2", "order": 2, "names": { "de": "Core Java & JVM basierte Sprachen", "en": "Core Java & JVM based languages" }},
            ],
            "locations": [
                { "id": "1", "order": 1, "names": { "de": "Wintergarten", "en": "Wintergarten" }},
                { "id": "2", "order": 2, "names": { "de": "Schauspielhaus", "en": "Schauspielhaus" }},
            ]
        },
        "events" : [{
                "id": "509415",
                "start": "2016-03-09T10:00",
                "end": "2016-03-09T10:40",
                "title": "Container-Konfiguration mit Apache Tamaya",
                "abstractText": "In diesem Vortrag wird gezeigt ...",
                "demo": true,
                "trackId": "1",
                "audienceId": "2",
                "typeId": "3",
                "roomId": "4",
                "speakerIds":
                [
                    "364340"
                ],
                "languageId": "de"
            },
            {
                "id": "509350",
                "start": "2016-03-08T10:00",
                "end": "2016-03-08T10:40",
                "title": "Securing Device Communication over MQTT",
                "abstractText": "Security is critical...",
                "demo": true,
                "trackId": "6",
                "audienceId": "2",
                "typeId": "1",
                "roomId": "4",
                "speakerIds":
                [
                    "364340"
                ],
                "languageId": "en"
            }],
        "speakers" : [
            {"id": "364340",
            "name": "Arek Czarnik",
            "company": "Rewe-Digital",
            "defaultSpeaker": false,
            "talkIds":["509415", "509350"]
            }
        ]
    };

    it("allTalks", function() {
        var model = new TalkListViewModel();
        model.initialize(talk_json);
        expect(model.allTalks[0].id).toEqual(talk_json.events[0].id);
        expect(model.allTalks[1].id).toEqual(talk_json.events[1].id);
    });
});