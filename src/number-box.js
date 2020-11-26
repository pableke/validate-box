
/**
 * Number-Box module
 * @module Number-Box
 */
module.exports = function NumberBox(lang) {
	const self = this; //self instance
	const RE_SECTION = /\D+/g; //remove no digits
	const EMPTY = "";
	const DOT = ".";

	//helpers
	function dNaN(val, def) { return (typeof val == "number") ? val : def; }
	function intval(val) { return parseInt(val) || 0; }
	function floatval(val) { return parseFloat(val) || 0; }
	function fnSize(str) { return str ? intval(str.length) : 0; }
	function boolval(val) { return val && (val !== "false") && (val !== "0"); }
	function isset(val) { return (typeof val != "undefined") && (val != null); }
	function fnRound(num, d) { d = dNaN(d, 2); return +(Math.round(num + "e" + d) + "e-" + d); }
	function rtl(str, size) {
		var result = []; //parts container
		for (var i = fnSize(str); i > size; i -= size)
			result.unshift(str.substr(i - size, size));
		(i > 0) && result.unshift(str.substr(0, i));
		return result;
	}
	function _format(num, s, d, n) {
		if (!isset(num)) return EMPTY;
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
		if (!str) return 0;
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

		es: { //spain
			toFloat: function(str) { return toNumber(str, ","); }, //build number
			float: function(num, d) { return _format(num, DOT, ",", d); }, //float format without decimals
			integer: function(num) { return _format(num, DOT, ",", 0); }, //int format without decimals
			trIsoFloat: function(str, d) { return str ? this.float(parseFloat(str), d) : str; }, //reformat iso string
			trIsoInt: function(str) { return str ? this.integer(parseFloat(str)) : str; }, //reformat iso string
			helper: function(str, d) { return str && this.float(this.toFloat(str), d); }, //reformat
			boolval: function(val) { return boolval(val) ? "Sí" : "No"; } //boolean spainish
		}
	};

	//public functions
	var _lang = langs.es; //default
	this.getLang = function(lang) { return lang ? langs[lang] : _lang; }
	this.setLang = function(lang, data) { langs[lang] = data; return self; }
	this.getI18n = function(lang) { return langs[lang] || (lang && langs[lang.substr(0, 2)]) || langs.es; }
	this.setI18n = function(lang) { _lang = self.getI18n(lang); return self; }

	this.intval = intval;
	this.floatval = floatval;

	/**
	 * Determines whether the specified string is number.
	 * <pre><ul>
	 * <li>isNaN(null) == false => isNumber(null) == false</li>
	 * <li>isNaN("") == false => isNumber("") == false</li>
	 * <li>isNaN("  ") == false => isNumber("  ") == false</li>
	 * <li>isNaN("0") == true => isNumber("0") == true</li>
	 * <li>isNaN("3j") == true => isNumber("3j") == false</li>
	 * </ul></pre>
	 *
	 * @function isNumber
	 * @param      {string}   str String representing a number
	 * @return     {boolean}  True if the specified string is number, False otherwise.
	 */
	this.isNumber = function(str) { return str && !isNaN(str); };

	/**
	 * Retunr <b>val</b> param if it is number, or <b>def</b> param otherwise.
	 * <pre><ul>
	 * <li>isNaN(null) == false => dNaN(null, def) == def</li>
	 * <li>isNaN("") == false => dNaN("", def) == def</li>
	 * <li>isNaN("  ") == false => dNaN("  ", def) == def</li>
	 * <li>isNaN("0") == true => dNaN("0", def) == 0</li>
	 * <li>isNaN("3j") == true => dNaN("3j", def) == def</li>
	 * </ul></pre>
	 *
	 * @function dNaN
	 * @param      {string}   val Variable to check if is a number
	 * @param      {number}   def Default value to return if val is not a number
	 * @return     {number}  val if it is a number or def if val is not a number
	 */
	this.dNaN = dNaN;

	this.toFloat = function(str) { return _lang.toFloat(str); }
	this.float = function(num, d) { return _lang.float(num, d); }
	this.integer = function(num) { return _lang.integer(num); }
	this.trIsoFloat = function(num, d) { return _lang.trIsoFloat(num, d); }
	this.trIsoInt = function(num) { return _lang.trIsoInt(num); }
	this.helper = function(str, d) { return _lang.helper(str, d); }
	this.boolval = function(val) { return _lang.boolval(val); }

	this.gt0 = function(num) { return dNaN(num, 0) > 0; } //is pk ok?
	this.le0 = function(num) { return isNaN(num) || (num <= 0); } //is pk ok?
	this.between = function(num, min, max) { min = dNaN(min, num); max = dNaN(max, num); return (min <= num) && (num <= max); }
	this.range = function(val, min, max) { return Math.max(Math.min(val, max), min); }
	this.rand = function(min, max) { return Math.random() * (max - min) + min; }
	this.round = fnRound;

	//load default language
	self.setI18n(lang);
}
