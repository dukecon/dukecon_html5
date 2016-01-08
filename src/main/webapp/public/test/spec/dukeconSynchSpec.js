describe("dukecon - Synch", function() {

    beforeEach(function() {
        jasmine.Ajax.install();
        //fake dukecloak
        window.dukecloak = {
            keycloakAuth :
                { token  : '',
                    authenticated : true,
                    updateToken : function() {
                        return {
                            success : function(callback) {
                                callback();
                                return this;
                            },
                            error : function() { /* Nothing to do */ }
                        }
                    }
                }};
    });

    it("synch favourites", function() {
        spyOn(dukeconSettings, 'getFavourites').and.returnValue(['509516', '509557']);

        dukeconSynch.push();

        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe('rest/preferences');
        expect(request.method).toBe('POST');
        expect(request.data()).toEqual([{ eventId : '509516' , version : '1' },{ eventId : '509557' , version : '1'}]);
    });
});
