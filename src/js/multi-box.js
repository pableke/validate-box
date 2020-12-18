
//Data structures Box extensions
function DataBox() {
	const self = this; //self instance

	//helpers
	function fnVoid() {}
	function fnTrue() { return true; }
	function fnSize(arr) { return arr ? arr.length : 0; } //string o array
	function extract(arr, i, n) { arr.splice(i, n); return self; }
	function cmp(a, b) { return (a == b) ? 0 : ((a < b) ? -1 : 1); }
	function multisort(a, b, columns, orderby, index) {
		index = index || 0;
		var name = columns[index];
		var direction = (orderby && (orderby[index] == "asc"));
		var value = direction ? cmp(a[name], b[name]) : cmp(b[name], a[name]);
		return ((value == 0) && (index < (columns.length - 1))) ? multisort(a, b, columns, orderby, index + 1) : value;
	}

	this.size = fnSize;
	this.indexOf = function(arr, elem) { return arr ? arr.indexOf(elem) : -1; }
	this.intersect = function(a1, a2) { return a2 ? a1.filter(function(e) { return (a2.indexOf(e) > -1); }) : []; }
	this.multisort = function(arr, columns, orderby) { return arr.sort(function(a, b) { return multisort(a, b, columns, orderby); }); }
	this.swap = function(arr, a, b) { let aux = arr[a]; arr[a] = arr[b]; arr[b] = aux; return self; }
	this.shuffle = function(arr) { return arr.sort(function() { return 0.5 - Math.random(); }); }
	this.add = function(arr, obj) { arr && arr.push(obj); return obj; }
	this.addAt = function(arr, obj, i) { arr && arr.splice(i, 0, obj); return obj; }
	this.put = function(arr, obj) { arr && arr.unshift(obj); return self; }
	this.putAt = function(arr, obj, i) { self.addAt(arr, obj, i); return self; }
	this.push = function(arr, obj) { arr && arr.push(obj); return self; }
	this.remove = function(arr, i, n) { return arr && extract(arr, i, n); }
	this.reset = function(arr) { arr && arr.splice(0); return self; }
	this.pop = function(arr) { return arr && extract(arr, -1, 1); }
	this.last = function(arr) { return self.get(arr, fnSize(arr) - 1); }
	this.get = function(arr, i) { return arr && arr[i]; }

	this.find = function(arr, fn) { return arr ? arr.find(fn) : null; }
	this.ifind = function(arr, fn) { return arr ? arr.findIndex(fn) : -1; }
	this.distinct = function(arr, fn) { return fn ? arr.filter((a, i) => { return (arr.findIndex(b => { return fn(a, b); }) == i); }) : arr; }
	this.isect = function(a1, a2, fn) { return (a2 && fn) ? a1.filter(a => { return (a2.findIndex(b => { return fn(a, b); }) >= 0); }) : a1; }
	this.usect = function(a1, a2, fn) { return (a2 && fn) ? a1.concat(a2.filter(b => { return (a1.findIndex(a => { return fn(a, b); }) < 0); })) : a1; }
	this.sortBy = function(arr, name) { return name ? self.sort(arr, (a, b) => { return cmp(a[name], b[name]); }) : arr; }
	this.sort = function(arr, fn) { return arr ? arr.sort(fn || cmp) : arr; }
	this.clone = function(arr) { return arr ? arr.slice() : []; }
	this.each = function(arr, fn) { //iterator
		let size = fnSize(arr); //max
		for (let i = 0; (i < size); i++)
			fn(arr[i], i); //callback
		return self;
	}
	this.extract = function(arr, fn) {
		let size = fnSize(arr); //max
		for (let i = 0; (i < size); i++)
			fn(arr[i], i) && extract(arr, i--, 1); //remove?
		return self;
	}

	//Tree Traversal with PreOrder and PostOrder
	function fnTraversal(root, node, preorder, postorder) {
		node.childnodes.forEach((child, i) => { //iterate over next deep level
			preorder(root, node, child, i) && fnTraversal(root, child, preorder, postorder); //preorder = cut/poda
			postorder(root, node, child, i);
		});
		return self;
	}
	this.preorder = function(root, preorder, postorder) {
		return fnTraversal(root, root, preorder, postorder || fnVoid);
	}
	this.findNode = function(root, node, fn) {
		var result; //node result
		for (let i = 0; !result && (i < node.childnodes.length); i++) {
			let child = node.childnodes[i]; //get childnode
			result = fn(root, node, child, i) ? child : self.findNode(root, child, fn); //next deep level
		}
		return result;
	}

	var pkName, fkName, fnGroup;
	this.reduce = function(data, onGroup) {
		fnGroup = onGroup || fnTrue;
		let parts = []; //container

		let size = fnSize(data);
		(size > 0) && parts.push(data[0]);
		for (let i = 1; i < size; i++) {
			let row = data[i];
			let prev = parts[parts.length - 1];
			fnGroup(prev, row, i, parts) && parts.push(row); //resume?
		}
		return parts;
	}

	function newNode(parent, contents, idChild) {
		var child = { id: idChild, data: contents, childnodes: [] };
		child.level = parent.level + 1; //inc level
		//call group event handler (cut/poda?)
		if (fnGroup(parent, child)) {
			parent.childnodes.push(child); //add child
			return child;
		}
		return null; //poda la rama
	}
	function addNode(json, parent, idChild) {
		var child = newNode(parent, json.filter(row => { return (row[fkName] == idChild); }), idChild);
		child && child.data.forEach(row => { addNode(json, child, row[pkName]); }); //build level+1
		return child;
	}
	this.group = function(groups, root) {
		root = Object.assign({ id: 0, level: 0, data: [], childnodes: [] }, root);
		fnGroup = root.onGroup || fnTrue;

		root.data.forEach(function(row, i) {
			var node = root; //root node
			groups.forEach(function(colName, g) {
				var idChild = row[colName]; //pk value
				node = node.childnodes.find(n => { return (n.id == idChild); }) //node exists
					|| newNode(node, node.data.filter(row => { return (row[colName] == idChild); }), idChild)
					|| node; //move to next deep level
			});
		});
		return root;
	}
	this.tree = function(json, root) {
		root = Object.assign({ id: 0, level: 0, childnodes: [] }, root);

		//set global properties key name
		pkName = root.pk || "id"; //pk
		fkName = root.fk || "parent"; //fk
		fnGroup = root.onGroup || fnTrue;

		//build tree iterating recursively over nodes
		root.data = json.filter(row => { return !row[fkName]; }); //first deep level
		root.data.forEach(row => { addNode(json, root, row[pkName]); }); //build level=1
		return root;
	}
	/***********************************************/

	//Build graph from json data
	var buffer = []; //auxiliar container
	function addVertex(json, parent, idChild) {
		if (buffer.indexOf(idChild) > -1) //cycle?
			return null; //child node pre-visited
		buffer.push(idChild); //marck id node as visited => avoid cycles
		var child = newNode(parent, json.filter(row => { return (row[fkName] == idChild); }), idChild);
		child && child.data.forEach(row => { addVertex(json, child, row[pkName]); }); //build level+1
		return child;
	}
	this.graph = function(json, root) {
		root = Object.assign({ id: 0, level: 0, childnodes: [] }, root);
		buffer.slice(0); //reset visited array

		//set global properties key name
		pkName = root.pk || "id"; //pk
		fkName = root.fk || "parent"; //fk
		fnGroup = root.onGroup || fnTrue;

		//build graph iterating over all vertex
		root.data = json.filter(row => { return !row[fkName]; }); //first deep level
		root.data.forEach(row => { addVertex(json, root, row[pkName]); }); //build level=1
		return root;
	}
	//Graph Traversal with Breadth-First Search (BFS)
	this.bfs = function(graph, fn) {
		buffer.slice(0); //reset visited array
		buffer.push(graph.id); //marck id node as visited => avoid cycles
		var queue = [graph]; //Initialize queue for BFS

		//Iterate over all vertex
		while (queue.length > 0) {
			let node = queue.shift(); //Dequeue a vertex
			queue = node.childnodes.filter((child, i) => {
				//check if child node has been pre-visited and call fn for cut/poda
				let pendiente = (buffer.indexOf(child.id) < 0) && fn(graph, node, child, i);
				return pendiente ? buffer.push(child.id) : 0; //marck id node as visited => avoid cycles
			}).concat(queue);
		}
		return graph;
	}

	function fnVertex(graph, node, fn) {
		if (buffer.indexOf(node.id) > -1) //cycle?
			return null; //child node pre-visited
		var result; //node result
		buffer.push(node.id); //marck id node as visited => avoid cycles
		for (let i = 0; !result && (i < node.childnodes.length); i++) {
			let child = node.childnodes[i]; //get childnode
			result = fn(graph, node, child, i) ? child : fnVertex(graph, child, fn); //next deep level
		}
		return result;
	}
	this.findVertex = function(graph, fn) {
		buffer.slice(0); //reset visited array
		return fnVertex(graph, graph, fn);
	}
	/***********************************************/
}

