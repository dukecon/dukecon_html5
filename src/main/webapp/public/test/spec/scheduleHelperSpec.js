define(['js/modules/scheduleHelper', 'moment'], function(scheduleHelper, moment) {
    describe("dukecon - scheduleHelper", function () {
    	moment.locale("en");
    	
        var currentTimeBeforeRange = moment("2016-03-07T10:00:00+01:00");
        var currentTimeInRange = moment("2016-03-08T10:00:00+01:00");
		var currentTimeAfterRange = moment("2016-03-10T10:00:00+01:00");
		var startTime = moment("2016-03-08T08:00:00+01:00");
        var endTime = moment("2016-03-09T20:00:00+01:00");
        
        var timeLineMock = function() {
            var me = this;
            me.start = null;
            me.end = null;
            return {
                setWindow: function(params) {
                    start = params.start;
                    end = params.end;
                }
            }
        };
        
        it("sets correct min, max, start and end time if current time in range", function () {
        	var options = scheduleHelper.getOptions(startTime, endTime, currentTimeInRange);
        	expect(options.min).toBe(startTime.format());
        	expect(options.max).toBe(endTime.format());
        	expect(options.start).toBe(currentTimeInRange.format());
        	expect(options.end).toBe("2016-03-08T14:00:00+01:00");
        });
        it("sets correct min, max, start and end time if current time before range", function () {
			var options = scheduleHelper.getOptions(startTime, endTime, currentTimeBeforeRange);
			expect(options.min).toBe(startTime.format());
			expect(options.max).toBe(endTime.format());
			expect(options.start).toBe(startTime.format());
			expect(options.end).toBe("2016-03-08T12:00:00+01:00");
        });
        it("sets correct min, max, start and end time if current time after range", function () {
			var options = scheduleHelper.getOptions(startTime, endTime, currentTimeAfterRange);
			expect(options.min).toBe(startTime.format());
			expect(options.max).toBe(endTime.format());
			expect(options.start).toBe(startTime.format());
			expect(options.end).toBe("2016-03-08T12:00:00+01:00");
        });
        it("calculates time point, same day, forward", function () {
        	var result = scheduleHelper.getNewTimePoint(startTime.format(), 4);
        	expect(result.format()).toBe("2016-03-08T12:00:00+01:00");
        });
        it("calculates time point, same day, backward", function () {
			var result = scheduleHelper.getNewTimePoint(endTime.format(), -4);
			expect(result.format()).toBe("2016-03-09T16:00:00+01:00");
        });
        it("calculates time point, across days, forward", function () {
			var result = scheduleHelper.getNewTimePoint(endTime.format(), 4);
			expect(result.format()).toBe("2016-03-10T13:00:00+01:00");
        });
        it("calculates time point, across days, backward", function () {
			var result = scheduleHelper.getNewTimePoint(currentTimeInRange.format(), -4);
			expect(result.format()).toBe("2016-03-07T17:00:00+01:00");
        });
        xit("zooms in", function () {
        });
        xit("zooms out", function () {
        });
    });
});

