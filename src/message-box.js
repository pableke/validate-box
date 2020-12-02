
/**
 * Message-Box module
 * @module Message-Box
 */
module.exports = function MessageBox(lang) {
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