/*
var arr = [
	{ text: "text3", g1: "aaa", g2: "210", id: "3", parentId: "2" },
	{ text: "text2", g1: "aaa", g2: "210", id: "2", parentId: "1" },
	{ text: "text4", g1: "aaa", g2: "210", id: "4", parentId: "1" },
	{ text: "text1", g1: "bbb", g2: "210", id: "1" },
	{ text: "text5", g1: "ccc", g2: "210", id: "5" },
	{ text: "text6", g1: "ccc", g2: "213", id: "6", parentId: "2" }
];
*/


/**
 * Date-Time module for internationalization
 * @module Date-Time
 */
function DateBox(lang) {
	const self = this; //self instance
	const sysdate = new Date(); //global sysdate
	const auxdate = new Date(); //auxiliar date calc
	const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	//helpers
	function intval(val) { return parseInt(val) || 0; }
	function fnSize(arr) { return arr ? arr.length : 0; }; //string o array
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
	function rangeDay(y, m, d) { return range(intval(d), 1, daysInMonth(y, m - 1)); } //days in month
	function range59(val) { return range(val, 0, 59); } //en-range min/seg

	function fnSetTime(date, hh, mm, ss, ms) { date && date.setHours(range(hh, 0, 23), range59(mm), range59(ss), ms); return date; }
	function fnLoadTime(date, parts) { return fnSetTime(date, parts[0], parts[1], parts[2], parts[3]); } //only update time from date
	function fnSetDate(date, yyyy, mm, dd) {
		if (date) {
			mm = range(mm, 1, 12);
			yyyy = rangeYear(intval(yyyy));
			date.setFullYear(yyyy, mm - 1, rangeDay(yyyy, mm, dd));
		}
		return date;
	}
	function fnSetDateTime(date, yyyy, mm, dd, hh, MM, ss, ms) { return fnSetTime(fnSetDate(date, yyyy, mm, dd), hh || 0, MM || 0, ss || 0, ms || 0); }

	function fnMinTime(date) { return lpad(date.getHours()) + ":" + lpad(date.getMinutes()); } //hh:MM
	function fnIsoTime(date) { return fnMinTime(date) + ":" + lpad(date.getSeconds()); } //hh:MM:ss

	const langs = {
		en: { //english
			closeText: "close", prevText: "prev", nextText: "next", currentText: "current",
			ancientText: "ancient", lastYear: "last year", currentYear: "this year", nextYear: "next year", 
			lastMonth: "last month", currentMonth: "this month", nextMonth: "next month", 
			lastWeek: "last week", currentWeek: "this week", nextWeek: "next week", 
			yesterdayText: "yesterday", todayText: "today", tomorrowText: "tomorrow", 
			lastHour: "last hour", currentHour: "less than an hour", nextHour: "next hour", 
			last30Min: "less than half an hour", justNow: "just now", next30Min: "next half hour", futureText: "in a future", 
			monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
			dateFormat: "yy-mm-dd", firstDay: 1,

			setDateTime: function(date, yyyy, mm, dd, hh, MM, ss, ms) { fnSetDateTime(date, yyyy, mm, dd, hh, MM, ss, ms); return this; },
			build: function(parts) { return (fnSize(parts) > 0) ? fnSetDateTime(new Date(), parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]) : null; },
			toDate: function(str) { return this.build(splitDate(str)); }, //build date type
			parse: function(str) { return (str && isNaN(str)) ? Date.parse(str) : new Date(+str); }, //parse string to date
			helper: function(str) { return str && str.replace(/^(\d{4})(\d+)$/g, "$1-$2").replace(/^(\d{4}\-\d\d)(\d+)$/g, "$1-$2").replace(/[^\d\-]/g, ""); },
			setAll: function(date, parts) { return this.setDateTime(date, parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]); },
			trIsoDate: function(str) { return str ? this.setAll(auxdate, splitDate(str)).isoDate(auxdate) : str; }, //reformat iso string
			acDate: function(str) { return str ? this.setAll(auxdate, splitDate(str)).isoDate(auxdate) : str; }, //auto-complete date
			isoDate: function(date) { return date.getFullYear() + "-" + lpad(date.getMonth() + 1) + "-" + lpad(date.getDate()); }, //yyyy-mm-dd
			isoTime: fnIsoTime, isoDateTime: function(date) { return this.isoDate(date) + " " + this.isoTime(date); } //yyyy-mm-dd hh:MM:ss
		},

		es: { //spain
			closeText: "cerrar", prevText: "prev.", nextText: "sig.", currentText: "actual", 
			ancientText: "antiguo", lastYear: "el año pasado", currentYear: "este año", nextYear: "el año que viene", 
			lastMonth: "el mes pasado", currentMonth: "este mes", nextMonth: "el mes que viene", 
			lastWeek: "la semana pasada", currentWeek: "esta semana", nextWeek: "la semana que viene", 
			yesterdayText: "ayer", todayText: "hoy", tomorrowText: "mañana", 
			lastHour: "hace una hora", currentHour: "en menos de una hora", nextHour: "en la siguiente hora",
			last30Min: "hace menos de media hora", justNow: "justo ahora", next30Min: "en la siguiente media hora", futureText: "en un futuro",
			monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
			monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
			dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
			dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Juv", "Vie", "Sáb"],
			dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
			dateFormat: "dd/mm/yy", firstDay: 1,

			setDateTime: function(date, yyyy, mm, dd, hh, MM, ss, ms) { fnSetDateTime(date, yyyy, mm, dd, hh, MM, ss, ms); return this; },
			build: function(parts) { return (fnSize(parts) > 0) ? fnSetDateTime(new Date(), parts[2], parts[1], parts[0], parts[3], parts[4], parts[5], parts[6]) : null; },
			toDate: function(str) { return this.build(splitDate(str)); }, //build date type
			parse: function(str) { return (str && isNaN(str)) ? Date.parse(str) : new Date(+str); }, //parse string to date
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
	this.weekOfYear = function(date) { date = date || sysdate; return Math.ceil((fnDay1(date.getFullYear(), 0) + self.dayOfYear(date)) / 7); }
	this.weekOfMonth = function(date) { date = date || sysdate; return Math.ceil((fnDay1(date.getFullYear(), date.getMonth()) + date.getDate()) / 7); }
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
	this.addMinutes = function(date, val) { date && date.setMinutes(date.getMinutes() + val); return self; }
	this.addHours = function(date, val) { date && date.setHours(date.getHours() + val); return self; }
	this.addDays = function(date, val) { date && date.setDate(date.getDate() + val); return self; }
	this.addDate = self.addDays; //sinonym
	this.addMonths = function(date, val) { date && date.setMonth(date.getMonth() + val); return self; }
	this.toArray = function(date) {
		return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
	}

	this.diff = function(d1, d2) {
		d2 = d2 || sysdate;
		if (d1 > d2)
			return self.diff(d2, d1);
		let ms = Math.abs(d1.getMilliseconds() - d2.getMilliseconds());
		let ss = Math.abs(d1.getSeconds() - d2.getSeconds());
		let MM = Math.abs(d1.getMinutes() - d2.getMinutes());
		let hh = Math.abs(d1.getHours() - d2.getHours());
		let mm = d2.getMonth() - d1.getMonth();
		let yyyy = d2.getFullYear() - d1.getFullYear();
		if (yyyy > 0) { //adjust mm and yyyy
			var _aux = (yyyy > 1) ? (12 - d1.getMonth()) : ((12 - d1.getMonth()) + d2.getMonth());
			if (12 > _aux) {
				mm = _aux
				yyyy--;
			}
			else
				mm = (_aux % 12);
		}
		if (mm == 0) //same month => nothing to adjust
			return [yyyy, mm, Math.abs(d2.getDate() - d1.getDate()), hh, MM, ss, ms];
		if (mm > 1) //adjust month and days
			return [yyyy, --mm, d2.getDate(), hh, MM, ss, ms];
		let _max = self.daysInMonth(d1); //get the number of days in d1
		_aux = ((_max - d1.getDate()) + d2.getDate()); //days between d1 and d2
		return (_max > _aux) ? [yyyy, --mm, _aux, hh, MM, ss, ms] : [yyyy, mm, (_aux % _max), hh, MM, ss, ms];
	}
	this.diffDays = function(d1, d2) { return d2 ? (Math.abs(d2.getTime() - d1.getTime()) / 864e5) : 0; } //(1000 * 3600 * 24)
	this.diffHours = function(d1, d2) { return d2 ? (Math.abs(d2.getTime() - d1.getTime()) / 36e5) : 0; } //(1000 * 3600)
	this.inYear = function(d1, d2) { return d1 && d2 && (d1.getFullYear() == d2.getFullYear()); }
	this.inMonth = function(d1, d2) { return self.inYear(d1, d2) && (d1.getMonth() == d2.getMonth()); }
	this.inWeek = function(d1, d2) { return self.inYear(d1, d2) && (self.weekOfYear(d1) == self.weekOfYear(d2)); }
	this.inDay = function(d1, d2) { return self.inMonth(d1, d2) && (d1.getDate() == d2.getDate()); }
	this.inHour = function(d1, d2) { return self.inDay(d1, d2) && (d1.getHours() == d2.getHours()); }
	this.inMinute = function(d1, d2) { return self.inHour(d1, d2) && (d1.getMinutes() == d2.getMinutes()); }
	this.between = function(date, dMin, dMax) { dMin = dMin || date; dMax = dMax || date; return (dMin <= date) && (date <= dMax); }
	this.range = function(date, dMin, dMax) { return (dMin && (date < dMin)) ? dMin : ((dMax && (dMax < date)) ? dMax : date); }
	this.rand = function(d1, d2) { let t1 = d1.getTime(); return new Date(intval(Math.random() * (d2.getTime() - t1) + t1)); }
	this.min = function(d1, d2) { return (d1 && d2) ? ((d1 < d2) ? d1 : d2) : nvl(d1, d2); }
	this.max = function(d1, d2) { return (d1 && d2) ? ((d1 < d2) ? d2 : d1) : nvl(d1, d2); }

	let _tempdate = new Date();
	this.timeAgo = function(date) {
		if (date > sysdate) return self.timeTo(date);
		if (self.inMinute(date, sysdate)) return _lang.justNow;
		self.init(_tempdate, date).addMinutes(_tempdate, 30);
		if (_tempdate > sysdate) return _lang.last30Min;
		self.init(_tempdate, date).addHours(_tempdate, 1);
		if (_tempdate > sysdate) return _lang.currentHour;
		if (self.inHour(_tempdate, sysdate)) return _lang.lastHour;
		if (self.inDay(date, sysdate)) return _lang.todayText;
		self.init(_tempdate, date).addDays(_tempdate, 1);
		if (self.inDay(_tempdate, sysdate)) return _lang.yesterdayText;
		if (self.inWeek(date, sysdate)) return _lang.currentWeek;
		self.init(_tempdate, date).addDays(_tempdate, 7);
		if (self.inWeek(_tempdate, sysdate)) return _lang.lastWeek;
		if (self.inMonth(date, sysdate)) return _lang.currentMonth;
		self.init(_tempdate, date).addMonths(_tempdate, 1);
		if (self.inMonth(_tempdate, sysdate)) return _lang.lastMonth;
		if (self.inYear(date, sysdate)) return _lang.currentYear;
		self.init(_tempdate, date).addMonths(_tempdate, 12);
		if (self.inYear(_tempdate, sysdate)) return _lang.lastYear;
		return _lang.ancientText;
	}
	this.timeTo = function(date) {
		if (date < sysdate) return self.timeAgo(date);
		if (self.inMinute(date, sysdate)) return _lang.justNow;
		self.init(_tempdate).addMinutes(_tempdate, 30);
		if (_tempdate > date) return _lang.next30Min;
		self.init(_tempdate).addHours(_tempdate, 1);
		if (_tempdate > date) return _lang.currentHour;
		if (self.inHour(_tempdate, date)) return _lang.nextHour;
		if (self.inDay(date, sysdate)) return _lang.todayText;
		self.init(_tempdate).addDays(_tempdate, 1);
		if (self.inDay(_tempdate, date)) return _lang.tomorrowText;
		if (self.inWeek(date, sysdate)) return _lang.currentWeek;
		self.init(_tempdate).addDays(_tempdate, 7);
		if (self.inWeek(_tempdate, date)) return _lang.nextWeek;
		if (self.inMonth(date, sysdate)) return _lang.currentMonth;
		self.init(_tempdate).addMonths(_tempdate, 1);
		if (self.inMonth(_tempdate, date)) return _lang.nextMonth;
		if (self.inYear(date, sysdate)) return _lang.currentYear;
		self.init(_tempdate).addMonths(_tempdate, 12);
		if (self.inYear(_tempdate, date)) return _lang.nextYear;
		return _lang.futureText;
	}

	//update prototype
	var dp = Date.prototype;
	dp.toJSON = function() { return self.dfIso(this); }

	//load default language
	self.setI18n(lang);
}


