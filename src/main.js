
/**
 * @file main.js is the root file for this module
 * @author Pablo Rosique Vidal
 * @see <a href="https://github.com/pableke/validate-box">validate-box</a>
 */

const DataBox = require("./data-box"); //data structure
const DateBox = require("./date-box"); //date i18n and transformations
const NumberBox = require("./number-box"); //number i18n and transformations
const StringBox = require("./string-box"); //string extensions
const ValidateBox = require("./validate-box"); //validators

const vb = new ValidateBox();

vb.ds = new DataBox();
vb.dt = new DateBox();
vb.nb = new NumberBox();
vb.sb = new StringBox();

vb.setI18n = function(lang) {
	this.dt.setI18n(lang);
	this.nb.setI18n(lang);
	return this;
}

module.exports = vb;
