
const DateBox = require("./date-box"); //date i18n and transformations
const NumberBox = require("./number-box"); //number i18n and transformations
const StringBox = require("./string-box"); //string extensions
const ValidateBox = require("./validate-box"); //validators

const dt = new DateBox();
const nb = new NumberBox();
const sb = new StringBox();
const vb = new ValidateBox();

module.exports = {
	dt, nb, sb, vb, //instances
	setI18n: function(lang) {
		dt.setI18n(lang);
		nb.setI18n(lang);
		return this;
	}
};