/**
 * Message-Box module
 * @module Message-Box
 */
function MessageBox(lang) {
	const self = this; //self instance
	const langs = {
		en: { //english
			required: "Required field!",
			email: "Wrong Mail format",
			regex: "Wrong format",

			number: "Wrong number format",
			min: "Min value unreached",
			max: "Max value exceded",
			range: "Value out of range",
			digits: "Not numeric value",

			date: "Wrong date format",
			mindate: "Min date unreached",
			maxdate: "Max date exceded",
			time: "Wrong time",

			opok: "Action executed successfully",
			operr: "Error on execute action",
			form: "Form validation failed",

			remove: "Are you sure to delete element?",
			cancel: "Are you sure to cancel element?"
		},

		es: { //spanish
			required: "Campo obligatorio!",
			email: "Formato de E-Mail incorrecto",
			regex: "Formato incorrecto",

			number: "Formato n&uacute;merico incorrecto",
			min: "Valor m&iacute;nimo no alcanzado",
			max: "Valor m&aacute;ximo excedido",
			range: "Valor fuera del rango permitido",
			digits: "Valor no n&uacute;merico",

			date: "Formato de fecha incorrecto",
			mindate: "Fecha m&iacute;nima no alcanzada",
			maxdate: "Fecha m&aacute;xima excedida",
			time: "Hora incorrecta",

			opok: "Operaci&oacute;n realizada correctamente",
			operr: "Error al ejecutar la operaci&oacute;n",
			form: "El formulario contiene campos erroneos",

			remove: "¿Confirma que desea eliminar este registro?",
			cancel: "¿Confirma que desea cancelar este registro?"
		}
	}

	let _lang = langs.es; //default
	this.getLang = function(lang) { return lang ? langs[lang] : _lang; }
	this.setLang = function(lang, data) { langs[lang] = data; return self; }
	this.getI18n = function(lang) { return langs[lang] || (lang && langs[lang.substr(0, 2)]) || langs.es; }
	this.setI18n = function(lang) { _lang = self.getI18n(lang); return self; }
	this.addLang = function(data, lang) { Object.assign(self.getLang(lang), data); return self; }

	this.get = function(name) { return _lang[name]; }
	this.set = function(name, value) { _lang[name] = value; return self; }
	this.format = function(str) {
		return str.replace(/@(\w+);/g, (m, k) => { return nvl(_lang[k], m); });
	}

	/**
	 * Object that links inputs elements to its message error by name
	 * 
	 * @const
	 * @type {Object}
	 */
	const ERRORS = { errno: 0 }; //container

	/**
	 * Messages container
	 * 
	 * @type {Object}
	 */
	let MESSAGES = {};

	this.getMessages = function() { return MESSAGES; } //get current config
	this.setMessages = function(data) { MESSAGES = data || MESSAGES; return self; }

	this.isOk = function() { return ERRORS.errno == 0; }
	this.isError = function() { return ERRORS.errno > 0; }

	this.getError = function(name) { return name ? ERRORS[name] : ERRORS; }
	this.getErrors = function() { return ERRORS; }

	this.setErrno = function(errno) { ERRORS.errno = errno; return self; }
	this.addErrno = function() { ERRORS.errno++; return self; }

	this.setError = function(name, msg) { ERRORS[name] = msg; return self.addErrno(); }
	this.i18nError = function(name, key) { return self.setError(name, MESSAGES[key]); }
	this.setMessage = function(msg) { ERRORS.message = msg; return self.addErrno(); }
	this.i18nMessage = function(key) { return self.setMessage(MESSAGES[key]); }

	this.init = function() {
		for (let k in ERRORS)
			delete ERRORS[k];
		return self.setErrno(0);
	}

	this.close = function(msg) {
		return self.setMessage(MESSAGES[msg] || msg).getErrors();
	}

	//load default language
	self.setI18n(lang);
}


