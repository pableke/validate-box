
//DOM is fully loaded
$(document).ready(function() {
	let lang = navigator.language || navigator.userLanguage; //default browser language //$("html").attr("lang");
	let dt = new DateBox(lang);
	let nb = new NumberBox(lang);
	let mb = new MessageBox(lang);
	let vb = new ValidateBox();
	let sb = new StringBox();

	$("ul#menu").each(function(i, menu) { //build tree for the menu
		$(menu.children).filter("[parent][parent!='']").each((i, child) => {
			let node = $("#" + $(child).attr("parent"), menu); //get parent node
			node.children().last().is(menu.tagName) || node.append('<ul class="sub-menu"></ul>');
			node.children().last().append(child);
		});
		//add triangles in the second tree level deep
		let triangles = $("li>ul", menu).find("ul.sub-menu").prev().append(' <b class="nav-tri">&rtrif;</b>').find("b.nav-tri");
		$(menu.children, menu).remove("[parent][parent!='']"); //remove sub-levels
		$("a.nav-link", menu).hover(function() {
			triangles.html("&rtrif;");
			$("b.nav-tri", this).html("&dtrif;");
			$(this).parents("ul.sub-menu").each(function() {
				$(this).prev().find("b.nav-tri").html("&dtrif;");
			});
		}).filter("[disabled]").each(function() {
			let mask = parseInt(this.getAttribute("disabled")) || 0;
			$(this).toggleClass("disabled", (mask & 3) !== 3);
		}).removeAttr("disabled");
	}).children().fadeIn(200);

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
	let alerts = $("div.alert").each(function(i, el) {
		$(".alert-text:not(:empty)", el).length && $(el).removeClass("d-none");
		$("button", el).click(function() { return !$(el).addClass("d-none"); });
	});
	function setDanger(msg) { return !alerts.addClass("d-none").filter(".alert-danger").removeClass("d-none").find(".alert-text").html(""+msg); }
	function setSuccess(msg) { return !alerts.addClass("d-none").filter(".alert-success").removeClass("d-none").find(".alert-text").html(""+msg); }
	//set messages functions as global for others .js
	window.setDanger = setDanger; //global error
	window.setSuccess = setSuccess; //global success
	//inputs messages handlers
	function fnResetForm(inputs) { $(inputs).removeClass("is-invalid").siblings(".invalid-feedback").text(""); return inputs; }
	function setMsgErr(el, msg) { msg && $(el).focus().addClass("is-invalid").siblings(".invalid-feedback").html(""+msg); return false; }
	function setError(el, name) { return setMsgErr(el, mb.get(name)); }
	function fnRequired(val, el) { return val || setError(el, "required"); }

	//Clear the input asociated to X button and give it focus
	function toggleClear() { $(this).siblings(".clear-input").toggleClass("d-none", !this.value); } //toggle X button
	$(".clear-input").click(function() { $(this).addClass("d-none").siblings("input").val("").focus(); })
					.siblings("input").each(toggleClear).keyup(toggleClear);

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
			return fnRequired(val, el) && (vb.esId(val.toUpperCase()) || setError(el, "regex"));
		}
	}).set("email", (val, el) => {
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
				vb.each(inputs, el => { setMsgErr(el, errors[el.id]); });
				setDanger(errors.message || mb.get("form"));
			}

			ev.preventDefault();
			fnResetForm(inputs);
			if (vb.validate(inputs)) {
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

	//Scroll body to top on click and toggle back-to-top arrow
	let top = $("#back-to-top").click(function() { return !$("body,html").animate({ scrollTop: 0 }, 400); });
	$(window).scroll(function() { ($(this).scrollTop() > 50) ? top.fadeIn() : top.fadeOut(); });

	//Scroll anchors to its destination with a slow effect
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener("click", function(ev) {
			ev.preventDefault();
			try {
				document.querySelector(this.href).scrollIntoView({ behavior: "smooth" });
			} catch (ex) {
				console.log("top", ex);
			}
		});
	});
});
