
//Message Box extensions
function MessageBox(lang) {
	const self = this; //self instance
	const langs = {
		en: { //english
			required: "Required field!",
			minlength: "Minlength = @minlength;",
			maxlength: "Maxlength exceded",
			email: "Wrong Mail format",
			regex: "Wrong format",

			number: "Wrong number format",
			min: "Min value = @min;",
			max: "Max value exceded",
			range: "Value out of range",
			digits: "Not numeric value",

			date: "Wrong date format",
			mindate: "Min date = @mindate;",
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
			minlength: "Longitud m&iacute;nima = @minlength;",
			maxlength: "Longitud m&aacute;xima excedida",
			email: "Formato de E-Mail incorrecto",
			regex: "Formato incorrecto",

			number: "Formato n&uacute;merico incorrecto",
			min: "Valor m&iacute;nimo = @min;",
			max: "Valor m&aacute;ximo excedido",
			range: "Valor fuera del rango permitido",
			digits: "Valor no n&uacute;merico",

			date: "Formato de fecha incorrecto",
			mindate: "Fecha m&iacute;nima = @mindate;",
			maxdate: "Fecha m&aacute;xima excedida",
			time: "Hora incorrecta",

			opok: "Operaci&oacute;n realizada correctamente",
			operr: "Error al ejecutar la operaci&oacute;n",
			form: "El formulario contiene campos erroneos",

			remove: "\277Confirma que desea eliminar este registro?",
			cancel: "\277Confirma que desea cancelar este registro?"
		}
	}

	var _lang = langs.es; //default
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

	//load default language
	self.setI18n(lang);
}