/**
 * Number-Box module for internationalization
 * @module Number-Box
 */
function NumberBox(lang) {
	/**
	 * Self instance = this
	 * @const
	 */
	const self = this;

	/**
	 * Regular Expresion to remove no digits inputs
	 * @const
	 */
	const RE_SECTION = /\D+/g;
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

	/**
	 * Format <b>num</b> parameter applying the specific configuration
	 *
	 * @function _format
	 * @param      {number}  num     The number to be formatted
	 * @param      {string}  s       Section separator, default = "."
	 * @param      {string}  d       Decimal separator, default = ","
	 * @param      {number}  n       Decimal part length (scale), default = 2
	 * @return     {string}  Formated string representing the input number
	 */
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

	/**
	 * Parse <b>str</b> string parameter to number.
	 *
	 * @function _toNumber
	 * @param      {string}  str     String representing a number
	 * @param      {string}  d       Decimal separator, default = ","
	 * @param      {number}  n       Decimal part length (scale), default = 2
	 * @return     {number}  The number parsered
	 */
	function _toNumber(str, d, n) {
		str = fnTrim(str);
		if (!str) return null;
		var separator = str.lastIndexOf(d);
		var sign = (str.charAt(0) == "-") ? "-" : EMPTY;
		var num = parseFloat(sign + ((separator < 0)
										? str.replace(RE_SECTION, EMPTY) 
										: (str.substr(0, separator).replace(RE_SECTION, EMPTY) + DOT + str.substr(separator + 1))));
		return fnRound(num, n); //default 2 decimals
	}

	/**
	 * Predefined languages
	 * @const
	 */
	const langs = {
		en: { //english
			toFloat: function(str) { return _toNumber(str, DOT); }, //build number
			float: function(num, d) { return _format(num, ",", DOT, d); }, //float format without decimals
			integer: function(num) { return _format(num, ",", DOT, 0); }, //int format without decimals
			trIsoFloat: function(str, d) { return str ? this.float(parseFloat(str), d) : str; }, //reformat iso string
			trIsoInt: function(str) { return str ? this.integer(parseFloat(str)) : str; }, //reformat iso string
			helper: function(str, d) { return str && this.float(this.toFloat(str), d); }, //reformat
			boolval: function(val) { return boolval(val) ? "Yes" : "No"; } //boolean english
		},

		es: { //spanish
			toFloat: function(str) { return _toNumber(str, ","); }, //build number
			float: function(num, d) { return _format(num, DOT, ",", d); }, //float format without decimals
			integer: function(num) { return _format(num, DOT, ",", 0); }, //int format without decimals
			trIsoFloat: function(str, d) { return str ? this.float(parseFloat(str), d) : str; }, //reformat iso string
			trIsoInt: function(str) { return str ? this.integer(parseFloat(str)) : str; }, //reformat iso string
			helper: function(str, d) { return str && this.float(this.toFloat(str), d); }, //reformat
			boolval: function(val) { return boolval(val) ? "Sí" : "No"; } //boolean spainish
		}
	};

	/**
	 * Default language defined by setI18n function
	 * @see setI18n
	 */
	var _lang = langs.es;

	/**
	 * Gets the object language associated to <b>lang</b> parameter, or current language if <b>lang</b> is falsy.
	 * @see langs
	 *
	 * @function getLang
	 * @param      {string} lang     The language string identificator: "en", "es", etc. If is falsy return current language
	 * @return     {Object} The object containing all language operators.
	 */
	this.getLang = function(lang) {
		return lang ? langs[lang] : _lang;
	}

	/**
	 * Sets <b>data</b> object as language associated to <b>lang</b> parameter in langs container.
	 * @see langs
	 *
	 * @function setLang
	 * @param      {string}  lang     The language string identificator: "en", "es", etc.
	 * @param      {Object}  data     The object containing all language operators.
	 * @return     {NumberBox} self instace of NumberBox
	 */
	this.setLang = function(lang, data) {
		langs[lang] = data;
		return self;
	}

	/**
	 * Gets the object language associated to <b>lang</b> param, or default language if <b>lang</b> does not exists (default = "es").
	 * @see langs
	 *
	 * @function getI18n
	 * @param      {string} lang     The language string identificator: "en", "es", etc.
	 * @return     {Object} The object containing all language operators.
	 */
	this.getI18n = function(lang) {
		return langs[lang] || (lang && langs[lang.substr(0, 2)]) || langs.es;
	}

	/**
	 * Sets the object associated to <b>lang</b> parameter in langs container as current language, or sets default language if <b>lang</b> does not exists in langs.
	 * @see langs
	 * @see getI18n
	 *
	 * @function setI18n
	 * @param      {string}    lang     The language string identificator: "en", "es", etc.
	 * @return     {NumberBox} self instace of NumberBox
	 */
	this.setI18n = function(lang) {
		_lang = self.getI18n(lang);
		return self;
	}

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
	function dNaN(val, def) {
		return isnum(val) ? val : def;
	}
	this.dNaN = dNaN;

	/**
	 * Apply _toNumber parser with language configuration specified by setI18n
	 * @see langs
	 * @see _toNumber
	 * @see setI18n
	 *
	 * @function toFloat
	 * @param      {string}  str     String representing a number
	 * @param      {string}  d       Decimal separator, default = ","
	 * @param      {number}  n       Decimal part length (scale), default = 2
	 * @return     {number}  The number parsered
	 */
	this.toFloat = function(str) { return _lang.toFloat(str); }

	/**
	 * Apply _format function for styling output number applying language configuration defined by setI18n
	 * @see langs
	 * @see _format
	 * @see setI18n
	 *
	 * @function float
	 * @param      {number}  num     Number to be formated to a string
	 * @param      {number}  d       Decimal separator, default = ","
	 * @return     {string}  The formatted string associated to number parameter
	 */
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
	this.gt0 = function(num) {
		return dNaN(num, 0) > 0;
	}

	/**
	 * Check if <b>num</b> is not number or less than 0.
	 *
	 * @function le0
	 * @param      {number} num     The value
	 * @return     {boolean} True if is not number or is less than 0, False otherwise.
	 */
	this.le0 = function(num) {
		return isNaN(num) || (num <= 0);
	}

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
	this.between = function(num, min, max) {
		min = dNaN(min, num);
		max = dNaN(max, num);
		return (min <= num) && (num <= max);
	}

	/**
	 * Gets an aleatorian value between [min..max] values.
	 *
	 * @function range
	 * @param      {number}   num     The number
	 * @param      {number}   min     The minimum value
	 * @param      {number}   max     The maximum value
	 * @return     {boolean}  True if num is between [min..max], False otherwise 
	 */
	this.range = function(val, min, max) {
		return Math.max(Math.min(val, max), min);
	}

	/**
	 * Gets an aleatorian value between [min..max] values.
	 *
	 * @function rand
	 * @param      {number}  min     The minimum value
	 * @param      {number}  max     The maximum value
	 * @return     {number}  Aleatory number between [min..max] values
	 */
	this.rand = function(min, max) {
		return Math.random() * (max - min) + min;
	}

	/**
	 * Parse <b>val</b> to integer, or 0 if is NaN
	 *
	 * @function intval
	 * @param      {variable} val The value
	 * @return     {number} The integer represents val param
	 */
	this.intval = function(val) {
		return parseInt(val) || 0;
	}

	/**
	 * Parse <b>val</b> to float, or 0 if is NaN
	 *
	 * @function floatval
	 * @param      {variable} val     The value
	 * @return     {number} The float represents val param
	 */
	this.floatval = function(val) {
		return parseFloat(val) || 0;
	}

	/**
	 * Round the specified number to a determinate scale
	 *
	 * @function round
	 * @param      {number} num     The number to be rounded
	 * @param      {number} dec     Number of decimals for rounding num @default 2
	 * @return     {number} Number rounded
	 */
	function fnRound(num, dec) {
		dec = dNaN(dec, 2); return +(Math.round(num + "e" + dec) + "e-" + dec);
	}
	this.round = fnRound;

	//load default language
	self.setI18n(lang);
}


