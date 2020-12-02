
/**
 * @file main.js is the root file for this module
 * @author Pablo Rosique Vidal
 * @see <a href="https://github.com/pableke/validate-box">validate-box</a>
 */

const DataBox = require("./data-box"); //data structure
const DateBox = require("./date-box"); //date i18n and transformations
const MessageBox = require("./message-box"); //validation messages
const NumberBox = require("./number-box"); //number i18n and transformations
const StringBox = require("./string-box"); //string extensions
const ValidateBox = require("./validate-box"); //validators

const mb = new MessageBox();
const vb = new ValidateBox(mb);

vb.ds = new DataBox();
vb.dt = new DateBox();
vb.mb = mb;
vb.nb = new NumberBox();
vb.sb = new StringBox();

vb.setI18n = function(lang) {
	vb.dt.setI18n(lang);
	vb.mb.setI18n(lang);
	vb.nb.setI18n(lang);
	return vb;
}

module.exports = vb;
