describe("talklist", function () {
    var talk_json = [
        {
            "language" : "Deutsch",
            "location" : "Schauspielhaus",
            "demo" : false,
            "track" : "Enterprise Java & Cloud",
            "abstractText" : "abstract",
            "end" : "2016-03-08T14:40",
            "level" : "Fortgeschrittene",
            "speakers" : [
                {
                    "defaultSpeaker" : true,
                    "name" : "Mark Struberg",
                    "company" : "TU Wien"
                },
                {
                    "defaultSpeaker" : false,
                    "name" : "Thorben Janssen"
                }
            ],
            "id" : "509638",
            "type" : "Tipps & Tricks",
            "title" : "CDI-2.0 deep dive",
            "start" : "2016-03-08T14:00"
        },
        {
            "language" : "Englisch",
            "location" : "Quantum 4",
            "demo" : false,
            "track" : "Newcomer",
            "abstractText" : "abstract",
            "end" : "2016-03-08T11:20",
            "level" : "Anfänger",
            "speakers" : [
                {
                    "defaultSpeaker" : true,
                    "name" : "Mark Paluch",
                    "company" : "PALUCH.biz"
                }
            ],
            "id" : "509676",
            "type" : "Neuerscheinungen oder Features",
            "title" : "What's new in CDI 2.0 (JSR 365)",
            "start" : "2016-03-08T11:00"
        }
    ];

    var talks = [new Talk(talk_json[0], false), new Talk(talk_json[1], false)];

    it("allTalks", function() {
        var model = new TalkListViewModel();
        model.initialize(talk_json);
        expect(model.allTalks[1].id).toEqual(talk_json[0].id);
        expect(model.allTalks[0].id).toEqual(talk_json[1].id);
    });
});