//String Box extensions
function StringBox() {
	const self = this; //self instance
	//const ZEROS = "0000000000";
	const tr1 = "àáâãäåāăąÀÁÂÃÄÅĀĂĄÆßèéêëēĕėęěÈÉĒĔĖĘĚìíîïìĩīĭÌÍÎÏÌĨĪĬòóôõöōŏőøÒÓÔÕÖŌŎŐØùúûüũūŭůÙÚÛÜŨŪŬŮçÇñÑþÐŔŕÿÝ";
	const tr2 = "aaaaaaaaaAAAAAAAAAABeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIoooooooooOOOOOOOOOuuuuuuuuUUUUUUUUcCnNdDRryY";
	const B64 = {
		xls: "data:application/vnd.ms-excel;base64,",
		pdf: "data:application/pdf;base64,",
		txt: "data:text/plain;base64,"
	}

	//helpers
	function isstr(val) { return (typeof val === "string") || (val instanceof String); }
	function fnTrim(str) { return isstr(str) ? str.trim() : str; } //string only
	function fnSize(str) { return str ? str.length : 0; } //string o array
	function tr(str) {
		var output = "";
		var size = fnSize(str);
		for (var i = 0; i < size; i++) {
			var chr = str.charAt(i);
			var j = tr1.indexOf(chr);
			output += (j < 0) ? chr : tr2.charAt(j);
		}
		return output;
	}

	this.isstr = isstr;
	this.trim = fnTrim;
	this.size = fnSize;
	this.tr = function(str) { return tr(fnTrim(str)).toLowerCase(); };
	this.eq = function(str1, str2) { return self.tr(str1) == self.tr(str2); }
	this.indexOf = function(str1, str2) { return str1 ? str1.indexOf(str2) : -1; }
	this.iIndexOf = function(str1, str2) { return self.tr(str1).indexOf(self.tr(str2)); }
	this.prevIndexOf = function(str1, str2, i) { return str1 ? str1.substr(0, i).lastIndexOf(str2) : -1; }
	this.prefix = function(str1, str2) { return str1.startsWith(str2) ? str1 : (str2 + str1); }
	this.suffix = function(str1, str2) { return str1.endsWith(str2) ? str1 : (str1 + str2); }
	this.trunc = function(str, size) { return (fnSize(str) > size) ? (str.substr(0, size).trim() + "...") : str; }
	this.itrunc = function(str, size) {
		var i = (fnSize(str) > size) ? self.prevIndexOf(str, " ", size) : -1;
		return self.trunc(str, (i < 0) ? size : i);
	}

	this.removeAt = function(str, i, n) { return (i < 0) ? str : str.substr(0, i) + str.substr(i + n); }
	this.insertAt = function(str1, str2, i) { return str1 ? (str1.substr(0, i) + str2 + str1.substr(i)) : str2; }
	this.replaceAt = function(str1, str2, i, n) { return (i < 0) ? str1 : (str1.substr(0, i) + str2 + str1.substr(i + n)); }
	this.replaceLast = function(str1, find, str2) { return str1 ? str1.replaceAt(str1.lastIndexOf(find), find.length, str2) : str2; }
	this.wrapAt = function(str, i, n, open, close) { return (i < 0) ? str : self.insertAt(self.insertAt(str, open, i), close, i + open.length + n); }
	this.iwrap = function(str1, str2, open, close) { return self.wrapAt(str1, self.iIndexOf(str1, str2), str1.length, open || "<u><b>", close || "</u></b>"); }
	this.rand = function(size) { return Math.random().toString(36).substr(2, size || 8); } //random char
	this.lopd = function(str) { return str ? ("***" + str.substr(3, 4) + "**") : str; }; //hide protect chars

	this.split = function(str, sep) { return str ? str.trim().split(sep || ",") : []; }
	this.minify = function(str) { return str ? str.trim().replace(/\s{2}/g, "") : str; }
	this.lines = function(str) { return self.split(str, /[\n\r]+/); }
	this.words = function(str) { return self.split(str, /\s+/); }

	this.ilike = function(str1, str2) { return self.iIndexOf("" + str1, str2) > -1; }; //object value type = string
	this.olike = function(obj, names, val) { return names.some(function(k) { return self.ilike(obj[k], val); }); };
	this.alike = function(obj, names, val) { return self.words(val).some(function(v) { return self.olike(obj, names, v); }); };

	//chunk string in multiple parts
	this.ltr = function(str, size) {
		var result = []; //parts container
		for (var i = fnSize(str); i > size; i -= size)
			result.unshift(str.substr(i - size, size));
		(i > 0) && result.unshift(str.substr(0, i));
		return result;
	}
	this.rtl = function(str, size) {
		var result = []; //parts container
		var n = fnSize(str); //maxlength
		for (var i = 0; i < n; i += size)
			result.push(str.substr(i, size));
		return result;
	}
	this.slices = function(str, sizes) {
		var j = 0; //string position
		var result = []; //parts container
		var k = fnSize(str); //maxlength
		for (let i = 0; (j < k) && (i < sizes.length); i++) {
			let n = sizes[i];
			result.push(str.substr(j, n));
			j += n;
		}
		if (j < k) //last slice?
			result.push(str.substr(j));
		return result;
	}
}


