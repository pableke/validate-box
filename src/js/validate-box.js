
//Validations Box extensions
function ValidateBox(opts) {
	const self = this; //self instance
	const SETTINGS = { //default configuration
		//class selectors
		errInputClass: "is-invalid",
		prefixSubClass: "ajax-submit-",

		//RegEx to validators
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
		RE_NIE: /^[XYZ]\d{7,8}[A-Z]$/,

		//container
		validators: {}
	}
	opts = Object.assign({}, SETTINGS, opts); //congig is optional

	/*function isnum(str) { return !isNaN(str); } //0 = true
	function intval(val) { return parseInt(val) || 0; }
	function floatval(val) { return parseFloat(val) || 0; }
	function fAttr(elem, name) { return floatval(elem.getAttribute(name)); } //attr value to number*/
	function fnSize(str) { return str ? str.length : 0; }; //string o array
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

	this.regex = function(elemval) { return reTest(opts[attrval], elemval); }
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
		//Se pasa a Mayusculas y se quita los espacios en blanco
		IBAN = IBAN.toUpperCase().trim().replace(/\s+/g, "");
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
		return name ? opts.validators[name] : opts.validators;
	}
	this.set = function(name, fn) {
		opts.validators[name] = fn;
		return self;
	}
	this.add = function(extra) {
		Object.assign(opts.validators, extra);
		return self;
	}

	this.values = function(list, obj) {
		obj = obj || {};
		let size = fnSize(list); //length
		for (let i = 0; i < size; i++) {
			let el = list[i]; //element
			obj[el.name] = el.value;
		}
		return obj;
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
		inputs = inputs || document.body.querySelectorAll("input,select,textarea");
		let el = self.find(inputs, ":not([type=hidden])[tabindex]:not([readonly])");
		el && el.focus();
		return self;
	}
	this.reset = function(list) {
		return self.each(list, el => { el.value = ""; });
	}

	this.validate = function(inputs, validators) {
		validators = validators || opts.validators;
		let ok = true; //valid indicator
		let size = fnSize(inputs); //length
		for (let i = 0; i < size; i++) {
			let el = inputs[i]; //element
			let fn = validators[el.id];
			if (fn && !fn(el.value, el)) {
				el.classList.add(opts.errInputClass);
				ok && el.focus(); //focus on first error
				ok = false; //change indicator
			}
			else
				el.classList.remove(opts.errInputClass);
		}
		return ok;
	}

	this.fetch = function(elem, errText) {
		let form = elem.closest("form"); //parent form tag
		let inputs = form.querySelectorAll("." + opts.prefixSubClass + elem.id);
		inputs = inputs.length ? inputs : form.elements;
		if (this.validate(inputs)) {
			let fd = new FormData(form); //build pair key/value
			function fnFetch() {
				let opts = { method: form.getAttribute("method") || "post", headers: {} }; //ajax options
				opts.headers["Content-Type"] = form.getAttribute("enctype") || "application/x-www-form-urlencoded"; //encode
				opts.body = (opts.headers["Content-Type"] == "multipart/form-data") ? fd : new URLSearchParams(fd);
				return fetch(elem.href || form.getAttribute("action"), opts)
						.then(res => { if (res.ok) self.reset(inputs); self.focus(inputs); return res; });
			}

			if (grecaptcha && elem.classList.contains("captcha")) {
				return new Promise((resolve, reject) => {
					grecaptcha.ready(function() {
						grecaptcha.execute("6LeDFNMZAAAAAKssrm7yGbifVaQiy1jwfN8zECZZ", {
							action: "submit"
						}).then(function(token) {
							fd.append("token", token);
							resolve();
						});
					});
				}).then(fnFetch);
			}
			else
				return fnFetch();
		}
		//invalid inputs in form
		return new Promise((resolve, reject) => {
			reject(errText || "Invallid Form!");
		});
	}
}