define(['js/modules/languageutils', 'moment'], function(languageUtils) {
	"use strict";
	
	var getTimeTableStart = function (startTimeAsMoment, endTimeAsMoment) {
		var currentTime = moment("2016-03-08T10:00:00"); // for testing, remove string arg later!
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
	
	var getOptions = function (firstStart, lastEnd) {
		var timetableStart = getTimeTableStart(firstStart, lastEnd);
		var timetableEnd = getTimeTableEnd(timetableStart);
		return {
			locale: languageUtils.selectedLanguage(),
			stack: true,
			min: firstStart.format(),
			start: timetableStart.format(),
			end: timetableEnd.format(),
			max: lastEnd.format(),
			moveable: true,
			zoomable: false,
			hiddenDates: [
				// these don't normally need to change because of the "repeat", so leave it hard-coded
				{
					start: "2016-01-01T20:00:00",
					end: "2016-01-02T09:00:00",
					repeat: "daily"
				}
			],
			editable: false,
			margin: {
				item: 1, // minimal margin between items
				axis: 1   // minimal margin between items and the axis
			},
			orientation: 'top'
		};
	};
	
	var move = function(hours, timeline) {
		// TODO: fix "move" function - does not factor in the hidden time slots!
		var range = timeline.getWindow();
		var newStart = hours > 0 ? moment(range.start).add(hours, 'hours') : moment(range.start).subtract(hours, 'hours');
		var newEnd = hours > 0 ? moment(range.end).add(hours, 'hours') : moment(range.end).subtract(hours, 'hours');
		timeline.setWindow({
			start: newStart,
			end: newEnd
		});
	};
	
	var zoom = function(percentage, timeline) {
		// TODO: fix "zoom" function - does not factor in the hidden time slots!
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
				move(2, timeline);
			}
		);
		$('#moveRight').on(
			"click",
			function () {
				move(-2, timeline);
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
		getOptions: getOptions
	}
});