/**
 * Validate-Box module
 * @module Validate-Box
 */
function ValidateBox(mb) {
	const self = this; //self instance
	const VALIDATORS = {}; //validators container

	//RegEx for validating
	const RE_DIGITS = /^\d+$/;
	const RE_IDLIST = /^\d+(,\d+)*$/;
	const RE_MAIL = /\w+[^\s@]+@[^\s@]+\.[^\s@]+/;
	const RE_LOGIN = /^[\w#@&°!§%;:=\^\/\(\)\?\*\+\~\.\,\-\$]{6,}$/;
	const RE_IPv4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
	const RE_IPv6 = /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/;
	const RE_SWIFT = /^[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}$/; //SWIFT / BIC
	const RE_URL = /(http|fttextp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
	// Spanish Id's
	const RE_DNI = /^(\d{8})([A-Z])$/;
	const RE_CIF = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
	const RE_NIE = /^[XYZ]\d{7,8}[A-Z]$/;
	// Cards Numbers
	const RE_VISA = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
	const RE_MASTER_CARD = /^(?:5[1-5][0-9]{14})$/;
	const RE_AMEX = /^(?:3[47][0-9]{13})$/;
	const RE_DISCOVER = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
	const RE_DINER_CLUB = /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/;
	const RE_JCB = /^(?:(?:2131|1800|35\d{3})\d{11})$/;

	function fnSize(str) { return str ? str.length : 0; }; //string o array
	function fnTrim(str) { return str ? str.trim() : str; } //string only
	function minify(str) { return str ? str.trim().replace(/\W+/g, "").toUpperCase() : str; }; //remove spaces and upper
	function reTest(re, elemval) { //regex test
		try {
			return re.test(elemval);
		} catch(e) {}
		return false;
	}

	this.required = function(elemval) { return !!elemval; }
	this.size = function(elemval, min, max) {
		let size = fnSize(elemval);
		return (min <= size) && (size <= max);
	}

	this.regex = function(re, value) { return reTest(re, value); }
	this.login = function(elemval) { return reTest(RE_LOGIN, elemval); }
	this.email = function(elemval) { return reTest(RE_MAIL, elemval); }
	this.digits = function(elemval) { return reTest(RE_DIGITS, elemval); }
	this.idlist = function(elemval) { return reTest(RE_IDLIST, elemval); }
	this.array = function(elemval) { return elemval ? Array.isArray(elemval) : true; }

	this.esId = function(str) {
		str = minify(str);
		if (!str)
			return false;
		if (reTest(RE_DNI, str))
			return self.dni(str)
		if (reTest(RE_CIF, str))
			return self.cif(str)
		if (reTest(RE_NIE, str))
			return self.nie(str)
		return false;
	}
	this.dni = function(dni) {
		var letras = "TRWAGMYFPDXBNJZSQVHLCKE";
		var letra = letras.charAt(parseInt(dni, 10) % 23);
		return (letra == dni.charAt(8));
	}
	this.cif = function(cif) {
		var match = cif.match(RE_CIF);
		var letter = match[1];
		var number  = match[2];
		var control = match[3];
		var sum = 0;

		for (var i = 0; i < number.length; i++) {
			var n = parseInt(number[i], 10);
			//Odd positions (Even index equals to odd position. i=0 equals first position)
			if ((i % 2) === 0) {
				n *= 2; //Odd positions are multiplied first
				// If the multiplication is bigger than 10 we need to adjust
				n = (n < 10) ? n : (parseInt(n / 10) + (n % 10));
			}
			sum += n;
		}

		sum %= 10;
		var control_digit = (sum !== 0) ? 10 - sum : sum;
		var control_letter = "JABCDEFGHI".substr(control_digit, 1);
		return letter.match(/[ABEH]/) ? (control == control_digit) //Control must be a digit
					: letter.match(/[KPQS]/) ? (control == control_letter) //Control must be a letter
					: ((control == control_digit) || (control == control_letter)); //Can be either
	}
	this.nie = function(nie) {
		//Change the initial letter for the corresponding number and validate as DNI
		var prefix = nie.charAt(0);
		var p0 = (prefix == "X") ? 0 : ((prefix == "Y") ? 1 : ((prefix == "Z") ? 2 : prefix));
		return self.dni(p0 + nie.substr(1));
	}

	this.iban = function(IBAN) {
		IBAN = minify(IBAN);
		if (fnSize(IBAN) != 24)
			return false;

		// Se coge las primeras dos letras y se pasan a números
		const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let num1 = LETRAS.search(IBAN.substring(0, 1)) + 10;
		let num2 = LETRAS.search(IBAN.substring(1, 2)) + 10;
		//Se sustituye las letras por números.
		let aux = String(num1) + String(num2) + IBAN.substring(2);
		// Se mueve los 6 primeros caracteres al final de la cadena.
		aux = aux.substring(6) + aux.substring(0,6);

		//Se calcula el resto modulo 97
		let resto = "";
		let parts = Math.ceil(aux.length/7);
		for (let i = 1; i <= parts; i++)
			resto = String(parseFloat(resto + aux.substr((i-1)*7, 7))%97);
		return (1 == resto);
	}

	this.creditCardNumber = function(cardNo) { //Luhn check algorithm
		cardNo = minify(cardNo);
		if (fnSize(cardNo) != 16)
			return false;

		let s = 0;
		let doubleDigit = false;
		cardNo = cardNo.trim().replace(/\s+/g, ""); //remove spaces
		for (let i = 15; i >= 0; i--) {
			let digit = +cardNo[i];
			if (doubleDigit) {
				digit *= 2;
				digit -= (digit > 9) ? 9 : 0;
			}
			s += digit;
			doubleDigit = !doubleDigit;
		}
		return ((s % 10) == 0);
	}

	this.generatePassword = function(size, charSet) {
		charSet = charSet || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@&°!§%;:=^/()?*+~.,-$";
		return Array.apply(null, Array(size || 10)).map(function() { 
			return charSet.charAt(Math.random() * charSet.length);
		}).join(""); 
	}
	this.testPassword = function(pass) {
		let strength = 0;
		//Check each group independently
		strength += /[A-Z]+/.test(pass) ? 1 : 0;
		strength += /[a-z]+/.test(pass) ? 1 : 0;
		strength += /[0-9]+/.test(pass) ? 1 : 0;
		strength += /[\W]+/.test(pass) ? 1 : 0;
		//Validation for length of password
		strength += ((strength > 2) && (fnSize(pass) > 8));
		return strength; //0 = bad, 1 = week, 2-3 = good, 4 = strong, 5 = very strong
	}

	this.get = function(name) {
		return name ? VALIDATORS[name] : VALIDATORS;
	}
	this.set = function(name, fn) {
		VALIDATORS[name] = fn;
		return self;
	}
	this.add = function(extra) {
		Object.assign(VALIDATORS, extra);
		return self;
	}

	this.each = function(list, fn) {
		Array.prototype.forEach.call(list, fn);
		return self;
	}
	this.find = function(list, selector) {
		return Array.prototype.find.call(list, el => el.matches(selector));
	}
	this.filter = function(list, selector) {
		return Array.prototype.filter.call(list, el => el.matches(selector));
	}
	this.focus = function(inputs) { //focus on first visible and editable input
		inputs = inputs || document.querySelectorAll("input,select,textarea");
		let el = self.find(inputs, ":not([type=hidden])[tabindex]:not([readonly])");
		el && el.focus();
		return self;
	}
	this.reset = function(list, cb) {
		cb = cb || function fnVoid() {}; //void function
		return self.each(list, (el, i) => { el.value = ""; cb(el, i); });
	}

	/**
	 * Load inputs with <b>obj</b> values, optionally can apply a function contents in <b>opts</b> param.
	 *
	 * @function load
	 * @param      {NodeList} list Input list to be loaded by <b>obj</b> values
	 * @param      {Object}  obj Contains name / value pairs to be applied to inputs
	 * @param      {Object}  opts Functions to by applied by key
	 * @return     {ValidateBox} self instance
	 */
	this.load = function(list, obj, opts) {
		opts = opts || {}; //default settings
		let size = fnSize(list); //length
		for (let i = 0; i < size; i++) {
			let el = list[i]; //element
			let fn = opts[el.name]; //formatter
			el.value = fn ? fn(obj[el.name]) : obj[el.name];
		}
		return self;
	}

	/**
	 * Return an object with the values from input list as pairs name / value
	 *
	 * @function values
	 * @param      {NodeList} list Input list to be translated to an output object as name value pairs
	 * @param      {Object} obj Initial object container by default is empty object {}
	 * @return     {Object} Object containing name value pairs from input list
	 */
	this.values = function(list, obj) {
		obj = obj || {};
		let size = fnSize(list); //length
		for (let i = 0; i < size; i++) {
			let el = list[i]; //element
			let value = fnTrim(el.value);
			if (el.name && value) //has value
				obj[el.name] = value;
		}
		return obj;
	}

	/**
	 * Validate each input applying the associate function by key
	 * 
	 * @function validate
	 * @param      {NodeList} inputs Input list to apply validate functions
	 * @return     {boolean} Indicates if all input has passed check functions
	 */
	this.validate = function(inputs) {
		mb.init(); //init errors
		let size = fnSize(inputs); //length
		for (let i = 0; i < size; i++) {
			let el = inputs[i]; //element
			let fn = VALIDATORS[el.id];
			if (fn && !fn(fnTrim(el.value), el)) {
				mb.isOk() && el.focus(); //focus on first error
				mb.addErrno(); //change indicator
			}
		}
		return mb.isOk();
	}

	/**
	 * Make an AJAX request to server
	 *
	 * @async
	 * @function fetch
	 * @param      {Element} elem DOM element whitch send request
	 * @param      {NodeList} inputs DOM inputs elements to be sended to server
	 * @param      {Object} data Extra data to be added on request
	 * @return     {Promise} Response from server
	 */
	this.fetch = function(elem, inputs, data) {
		const CT = "application/x-www-form-urlencoded";
		const opts = { //init options
			method: "get",
			headers: {
				"x-requested-with": "XMLHttpRequest",
				"Content-Type": CT
			}
		};
		let fd = new FormData(); //build pair key/value
		let size = fnSize(inputs); //length
		for (let i = 0; i < size; i++) {
			let el = inputs[i]; //element
			let value = fnTrim(el.value);
			if (el.name && value) //has value
				fd.append(el.name, value);
		}
		for (let k in data) //has extra data to send
			fd.append(k, data[k]); //add extra data
		let form = elem.closest("form"); //parent form tag
		if (form) {
			opts.method = form.getAttribute("method") || "get"; //ajax options
			opts.headers["Content-Type"] = form.getAttribute("enctype") || CT; //encode
			opts.body = (opts.headers["Content-Type"] == "multipart/form-data") ? fd : new URLSearchParams(fd);
			opts.url = elem.href || form.getAttribute("action");
		}
		else {
			opts.body = new URLSearchParams(fd);
			opts.url = elem.href;
		}
		return fetch(opts.url, opts).then(res => {
			const contentType = res.headers.get("content-type");
			const isJson = (contentType && contentType.indexOf("application/json") !== -1);
			return new Promise(function(resolve, reject) {
				self.focus(inputs); //set focus on first element
				if (res.ok)
					return (isJson ? res.json() : res.text()).then(resolve);
				if (isJson)
					res.json().then(errors => {
						let size = fnSize(inputs); //length
						for (let i = 0; i < size; i++) {
							let el = inputs[i]; //element
							if (errors[el.name]) {
								el.focus(); //set focus
								i = size; //srop for
							}
						}
						reject(errors);
					});
				else
					res.text().then(reject);
			});
		});
	}
}


//DOM is fully loaded
$(document).ready(function() {
	let lang = navigator.language || navigator.userLanguage; //default browser language //$("html").attr("lang");
	let dt = new DateBox(lang);
	let nb = new NumberBox(lang);
	let mb = new MessageBox(lang);
	let vb = new ValidateBox(mb);
	let sb = new StringBox();

	//Helpers and reformat numbers and dates by i18n
	let booleans = document.querySelectorAll(".boolean");
	$(document.querySelectorAll("input.float")).change(function() { this.value = nb.helper(this.value); });
	$(booleans).filter("input").each(function() { this.value = nb.boolval(this.value); });
	$(booleans).not("input").each(function() { this.innerText = nb.boolval(this.innerText); });
	$(document.querySelectorAll("input.date")).keyup(function() { this.value = dt.helper(this.value); })
											.change(function() { this.value = dt.acDate(this.value); });
	$(document.querySelectorAll("input.time")).keyup(function() { $(this).val(dt.tHelper(this.value)); })
											.change(function() { this.value = dt.acTime(this.value); });
	//Datepicker inputs configure calendar
	$.datepicker.regional["es"] = dt.getI18n("es");
	$.datepicker.setDefaults(dt.getLang());
	$(".datepicker").datepicker();

	// Global show / hide messages in view
	let alerts = document.querySelectorAll("div.alert").forEach(el => {
		el.querySelector(".alert-text:not(:empty)") && el.classList.remove("d-none");
		el.querySelector(".alert-close").addEventListener("click", ev => !el.classList.add("d-none"));
	});
	function setDanger(msg) { return !$(alerts).addClass("d-none").filter(".alert-danger").removeClass("d-none").find(".alert-text").html(""+msg); }
	function setSuccess(msg) { return !$(alerts).addClass("d-none").filter(".alert-success").removeClass("d-none").find(".alert-text").html(""+msg); }
	//set messages functions as global for others .js
	window.setDanger = setDanger; //global error
	window.setSuccess = setSuccess; //global success
	//inputs messages handlers
	function fnResetForm(inputs) { $(inputs).removeClass("is-invalid").siblings(".invalid-feedback").text(""); return inputs; }
	function setMsgErr(el, msg) { msg && $(el).addClass("is-invalid").siblings(".invalid-feedback").html(""+msg); return false; }
	function setError(el, name) { return setMsgErr(el, mb.get(name)); }
	function fnRequired(val, el) { return val || setError(el, "required"); }

	// Clearable text inputs
	function tog(v) { return v ? "addClass" : "removeClass"; }
	$(document).on("input", ".clearable", function() {
		$(this)[tog(this.value)]("x");
	}).on("mousemove", ".x", function(ev) {
		$(this)[tog(this.offsetWidth-28 < ev.clientX-this.getBoundingClientRect().left)]("onX");
	}).on("touchstart click", ".onX", function(ev) {
		ev.preventDefault();
		$(this).removeClass("x onX").val("").change();
	});

	//Initialize all textarea counter
	function fnCounter() { $("#counter-" + this.id).text(Math.abs(this.getAttribute("maxlength") - sb.size(this.value))); }
	$("textarea[maxlength]").keyup(fnCounter).each(fnCounter);

	//Autocomplete inputs
	function fnRender(item) { return item.nif + " - " + item.nombre; } //build text to show
	function fnSelect(el, item) { $(el).siblings("[type=hidden]").val(item && item.idUsuario); return this; }
	const autocompletes = {
		source: false, //call source event
		ac1: { url: "/usuarios.html", select: fnSelect, render: fnRender },
		ac2: { url: "/usuarios.html", select: fnSelect, render: fnRender }
	};
	let acOpts;
	let acList = $(".autocomplete").autocomplete({
		minLength: 3,
		source: function(req, res) {
			let loading = $(".loading").show();
			fetch(acOpts.url + "?term=" + req.term, { method: "GET" }) //js ajax call
				.then(res => res.json()) //default response allways json
				.then(data => { res(data.slice(0, 10)); }) //maxResults = 10
				.catch(setDanger) //error handler
				.finally(() => loading.fadeOut()); //allways
		},
		focus: function() { return false; }, //no change focus on select
		search: function(ev, ui) { return autocompletes.source; }, //lunch source
		select: function(ev, ui) { return !$(this).val(acOpts.select(this, ui.item).render(ui.item)); }
	}).keydown(function(ev) {
		acOpts = autocompletes[this.id]; //get ajax config for each element (fetch)
		autocompletes.source = ((ev.keyCode == 8) || (ev.keyCode == 46))
											? !!acOpts.select(this) //BACKSPACE or DELETE => reset previous id
											: ((47 < ev.keyCode) && (ev.keyCode < 171)); //is alphanumeric? 48='0'... 170='*'
	});
	if (acList.length) {
		acList.autocomplete("instance")._renderItem = function(ul, item) {
			return $("<li></li>").append("<div>" + acOpts.render(item) + "</div>").appendTo(ul);
		};
	}

	vb.add({ //add extra validators
		usuario: fnRequired, clave: fnRequired, 
		newPass: fnRequired, oldPass: fnRequired, rePass: fnRequired,
		nombre: fnRequired, asunto: fnRequired, info: fnRequired,
		number: (val, el) => {
			if (!val)
				return setError(el, "required");
			let imp = nb.toFloat(val); //parse float
			if (isNaN(imp))
				return setError(el, "number");
			return nb.between(imp, 6.7, 18.3) ? true : setError(el, "range");
		},
		date: function(val, el) {
			if (!val)
				return setError(el, "required");
			let f = dt.toDate(val); //parse date
			if (!dt.valid(f)) return setError(el, "date");
			return (dt.sysdate() > f) ? true : setError(el, "range");
		},
		nif: (val, el) => {
			return fnRequired(val, el) && (vb.esId(val) || setError(el, "regex"));
		}
	}).set("correo", (val, el) => {
		return fnRequired(val, el) && (vb.email(val, el) || setError(el, "regex"));
	}).focus(); //Set focus on first visible and editable input

	$("form").submit(function(ev) {
		return vb.validate(fnResetForm(this.elements)) ? $(".loading").show() : setDanger(mb.get("form"));
	}).each(function() {
		//show error messages from server
		$(this.querySelectorAll(".invalid-feedback:not(:empty)")).siblings(":input").addClass("is-invalid");

		//initialize ajax call
		let loaders = {}; //response handler
		let inputs = this.elements; //list
		$(".ajax-submit", this).click(function(ev) {
			function showErrors(errors) {
				vb.each(inputs, el => { setMsgErr(el, errors[el.name]); });
				setDanger(errors.message || mb.get("form"));
			}

			ev.preventDefault();
			if (vb.validate(fnResetForm(inputs))) {
				let loading = $(".loading").show();
				let fn = loaders[this.id] || setSuccess;
				if ((typeof grecaptcha !== "undefined") && this.classList.contains("captcha")) {
					grecaptcha.ready(function() {
						grecaptcha.execute("6LeDFNMZAAAAAKssrm7yGbifVaQiy1jwfN8zECZZ", { action: "submit" })
							.then(token => vb.fetch(ev.target, inputs, { token }).finally(() => loading.fadeOut()))
							.then(fn)
							.catch(showErrors);
					});
				}
				else {
					vb.fetch(this, inputs)
						.then(fn)
						.catch(showErrors)
						.finally(() => loading.fadeOut()); //allways
				}
			}
			else
				setDanger(mb.get("form"));
		});
	});
});


//DOM is fully loaded
$(document).ready(function() {
	// Build all menus as UL > Li
	$("ul.menu").each(function(i, menu) {
		// Build menuu as tree
		$(menu.children).filter("[parent][parent!='']").each((i, child) => {
			let node = $("#" + $(child).attr("parent"), menu); //get parent node
			node.children().last().is(menu.tagName)
				|| node.append('<ul class="sub-menu"></ul>').children("a").append('<b class="nav-tri">&rtrif;</b>');
			node.children().last().append(child);
		});

		// Remove empty sub-levels and empty icons
		$(menu.children).remove("[parent][parent!='']");
		menu.querySelectorAll("i").forEach(i => {
			(i.classList.length <= 1) && i.parentNode.removeChild(i);
		});

		// Add triangles mark for submenu items
		let triangles = $("b.nav-tri", menu); //find all marks
		triangles.parent().click(function(ev) {
			$(this.parentNode).toggleClass("active");
			ev.preventDefault(); //not navigate when click on parent
		});
		$("li", menu).hover(function() {
			triangles.html("&rtrif;"); //initialize triangles state
			$(this).children("a").find("b.nav-tri").html("&dtrif;"); //down
			$(this).parents("ul.sub-menu").prev().find("b.nav-tri").html("&dtrif;"); //up
		});

		// Disables links
		$("[disabled]", menu).each(function() {
			let mask = parseInt(this.getAttribute("disabled")) || 0;
			$(this).toggleClass("disabled", (mask & 3) !== 3);
		}).removeAttr("disabled");
	}).children().fadeIn(200); //show level=1

	// Show/Hide sidebar
	$(".sidebar-toggle").click(ev => {
		$("#sidebar").toggleClass("active");
		$(".sidebar-icon", this.parentNode).toggleClass("d-none");
		ev.preventDefault();
	});

	// Dropdown menu events
	document.querySelectorAll(".dropdown").forEach(el => {
		el.addEventListener("click", ev => {
			ev.preventDefault();
			let rect = el.getBoundingClientRect();
			let $el = $(el).siblings(".dropdown-menu").toggleClass("active");
			if ((rect.left + rect.width) > window.innerWidth)
				$el.css("right", rect.right);
			else
				$el.css("left", rect.left);
		});
		el.addEventListener("focusout", ev => {
			$(el).siblings(".dropdown-menu").removeClass("active");
		});
	});

	//Scroll body to top on click and toggle back-to-top arrow
	let top = $("#back-to-top").click(function() { return !$("body,html").animate({ scrollTop: 0 }, 400); });
	$(window).scroll(function() { ($(this).scrollTop() > 50) ? top.fadeIn() : top.fadeOut(); });

	//Scroll anchors to its destination with a slow effect
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener("click", function(ev) {
			ev.preventDefault();
			try {
				document.querySelector(this.href).scrollIntoView({ behavior: "smooth" });
			} catch (ex) {}
		});
	});

	// SCROLL REVEAL SCRIPT
	let sr = ScrollReveal();
	sr.reveal(".header-content-left", { duration: 2000, origin: "top", distance: "300px" });
	sr.reveal(".header-content-right", { duration: 2000, origin: "right", distance: "300px" });
	sr.reveal(".header-btn", { duration: 2000, delay: 1000, origin: "bottom" });
	sr.reveal("#testimonial div", { duration: 2000, origin: "left", distance: "300px", viewFactor: 0.2 });
});
