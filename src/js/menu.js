
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
			let menu = $(el).siblings(".dropdown-menu").toggleClass("active");
			if ((rect.left > menu.outerWidth()) && ((rect.left + menu.outerWidth()) > window.innerWidth))
				menu.css("left", rect.right - menu.innerWidth()); //default pixels px
			else
				menu.css("left", rect.left); //default pixels px
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
