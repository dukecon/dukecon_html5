define(['js/modules/dukecondb'], function(dukeconDb) {
    window.duke_privatemode = false;

    describe("dukecon db - Happy Path", function () {
        var flag = false;
        var storeKey = dukeconDb.talk_store;
        var data = {"hoi": "hoi"};

        beforeEach(function (done) {
            dukeconDb.save(storeKey, data);
            dukeconDb.get(storeKey, function (d) {
                flag = d.hoi && d.hoi === "hoi";
                done();
            });
        }, 10000);

        afterEach(function () {
            dukeconDb.clear(storeKey);
        });

        it("Happy path", function () {
            expect(flag).toEqual(true);
        });
    });
});