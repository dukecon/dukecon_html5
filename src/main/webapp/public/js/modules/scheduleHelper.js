define(['js/modules/languageutils', 'moment'], function(languageUtils, moment) {
	"use strict";
	
	var getTimeTableStart = function (startTimeAsMoment, endTimeAsMoment, currentTimeForTesting) {
		var currentTime = currentTimeForTesting ? moment(currentTimeForTesting) : moment();
		return currentTime.isBetween(startTimeAsMoment, endTimeAsMoment) ? currentTime : startTimeAsMoment;
	};
	
	var getTimeTableEnd = function (startAsMoment, offsetHours) {
		var endTime = moment(startAsMoment);  // make a copy, because "add" function modifies original value!
		var offset = offsetHours || 4;
		if (screen.width <= 360) {
			offset = offset / 2;
		}
		return endTime.add(offset, 'hours');
	};

	var hiddenDates =  [
		// these don't normally need to change because of the "repeat", so leave it hard-coded
		{
			start: "2016-01-01T20:00:00",
			end: "2016-01-02T07:30:00",
			repeat: "daily"
		}
	];
	var talkOptions;
	
	var getOptions = function (firstStart, lastEnd, currentTimeForTesting) {
		var timetableStart = getTimeTableStart(firstStart, lastEnd, currentTimeForTesting);
		var timetableEnd = getTimeTableEnd(timetableStart);
		talkOptions = {
			locale: languageUtils.selectedLanguage(),
			stack: true,
			min: firstStart.format(),
			start: timetableStart.format(),
			end: timetableEnd.format(),
			max: lastEnd.format(),
			moveable: true,
			zoomable: false,
			hiddenDates: hiddenDates,
			editable: false,
			dataAttributes: ['tooltip', 'id'],
			margin: {
				item: 1, // minimal margin between items
				axis: 1   // minimal margin between items and the axis
			},
			orientation: 'top'
		};
		return talkOptions;
	};
	
	var getNewTimePoint = function(oldTime, hours) {
		var index, hiddenStart, hiddenEnd, hiddenSpan;
		var oldMoment = moment(oldTime);
		var newMoment = moment(oldTime).add(hours, 'hours');
		for (index in hiddenDates) {
			hiddenStart = moment(hiddenDates[index].start);
			hiddenEnd = moment(hiddenDates[index].end);
			hiddenSpan = hiddenEnd.diff(hiddenStart, 'minutes');
			if (hours > 0 && (newMoment.hour() > hiddenStart.hour() || oldMoment.day() < newMoment.day())) {
				newMoment = newMoment.add(hiddenSpan, 'minutes');
				break;
			}
			if (hours < 0 && (newMoment.hour() < hiddenEnd.hour() || oldMoment.day() > newMoment.day())) {
				newMoment = newMoment.subtract(hiddenSpan, 'minutes');
				break;
			}
		}
		return newMoment;
	};
	
	var move = function(hours, timeline) {
		var range = timeline.getWindow();
		var newStart = getNewTimePoint(range.start, hours);
		var newEnd =   getNewTimePoint(range.end, hours);
		timeline.setWindow({
			start: newStart,
			end: newEnd
		});
	};
	
	var zoom = function(percentage, timeline) {
		var range = timeline.getWindow();
		var interval = range.end - range.start;
		
		timeline.setWindow({
			start: range.start.valueOf() - interval * percentage,
			end: range.end.valueOf() + interval * percentage
		});
	};
	
	 var reset = function (timeline) {
		timeline.setWindow({
			start: timeline.options.start,
			end: timeline.options.end
		});
	};
	
	var registerButtonEvents = function(timeline) {
		// TODO: jump to next - prev day
		// attach events to the navigation buttons
		$('#zoomIn').on(
			"click",
			function () {
				zoom(-0.2, timeline);
			}
		);
		$('#zoomOut').on(
			"click",
			function () {
				zoom(0.2, timeline);
			}
		);
		$('#moveLeft').on(
			"click",
			function () {
				move(-2, timeline);
			}
		);
		$('#moveRight').on(
			"click",
			function () {
				move(2, timeline);
			}
		);
		$('#reset').on(
			"click",
			function () {
				reset(timeline);
			}
		);
	};
	
	return {
		registerButtonEvents: registerButtonEvents,
		getOptions: getOptions,
		
		// visible for testing
		getNewTimePoint: getNewTimePoint,
		move: move,
		zoom: zoom
	};
});