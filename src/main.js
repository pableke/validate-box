const DateBox = require("./date-box"); //date i18n and transformations
const NumberBox = require("./number-box"); //number i18n and transformations
const StringBox = require("./string-box"); //string extensions
const ValidateBox = require("./validate-box"); //validators

exports.dt = new DateBox();
exports.nb = new NumberBox();
exports.sb = new StringBox();
exports.vb = new ValidateBox();
