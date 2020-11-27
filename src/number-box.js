
/**
 * Number-Box module for internationalization
 * @module Number-Box
 */
module.exports = function NumberBox(lang) {
	const self = this; //self instance
	const RE_SECTION = /\D+/g; //remove no digits
	const EMPTY = "";
	const DOT = ".";

	//helpers
	function isnum(val) { return (typeof val == "number"); }
	function isstr(val) { return (typeof val == "string") || (val instanceof String); }
	function fnTrim(str) { return isstr(str) ? str.trim() : str; } //string only
	function fnSize(str) { return str ? str.length : 0; } //string o array
	function boolval(val) { return val && (val !== "false") && (val !== "0"); }
	function rtl(str, size) {
		var result = []; //parts container
		for (var i = fnSize(str); i > size; i -= size)
			result.unshift(str.substr(i - size, size));
		(i > 0) && result.unshift(str.substr(0, i));
		return result;
	}
	function _format(num, s, d, n) {
		if (!isnum(num)) return EMPTY;
		n = dNaN(n, 2); //default 2 decimals
		var decimals = d && (n > 0); //show decimals
		var sign = (num < 0) ? "-" : EMPTY; //positive?
		var strval = fnRound(num, n).toString();
		strval = ((num < 0) ? strval.substr(1) : strval) || "0";
		var separator = strval.lastIndexOf(DOT); //search in strval last decimal separator index
		return sign + ((separator < 0)
								? (rtl(strval, 3).join(s) + (decimals ? (d + "0".repeat(n)) : EMPTY))
								: (rtl(strval.substr(0, separator), 3).join(s) + (decimals ? (d + strval.substr(separator + 1).padEnd(n, "0")) : EMPTY)));
	}
	function toNumber(str, d, n) {
		str = fnTrim(str);
		if (!str) return null;
		var separator = str.lastIndexOf(d);
		var sign = (str.charAt(0) == "-") ? "-" : EMPTY;
		var num = parseFloat(sign + ((separator < 0)
										? str.replace(RE_SECTION, EMPTY) 
										: (str.substr(0, separator).replace(RE_SECTION, EMPTY) + DOT + str.substr(separator + 1))));
		return fnRound(num, n); //default 2 decimals
	}

	const langs = {
		en: { //english
			toFloat: function(str) { return toNumber(str, DOT); }, //build number
			float: function(num, d) { return _format(num, ",", DOT, d); }, //float format without decimals
			integer: function(num) { return _format(num, ",", DOT, 0); }, //int format without decimals
			trIsoFloat: function(str, d) { return str ? this.float(parseFloat(str), d) : str; }, //reformat iso string
			trIsoInt: function(str) { return str ? this.integer(parseFloat(str)) : str; }, //reformat iso string
			helper: function(str, d) { return str && this.float(this.toFloat(str), d); }, //reformat
			boolval: function(val) { return boolval(val) ? "Yes" : "No"; } //boolean english
		},

		es: { //spanish
			toFloat: function(str) { return toNumber(str, ","); }, //build number
			float: function(num, d) { return _format(num, DOT, ",", d); }, //float format without decimals
			integer: function(num) { return _format(num, DOT, ",", 0); }, //int format without decimals
			trIsoFloat: function(str, d) { return str ? this.float(parseFloat(str), d) : str; }, //reformat iso string
			trIsoInt: function(str) { return str ? this.integer(parseFloat(str)) : str; }, //reformat iso string
			helper: function(str, d) { return str && this.float(this.toFloat(str), d); }, //reformat
			boolval: function(val) { return boolval(val) ? "Sí" : "No"; } //boolean spainish
		}
	};
	var _lang = langs.es; //default

	/**
	 * Gets the object language associated to <b>lang</b> param, or current language if <b>lang</b> does not exists.
	 *
	 * @function getLang
	 * @param      {string} lang     The language string identificator: "en", "es", etc.
	 * @return     {Object} The object containing all language operators.
	 */
	this.getLang = function(lang) { return lang ? langs[lang] : _lang; }

	/**
	 * Sets data object parameter as language associated to <b>lang</b> param.
	 *
	 * @function setLang
	 * @param      {string}  lang     The language string identificator: "en", "es", etc.
	 * @param      {Object}  data     The object containing all language operators.
	 * @return     {NumberBox} self instace of NumberBox
	 */
	this.setLang = function(lang, data) { langs[lang] = data; return self; }

	/**
	 * Gets the object language associated to <b>lang</b> param, or default language if <b>lang</b> does not exists.
	 *
	 * @function getI18n
	 * @param      {string} lang     The language string identificator: "en", "es", etc.
	 * @return     {Object} The object containing all language operators.
	 */
	this.getI18n = function(lang) { return langs[lang] || (lang && langs[lang.substr(0, 2)]) || langs.es; }

	/**
	 * Sets as current language, the object associated to <b>lang</b> param, or sets default language if <b>lang</b> does not exists.
	 *
	 * @function setI18n
	 * @param      {string} lang     The language string identificator: "en", "es", etc.
	 * @return     {NumberBox} self instace of NumberBox
	 */
	this.setI18n = function(lang) { _lang = self.getI18n(lang); return self; }

	/**
	 * Determines whether the specified string is number.
	 * <pre><ul>
	 * <li>isNaN(null) == false => isNumber(null) == false</li>
	 * <li>isNaN("") == false => isNumber("") == false</li>
	 * <li>isNaN("  ") == false => isNumber("  ") == false</li>
	 * <li>isNaN("0") == false => isNumber("0") == true</li>
	 * <li>isNaN("3j") == true => isNumber("3j") == false</li>
	 * </ul></pre>
	 *
	 * @function isNumber
	 * @param      {string} str     String representing a number
	 * @return     {boolean} True if the specified string is number, False otherwise.
	 */
	this.isNumber = function(str) {
		str = fnTrim(str);
		return str && !isNaN(str);
	};

	/**
	 * Retunr <b>val</b> param if it is number or <b>def</b> param otherwise.
	 * <pre><ul>
	 * <li>(typeof null == "number") == false => dNaN(null, def) == def</li>
	 * <li>(typeof "" == "number") == false => dNaN("", def) == def</li>
	 * <li>(typeof "  " == "number") == false => dNaN("  ", def) == def</li>
	 * <li>(typeof "0" == "number") == false => dNaN("0", def) == def</li>
	 * <li>(typeof 0 == "number") == true => dNaN(0, def) == 0</li>
	 * <li>(typeof "3j" == "number") == false => dNaN("3j", def) == def</li>
	 * </ul></pre>
	 *
	 * @function dNaN
	 * @param      {string} val     Variable to check if is a number
	 * @param      {number} def     Default value to return if val is not a number
	 * @return     {number} val if it is a number or def otherwise
	 */
	function dNaN(val, def) { return isnum(val) ? val : def; }
	this.dNaN = dNaN;

	this.toFloat = function(str) { return _lang.toFloat(str); }
	this.float = function(num, d) { return _lang.float(num, d); }
	this.integer = function(num) { return _lang.integer(num); }
	this.trIsoFloat = function(num, d) { return _lang.trIsoFloat(num, d); }
	this.trIsoInt = function(num) { return _lang.trIsoInt(num); }
	this.helper = function(str, d) { return _lang.helper(str, d); }
	this.boolval = function(val) { return _lang.boolval(val); }

	/**
	 * Check if <b>num</b> is number and greater than 0.
	 *
	 * @function gt0
	 * @param      {number} num     The number value
	 * @return     {boolean} True if is number and greater than 0, False otherwise.
	 */
	this.gt0 = function(num) { return dNaN(num, 0) > 0; }

	/**
	 * Check if <b>num</b> is not number or less than 0.
	 *
	 * @function le0
	 * @param      {number} num     The value
	 * @return     {boolean} True if is not number or is less than 0, False otherwise.
	 */
	this.le0 = function(num) { return isNaN(num) || (num <= 0); } //is pk ok?

	/**
	 * Close <b>num</b> between [min..max] values.
	 * <pre><ul>
	 * <li>num < min => between == min</li>
	 * <li>min <= num <= max => between == num</li>
	 * <li>max < min => between == max</li>
	 * </ul></pre>
	 *
	 * @function between
	 * @param      {number}   num     The number
	 * @param      {number}   min     The minimum value
	 * @param      {number}   max     The maximum value
	 * @return     {boolean}  True if num is between [min..max], False otherwise 
	 */
	this.between = function(num, min, max) { min = dNaN(min, num); max = dNaN(max, num); return (min <= num) && (num <= max); }

	/**
	 * Gets an aleatorian value between [min..max] values.
	 *
	 * @function range
	 * @param      {number}   num     The number
	 * @param      {number}   min     The minimum value
	 * @param      {number}   max     The maximum value
	 * @return     {boolean}  True if num is between [min..max], False otherwise 
	 */
	this.range = function(val, min, max) { return Math.max(Math.min(val, max), min); }

	/**
	 * Gets an aleatorian value between [min..max] values.
	 *
	 * @function rand
	 * @param      {number}  min     The minimum value
	 * @param      {number}  max     The maximum value
	 * @return     {number}  Aleatory number between [min..max] values
	 */
	this.rand = function(min, max) { return Math.random() * (max - min) + min; }

	/**
	 * Parse <b>val</b> to integer, or 0 if is NaN
	 *
	 * @function intval
	 * @param      {variable} val The value
	 * @return     {number} The integer represents val param
	 */
	this.intval = function(val) { return parseInt(val) || 0; }

	/**
	 * Parse <b>val</b> to float, or 0 if is NaN
	 *
	 * @function floatval
	 * @param      {variable} val     The value
	 * @return     {number} The float represents val param
	 */
	this.floatval = function(val) { return parseFloat(val) || 0; }

	/**
	 * Round the specified number to a determinate scale
	 *
	 * @function round
	 * @param      {number} num     The number to be rounded
	 * @param      {number} dec     Number of decimals for rounding num @default 2
	 * @return     {number} Number rounded
	 */
	function fnRound(num, dec) { dec = dNaN(dec, 2); return +(Math.round(num + "e" + dec) + "e-" + dec); }
	this.round = fnRound;

	//load default language
	self.setI18n(lang);
}
