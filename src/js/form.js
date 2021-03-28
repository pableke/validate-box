
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
	function fnRenderUser(item) { return item.nif + " - " + item.nombre; }
	function fnAcLoad(el, id, txt) { return !$(el).val(txt).siblings("[type=hidden]").val(id); }
	$(".autocomplete").autocomplete({ //autocomplete for users
		minLength: 3,
		source: function(req, res) {
			let loading = $(".loading").show();
			this.element.autocomplete("instance")._renderItem = function(ul, item) {
				return $("<li></li>").append("<div>" + fnRenderUser(item) + "</div>").appendTo(ul);
			}
			fetch("/usuarios.html?term=" + req.term, { method: "GET" }) //js ajax call
				.then(res => res.json()) //default response allways json
				.then(data => { res(data.slice(0, 10)); }) //maxResults = 10
				.catch(setDanger) //error handler
				.finally(() => loading.fadeOut()); //allways
		},
		focus: function() { return false; }, //no change focus on select
		search: function(ev, ui) { return false; }, //lunch source
		select: function(ev, ui) { return fnAcLoad(this, ui.item.nif, fnRenderUser(ui.item)); }
	}).change(function(ev) {
		this.value || fnAcLoad(this, "", "");
	});

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
