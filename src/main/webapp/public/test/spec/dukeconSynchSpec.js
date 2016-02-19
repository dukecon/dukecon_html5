define(['js/modules/dukeconsettings', 'js/modules/synch'], function(dukeconSettings, dukeconSynch){
    describe("dukeconSynch", function() {

        var testDukeCloak  = {
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
        var realTalklistModel;

        beforeEach(function() {
            jasmine.Ajax.install();
            if (window.dukeconTalklistModel) {
                realTalklistModel = window.dukeconTalklistModel;
            }
            window.dukeconTalklistModel = {
                updateFavourites : function() { /* Nothing to do */ }
            };
        });

        afterEach(function() {
            jasmine.Ajax.uninstall();
            if (realTalklistModel) {
                window.dukeconTalklistModel = realTalklistModel;
            }
        });

        it("push", function() {
            spyOn(dukeconSettings, 'getFavourites').and.returnValue(['509516', '509557']);

            dukeconSynch.push(testDukeCloak);

            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('rest/preferences');
            expect(request.method).toBe('POST');
            expect(request.data()).toEqual([{ eventId : '509516' , version : '1' },{ eventId : '509557' , version : '1'}]);
        });

        it("pull - merge 1", function() {
            spyOn(dukeconTalklistModel, "updateFavourites");
            spyOn(dukeconSynch.visibleForTesting, "push").and.returnValue(null);
            spyOn(dukeconSettings, "getFavourites").and.returnValue(['3', '4']);

            spyOn(dukeconSettings, "saveSetting").and.returnValue(null);

            dukeconSynch.pull(testDukeCloak);

            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('rest/preferences');
            expect(request.method).toBe('GET');

            request.respondWith({
                status: 200,
                responseText: '[{"eventId":"1","version":0},{"eventId":"2","version":0},{"eventId":"3","version":0},{"eventId":"4","version":0}]'
            });

            expect(dukeconSettings.saveSetting).toHaveBeenCalledWith("dukeconfavs", ["1", "2", "3", "4"]);
            expect(dukeconSynch.visibleForTesting.push).toHaveBeenCalledWith(testDukeCloak);
            expect(dukeconTalklistModel.updateFavourites).toHaveBeenCalled();
        });

        it("pull - merge 2", function() {
            spyOn(dukeconTalklistModel, "updateFavourites");
            spyOn(dukeconSynch.visibleForTesting, "push").and.returnValue(null);
            spyOn(dukeconSettings, "getFavourites").and.returnValue(['1', '2', '3', '4']);

            spyOn(dukeconSettings, "saveSetting").and.returnValue(null);

            dukeconSynch.pull(testDukeCloak);

            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('rest/preferences');
            expect(request.method).toBe('GET');

            request.respondWith({
                status: 200,
                responseText: '[{"eventId":"1","version":0},{"eventId":"2","version":0}]'
            });

            expect(dukeconSettings.saveSetting).toHaveBeenCalledWith("dukeconfavs", ["1", "2", "3", "4"]);
            expect(dukeconSynch.visibleForTesting.push).toHaveBeenCalledWith(testDukeCloak);
            expect(dukeconTalklistModel.updateFavourites).toHaveBeenCalled();
        });

        it("pull - take local", function() {
            spyOn(dukeconTalklistModel, "updateFavourites");
            spyOn(dukeconSynch.visibleForTesting, "push").and.returnValue(null);
            spyOn(dukeconSettings, "getFavourites").and.returnValue(['3', '4']);
            spyOn(dukeconSettings, "getSetting").and.returnValue(true);

            spyOn(dukeconSettings, "saveSetting").and.returnValue(null);

            dukeconSynch.pull(testDukeCloak);

            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('rest/preferences');
            expect(request.method).toBe('GET');

            request.respondWith({
                status: 200,
                responseText: '[{"eventId":"1","version":0},{"eventId":"2","version":0},{"eventId":"3","version":0}]'
            });

            expect(dukeconSettings.saveSetting).toHaveBeenCalledWith("dukeconfavs", ["3", "4"]);
            expect(dukeconSynch.visibleForTesting.push).toHaveBeenCalledWith(testDukeCloak);
            expect(dukeconTalklistModel.updateFavourites).toHaveBeenCalled();
        });

        it("pull - no changes", function() {
            spyOn(dukeconTalklistModel, "updateFavourites");
            spyOn(dukeconSynch.visibleForTesting, "push").and.returnValue(null);
            spyOn(dukeconSettings, "getFavourites").and.returnValue(['3', '4']);

            spyOn(dukeconSettings, "saveSetting").and.returnValue(null);

            dukeconSynch.pull(testDukeCloak);

            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('rest/preferences');
            expect(request.method).toBe('GET');

            request.respondWith({
                status: 200,
                responseText: '[{"eventId":"3","version":0},{"eventId":"4","version":0}]'
            });

            expect(dukeconSettings.saveSetting.calls.any()).toEqual(false);
            expect(dukeconSynch.visibleForTesting.push.calls.any()).toEqual(false);
            expect(dukeconTalklistModel.updateFavourites.calls.any()).toEqual(false);
        });
    });
});


