define([], function() {
	var getBrowserLanguage = function() {
		var supportedLanguages = ["en", "de"];
		var browserLanguage = window.navigator.userLanguage || window.navigator.language;
		browserLanguage = browserLanguage.replace(/\-.*/g, "");
		if (supportedLanguages.indexOf(browserLanguage) < 0) {
			browserLanguage = "de";
		}
		return browserLanguage;
	};
	return {
		getBrowserLanguage: getBrowserLanguage
	};
});