describe("dukecon db - Happy Path", function() {
    var flag = false;
    var storeKey = "testdb";
    var data = {"hoi" : "hoi"};

    beforeAll(function(done) {
        dukeconDb.save(storeKey, data);
        dukeconDb.get(storeKey, function (d) {
            flag = d.hoi && d.hoi === "hoi";
            done();
        });
    });

    afterAll(function() {
       dukeconDb.clear(storeKey);
    });

    it("Happy path", function(done) {
        expect(flag).toEqual(true);
        done();
    });
});