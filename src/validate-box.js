
/**
 * Validate-Box module
 * @module Validate-Box
 */
module.exports = function ValidateBox(opts) {
	const self = this; //self instance
	const VALIDATORS = {}; //validators container
	const SETTINGS = { //default config
		//RegEx for validating
		RE_DIGITS: /^\d+$/,
		RE_IDLIST: /^\d+(,\d+)*$/,
		RE_MAIL: /\w+[^\s@]+@[^\s@]+\.[^\s@]+/,
		RE_LOGIN: /^[\w#@&°!§%;:=\^\/\(\)\?\*\+\~\.\,\-\$]{6,}$/,
		RE_IPv4: /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
		RE_IPv6: /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/,
		RE_SWIFT: /^[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}$/, //SWIFT / BIC
		RE_URL: /(http|fttextp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/,
		RE_DNI: /^(\d{8})([A-Z])$/,
		RE_CIF: /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/,
		RE_NIE: /^[XYZ]\d{7,8}[A-Z]$/
	}
	let MESSAGES = {}; //messages container

	opts = Object.assign({}, SETTINGS, opts); //congig is optional
	this.getSettings = function() { return opts; } //get current config
	this.setSettings = function(data) { Object.assign(opts, data); return self; }
	this.getMessages = function() { return MESSAGES; } //get current config
	this.setMessages = function(data) { MESSAGES = data || MESSAGES; return self; }

	function fnSize(str) { return str ? str.length : 0; }; //string o array
	function fnTrim(str) { return str ? str.trim() : str; } //string only
	function reTest(re, elemval) { //regex test
		try {
			return !elemval || re.test(elemval);
		} catch(e) {}
		return false;
	}

	this.required = function(elemval) { return !!elemval; }
	this.size = function(elemval, min, max) {
		let size = fnSize(elemval);
		return (min <= size) && (size <= max);
	}

	this.regex = function(re, value) { return reTest(re, value); }
	this.login = function(elemval) { return reTest(opts.RE_LOGIN, elemval); }
	this.email = function(elemval) { return reTest(opts.RE_MAIL, elemval); }
	this.digits = function(elemval) { return reTest(opts.RE_DIGITS, elemval); }
	this.idlist = function(elemval) { return reTest(opts.RE_IDLIST, elemval); }
	this.array = function(elemval) { return elemval ? Array.isArray(elemval) : true; }

	this.esId = function(str) {
		return reTest(opts.RE_DNI, str) ? self.dni(str)
				: reTest(opts.RE_CIF, str) ? self.cif(str)
				: reTest(opts.RE_NIE, str) ? self.nie(str)
				: false;
	}
	this.dni = function(dni) {
		var letras = "TRWAGMYFPDXBNJZSQVHLCKE";
		var letra = letras.charAt(parseInt(dni, 10) % 23);
		return (letra == dni.charAt(8));
	}
	this.cif = function(cif) {
		var match = cif.match(opts.RE_CIF);
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
		if (fnSize(IBAN) < 24) return false;
		//Se pasa a Mayusculas y se quita los espacios en blanco
		IBAN = IBAN.trim().replace(/\s+/g, "").toUpperCase();
		if (fnSize(IBAN) != 24) return false;

		// Se coge las primeras dos letras y se pasan a números
		const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let num1 = LETRAS.search(IBAN.substring(0, 1)) + 10;
		let num2 = LETRAS.search(IBAN.substring(1, 2)) + 10;
		//Se sustituye las letras por números.
		let aux = String(num1) + String(num2) + IBAN.substring(2);
		// Se mueve los 6 primeros caracteres al final de la cadena.
		aux = aux.substring(6) + aux.substring(0,6);

		//Se calcula el resto modulo 97
		var resto = "";
		var parts = Math.ceil(aux.length/7);
		for (let i = 1; i <= parts; i++)
			resto = String(parseFloat(resto + aux.substr((i-1)*7, 7))%97);
		return (resto == 1);
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
	 * Object that links inputs elements to its message error by name
	 * 
	 * @const
	 * @type {Object}
	 */
	const ERRORS = { errno: 0 }; //container
	this.isOk = function() { return ERRORS.errno == 0; }
	this.isError = function() { return ERRORS.errno > 0; }
	this.hasError = function(name) { return !!ERRORS[name]; }
	this.getError = function() { return ERRORS; }
	this.getErrors = function() { return ERRORS; }
	this.addErrno = function() { ERRORS.errno++; return self; }
	this.setErrno = function(errno) { ERRORS.errno = errno; return self; }
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

	/**
	 * Validate each input applying the associate function by key
	 * 
	 * @function validate
	 * @param      {NodeList} inputs Input list to apply validate functions
	 * @param      {Object} validators Extra functions for validating inputs
	 * @return     {boolean} Indicates if all input has passed check functions
	 */
	this.validate = function(inputs, validators) {
		self.init().add(validators); //init errors and validators
		let size = fnSize(inputs); //length
		for (let i = 0; i < size; i++) {
			let el = inputs[i]; //element
			let fn = VALIDATORS[el.id];
			if (fn && !fn(fnTrim(el.value), el)) {
				self.isOk() && el.focus(); //focus on first error
				ERRORS.errno++; //change indicator
			}
		}
		return self.isOk();
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
