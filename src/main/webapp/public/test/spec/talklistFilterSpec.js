describe("talklist filter logic", function () {
    var metadata = {
        "audiences": [
            { "id": "1", "order": 1, "names": { "de": "Anfaenger", "en": "beginners" }},
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
    };

    var expectFilter = function(filter, title, filterKey, expectedFilterValues, checkSelected) {
        expect(filter.title()).toEqual(title);
        expect(filter.filterKey).toEqual(filterKey);
        _.each(filter.filtervalues(), function(value, index) {
            expect(value.ui_id).toEqual(expectedFilterValues[index].ui_id);
            expect(value.id).toEqual(expectedFilterValues[index].id);
            expect(value.en).toEqual(expectedFilterValues[index].en);
            expect(value.de).toEqual(expectedFilterValues[index].de);
            expect(value.displayName()).toEqual(expectedFilterValues[index].displayName());
            if (checkSelected) {
                expect(value.selected()).toEqual(expectedFilterValues[index].selected());
            }
        });
    };

    it("Initialize filters de", function(done) {
        languageUtils.selectedLanguage("de");
        var model = new TalkListViewModel();
        model.initializeFilters(metadata);
        expectFilter(model.filters[0], "Zielgruppe", "level", [new FilterValue("audiences", metadata.audiences[0], false), new FilterValue("audiences", metadata.audiences[1], false)], false);
        expectFilter(model.filters[1], "Sprache", "language", [new FilterValue("languages", metadata.languages[0], false), new FilterValue("languages", metadata.languages[1], false)], false);
        expectFilter(model.filters[2], "Track", "track", [new FilterValue("tracks", metadata.tracks[0], false), new FilterValue("tracks", metadata.tracks[1], false)], false);
        expectFilter(model.filters[3], "Ort", "location", [new FilterValue("locations", metadata.locations[0], false), new FilterValue("locations", metadata.locations[1], false)], false);
        done();
    });

    it("Initialize filters en", function(done) {
        languageUtils.selectedLanguage("en");
        var model = new TalkListViewModel();
        model.initializeFilters(metadata);
        expectFilter(model.filters[0], "Audience", "level", [new FilterValue("audiences", metadata.audiences[0], false), new FilterValue("audiences", metadata.audiences[1], false)], false);
        expectFilter(model.filters[1], "Language", "language", [new FilterValue("languages", metadata.languages[0], false), new FilterValue("languages", metadata.languages[1], false)], false);
        expectFilter(model.filters[2], "Track", "track", [new FilterValue("tracks", metadata.tracks[0], false), new FilterValue("tracks", metadata.tracks[1], false)], false);
        expectFilter(model.filters[3], "Location", "location", [new FilterValue("locations", metadata.locations[0], false), new FilterValue("locations", metadata.locations[1], false)], false);
        done();
    });
});