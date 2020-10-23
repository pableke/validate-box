
//Date-Time Box extensions
function DateBox(lang) {
	const self = this; //self instance
	const sysdate = new Date(); //global sysdate
	const auxdate = new Date(); //auxiliar date calc
	const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	//helpers
	function intval(val) { return parseInt(val) || 0; }
	function isset(val) { return (typeof val != "undefined") && (val != null); }
	function nvl(val, def) { return isset(val) ? val : def; } //default
	function lpad(val) { return (+val < 10) ? ("0" + val) : val; } //always 2 digits
	function swap(arr) { var aux = arr[2]; arr[2] = arr[0]; arr[0] = aux; return arr; }
	function isLeapYear(year) { return ((year & 3) == 0) && (((year % 25) != 0) || ((year & 15) == 0)); } //año bisiesto?
	function daysInMonth(y, m) { return daysInMonths[m] + ((m == 1) && isLeapYear(y)); }
	function dayOfYear(y, m, d) { return daysInMonths.slice(0, m).reduce((t, d) => { return t + d; }, d+((m > 1) && isLeapYear(y))); }
	function splitDate(str) { return str ? str.split(/\D+/)/*.map(intval)*/ : []; } //int array
	//function joinDate(parts, sep) { return parts.map(lpad).join(sep); } //join date parts

	function range(val, min, max) { return Math.min(Math.max(intval(val), min), max); } //force range
	function rangeYear(yy) { return (yy < 100) ? ((self.getCentury() * 100) + yy) : nvl(yy, sysdate.getFullYear()); } //autocomplete year=yyyy
	function rangeDay(y, m, d) { return range(d, 1, daysInMonth(y, m - 1)); } //days in month
	function range59(val) { return range(val, 0, 59, ); } //en-range min/seg

	function fnSetTime(date, hh, mm, ss, ms) { date && date.setHours(range(hh, 0, 23), range59(mm), range59(ss), ms); return date; }
	function fnLoadTime(date, parts) { return fnSetTime(date, parts[0], parts[1], parts[2], parts[3]); } //only update time from date
	function fnSetDate(date, yyyy, mm, dd) { date && date.setFullYear(rangeYear(yyyy), range(mm, 1, 12) - 1, rangeDay(yyyy, +mm, dd)); return date; }
	function fnSetDateTime(date, yyyy, mm, dd, hh, MM, ss, ms) { return fnSetTime(fnSetDate(date, yyyy, mm, dd), hh || 0, MM || 0, ss || 0, ms || 0); }

	function fnMinTime(date) { return lpad(date.getHours()) + ":" + lpad(date.getMinutes()); } //hh:MM
	function fnIsoTime(date) { return fnMinTime(date) + ":" + lpad(date.getSeconds()); } //hh:MM:ss

	const langs = {
		en: { //english
			monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
			dateFormat: "yy-mm-dd", firstDay: 1,

			setDateTime: function(date, yyyy, mm, dd, hh, MM, ss, ms) { fnSetDateTime(date, yyyy, mm, dd, hh, MM, ss, ms); return this; },
			build: function(parts) { return fnSetDateTime(new Date(), parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]); },
			toDate: function(str) { return str && this.build(splitDate(str)); }, //build date type
			parse: function(str) { return str && isNaN(str) ? Date.parse(str) : new Date(+str); }, //parse string to date
			helper: function(str) { return str && str.replace(/^(\d{4})(\d+)$/g, "$1-$2").replace(/^(\d{4}\-\d\d)(\d+)$/g, "$1-$2").replace(/[^\d\-]/g, ""); },
			setAll: function(date, parts) { return this.setDateTime(date, parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]); },
			trIsoDate: function(str) { return str ? this.setAll(auxdate, splitDate(str)).isoDate(auxdate) : str; }, //reformat iso string
			acDate: function(str) { return str ? this.setAll(auxdate, splitDate(str)).isoDate(auxdate) : str; }, //auto-complete date
			isoDate: function(date) { return date.getFullYear() + "-" + lpad(date.getMonth() + 1) + "-" + lpad(date.getDate()); }, //yyyy-mm-dd
			isoTime: fnIsoTime, isoDateTime: function(date) { return this.isoDate(date) + " " + this.isoTime(date); } //yyyy-mm-dd hh:MM:ss
		},

		es: { //spain
			monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
			monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
			dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
			dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Juv", "Vie", "Sáb"],
			dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
			dateFormat: "dd/mm/yy", firstDay: 1,

			setDateTime: function(date, yyyy, mm, dd, hh, MM, ss, ms) { fnSetDateTime(date, yyyy, mm, dd, hh, MM, ss, ms); return this; },
			build: function(parts) { return fnSetDateTime(new Date(), parts[2], parts[1], parts[0], parts[3], parts[4], parts[5], parts[6]); },
			toDate: function(str) { return str && this.build(splitDate(str)); }, //build date type
			parse: function(str) { return str && isNaN(str) ? Date.parse(str) : new Date(+str); }, //parse string to date
			helper: function(str) { return str && str.replace(/^(\d\d)(\d+)$/g, "$1/$2").replace(/^(\d\d\/\d\d)(\d+)$/g, "$1/$2").replace(/[^\d\/]/g, ""); },
			setAll: function(date, parts) { return this.setDateTime(date, parts[2], parts[1], parts[0], parts[3], parts[4], parts[5], parts[6]); },
			trIsoDate: function(str) { return str ? this.setAll(auxdate, swap(splitDate(str))).isoDate(auxdate) : str; }, //reformat iso string
			acDate: function(str) { return str ? this.setAll(auxdate, splitDate(str)).isoDate(auxdate) : str; }, //auto-complete date
			isoDate: function(date) { return lpad(date.getDate()) + "/" + lpad(date.getMonth() + 1) + "/" + date.getFullYear(); }, //dd/mm/yyyy
			isoTime: fnIsoTime, isoDateTime: function(date) { return this.isoDate(date) + " " + this.isoTime(date); } //dd/mm/yyyy hh:MM:ss
		},

		fr: { //france
			monthNames: ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"],
			monthNamesShort: ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"],
			dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
			dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
			dayNamesMin: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
			dateFormat: "mm/dd/yy", firstDay: 1
		},

		it: { //italy
			monthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
			monthNamesShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
			dayNames: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
			dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
			dayNamesMin: ["Do", "Lu", "Ma", "Me", "Gio", "Ve", "Sa"],
			dateFormat: "dd/mm/yy", firstDay: 1
		},

		de: { //germany
			monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
			monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
			dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
			dayNamesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
			dayNamesMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
			dateFormat: "yy-mm-dd", firstDay: 1
		}
	}

	//public functions
	var _lang = langs.es; //default
	this.sysdate = function() { return sysdate; }
	this.getLang = function(lang) { return lang ? langs[lang] : _lang; }
	this.setLang = function(lang, data) { langs[lang] = data; return self; }
	this.getI18n = function(lang) { return langs[lang] || (lang && langs[lang.substr(0, 2)]) || langs.es; }
	this.setI18n = function(lang) { _lang = self.getI18n(lang); return self; }

	this.valid = function(d) { return d && (d instanceof Date) && !isNaN(d.getTime()); }
	this.setTime = function(date, hh, mm, ss, ms) { fnSetTime(date, hh, mm, ss, ms); return self; }
	this.setDate = function(date, yyyy, mm, dd) { fnSetDate(date, yyyy, mm, dd); return self; }
	this.setDateTime = function(date, yyyy, mm, dd, hh, MM, ss, ms) { return self.setDate(date, yyyy, mm, dd).setTime(date, hh, MM, ss, ms); }
	this.setAll = function(date, parts) { _lang.setAll(date, parts); return self; }
	this.build = function(parts) { return  _lang.build(parts); } //build full date-time from array
	this.load = function(date, flags) { return self.setDate(date, flags.yyyy, flags.m, flags.d, flags.h, flags.M, flags.s, flags.ms); }
	this.init = function(d1, d2) { d1 && d1.setTime((d2 || sysdate).getTime()); return self; }
	this.trunc = function(date) { return self.setTime(date, 0, 0, 0, 0); }
	this.clone = function(date) { return date && new Date(date.getTime()); }
	this.toObject = function(date) {
		date = date || sysdate; //default sysdate
		let D = date.getDay(); //week day
		let Y = "" + date.getFullYear(); //toString
		let flags = { yyyy: +Y, y: +Y.substr(0, 2), yy: +Y.substr(-2), m: date.getMonth(), d: date.getDate() }
		flags.mmm = _lang.monthNamesShort[flags.m]; flags.mmmm = _lang.monthNames[flags.m]; flags.mm = lpad(++flags.m);
		flags.ddd = _lang.dayNamesShort[D]; flags.dddd = _lang.dayNames[D]; flags.dd = lpad(flags.d);
		flags.h = date.getHours(); flags.hh = lpad(flags.h); flags.M = date.getMinutes(); flags.MM = lpad(flags.M);
		flags.s = date.getSeconds(); flags.ss = lpad(flags.s); flags.ms = date.getMilliseconds();
		flags.t = (flags.h < 12) ? "a" : "p"; flags.tt = flags.t + "m";
		return flags;
	}

	function fnDay1(yyyy, m) { auxdate.setFullYear(yyyy, m, 1); return auxdate.getDay(); } //week day 1 of year/month
	this.getCentury = function(date) { return intval((date || sysdate).getFullYear() / 100); } //ej: 20
	this.startYear = function(date) { date && date.setFullYear(date.getFullYear(), 0, 1); return self; } //01/01/xxxx
	this.startMonth = function(date) { date && date.setFullYear(date.getFullYear(), date.getMonth(), 1); return self; } //01/mm/yyyy
	this.daysInMonth = function(date) { date = date || sysdate; return daysInMonth(date.getFullYear(), date.getMonth()); }
	this.dayOfYear = function(date) { date = date || sysdate; return dayOfYear(date.getFullYear(), date.getMonth(), date.getDate()); }
	this.daysInYear = function(date) { return isLeapYear((date || sysdate).getFullYear()) ? 366 : 365; }
	this.weekOfYear = function(date) { return Math.ceil((fnDay1(date.getFullYear(), 0) + self.dayOfYear(date)) / 7); }
	this.weekOfMonth = function(date) { return Math.ceil((fnDay1(date.getFullYear(), date.getMonth()) + date.getDate()) / 7); }
	this.endDay = function(date) { date && date.setHours(23, 59, 59, 999); return self; } //last moment of day

	//format output functions
	function _fmtObject(str, obj) { return str.replace(/@(\w+);/g, (m, k) => { return nvl(obj[k], m); }); }
	function _format(str, date) { return _fmtObject(str, self.toObject(date)); } //format object from date
	this.format = function(date, mask) { return _format(mask || "@yyyy;-@mm;-@dd;", date); } //default mask = iso date

	this.minTime = fnMinTime; //hh:MM
	this.isoTime = fnIsoTime; //hh:MM:ss
	this.shortTime = function(date) { return _format("@h;:@MM; @tt;", date); } //h:mm tt
	this.minDate = function(date) { return _format("@yy;@mm;@dd;", date); } //yymmdd
	this.shortDate = function(date) { return _format("@yy;-@m;-@d;", date); } //yy-m-d
	this.isoDate = function(date) { return _lang.isoDate(date); } //i18n format date
	this.isoDateTime = function(date) { return _lang.isoDateTime(date); } //yyyy-mm-dd hh:MM:ss
	//iso! mask="@yyyy;-@mm;-@dd;T@hh;:@MM;:@ss;.@ms;Z" last "Z" means that the time is UTC
	this.dfIso = function(date) { return self.isoDate(date) + "T" + self.isoTime(date) + "." + date.getMilliseconds() + "Z"; }
	this.dfFull = function(date) { return _format("@dddd;, @mmmm; @d;, @yyyy;", date); } //dddd, mmmm d, yyyy
	this.toJSON = self.dfIso; //default JSON.stringify call for date format

	//autocomplete helper functions
	this.toDate = function(str) { return _lang.toDate(str); } //build date type
	this.helper = function(str) { return _lang.helper(str); } //helper input
	this.trIsoDate = function(str) { return _lang.trIsoDate(str); } //reformat iso string
	this.acDate = function(str) { return _lang.acDate(str); } //auto-complete date

	//time helpers are commons for i18n
	this.acTime = function(str) { return str ? fnIsoTime(fnLoadTime(auxdate, splitDate(str))) : str; } //auto-complete time string
	this.tHelper = function(val) { return val && val.replace(/(\d\d)(\d+)$/g, "$1:$2").replace(/[^\d\:]/g, ""); } //time helper

	this.addMilliseconds = function(date, val) { date && date.setMilliseconds(date.getMilliseconds() + val); return self; }
	this.addHours = function(date, val) { date && date.setHours(date.getHours() + val); return self; }
	this.addDays = function(date, val) { date && date.setDate(date.getDate() + val); return self; }
	this.addDate = self.addDays; //sinonym
	this.toArray = function(date) {
		return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
	}

	const ajustes = [0, 12, 0, 24, 60, 60, 1000]; //years, months, days, hours...
	function fnAjustar(result, i, val) {
		result[i] -= val;
		if (result[i] < 0) {
			result[i] += ajustes[i];
			fnAjustar(result, i-1, 1);
		}
	}
	this.diff = function(d1, d2) {
		d2 = d2 || sysdate;
		if (d1 > d2) //swap
			return self.diff(d2, d1);
		var result = self.toArray(d2); //date parts
		ajustes[2] = self.daysInMonth(d1) - d1.getDate() + d2.getDate();
		self.toArray(d1).forEach((p, i) => { fnAjustar(result, i, p); });
		return result;
	}
	this.diffDays = function(d1, d2) { return d2 ? (Math.abs(d2.getTime() - d1.getTime()) / 864e5) : 0; } //(1000 * 3600 * 24)
	this.diffHours = function(d1, d2) { return d2 ? (Math.abs(d2.getTime() - d1.getTime()) / 36e5) : 0; } //(1000 * 3600)
	this.inYear = function(d1, d2) { return d1 && d2 && (d1.getFullYear() == d2.getFullYear()); }
	this.inMonth = function(d1, d2) { return self.inYear(d1, d2) && (d1.getMonth() == d2.getMonth()); }
	this.inWeek = function(d1, d2) { return self.inMonth(d1, d2) && (self.weekOfYear(d1) == self.weekOfYear(d2)); }
	this.inDay = function(d1, d2) { return self.inMonth(d1, d2) && (d1.getDate() == d2.getDate()); }
	this.inHour = function(d1, d2) { return self.inDay(d1, d2) && (d1.getHours() == d2.getHours()); }
	this.between = function(date, dMin, dMax) { dMin = dMin || date; dMax = dMax || date; return (dMin <= date) && (date <= dMax); }
	this.range = function(date, dMin, dMax) { return (dMin && (date < dMin)) ? dMin : ((dMax && (dMax < date)) ? dMax : date); }
	this.rand = function(d1, d2) { let t1 = d1.getTime(); return new Date(intval(Math.random() * (d2.getTime() - t1) + t1)); }
	this.min = function(d1, d2) { return (d1 && d2) ? ((d1 < d2) ? d1 : d2) : nvl(d1, d2); }
	this.max = function(d1, d2) { return (d1 && d2) ? ((d1 < d2) ? d2 : d1) : nvl(d1, d2); }

	//update prototype
	var dp = Date.prototype;
	dp.toJSON = function() { return self.dfIso(this); }

	//load default language
	self.setI18n(lang);
}
