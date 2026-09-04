(function () {
	"use strict";

	var root = document.documentElement;
	var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- theme ---- */
	var toggle = document.querySelector(".theme-toggle");

	function paintTheme(theme) {
		root.dataset.theme = theme;
		toggle.setAttribute("aria-pressed", String(theme === "dark"));
		toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
	}

	paintTheme(root.dataset.theme === "dark" ? "dark" : "light");

	toggle.addEventListener("click", function () {
		var next = root.dataset.theme === "dark" ? "light" : "dark";
		paintTheme(next);
		try { localStorage.setItem("theme", next); } catch (e) {}
	});

	/* ---- mobile nav ---- */
	var menuBtn = document.querySelector(".menu-btn");
	var nav = document.getElementById("primary-nav");

	function setNav(open) {
		nav.classList.toggle("is-open", open);
		document.body.classList.toggle("nav-open", open);
		menuBtn.setAttribute("aria-expanded", String(open));
		menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
	}

	menuBtn.addEventListener("click", function () {
		setNav(menuBtn.getAttribute("aria-expanded") !== "true");
	});

	nav.addEventListener("click", function (e) {
		if (e.target.closest("a")) setNav(false);
	});

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
			setNav(false);
			menuBtn.focus();
		}
	});

	/* ---- scroll reveal ---- */
	var revealables = document.querySelectorAll("[data-reveal]");

	revealables.forEach(function (el) {
		var delay = el.getAttribute("data-reveal-delay");
		if (delay) el.style.setProperty("--d", delay);
	});

	if (reduced || !("IntersectionObserver" in window)) {
		revealables.forEach(function (el) { el.classList.add("is-visible"); });
	} else {
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			});
		}, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

		revealables.forEach(function (el) { observer.observe(el); });
	}

	/* ---- header state + read progress ---- */
	var shell = document.querySelector(".header-shell");
	var bar = document.querySelector(".progress span");
	var ticking = false;

	function onScroll() {
		var max = document.documentElement.scrollHeight - window.innerHeight;
		var y = window.scrollY;
		shell.classList.toggle("is-scrolled", y > 24);
		bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
		ticking = false;
	}

	window.addEventListener("scroll", function () {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(onScroll);
	}, { passive: true });
	onScroll();

	/* ---- project cursor ---- */
	var cursor = document.querySelector(".cursor");

	if (!reduced && matchMedia("(hover: hover) and (pointer: fine)").matches) {
		var x = 0, y = 0, drawing = false;

		function draw() {
			cursor.style.transform = "translate3d(" + x + "px," + y + "px,0) scale(" + (cursor.classList.contains("is-active") ? 1 : 0.4) + ")";
			drawing = false;
		}

		window.addEventListener("mousemove", function (e) {
			x = e.clientX;
			y = e.clientY;
			if (drawing) return;
			drawing = true;
			requestAnimationFrame(draw);
		}, { passive: true });

		document.querySelectorAll(".project").forEach(function (project) {
			project.addEventListener("mouseenter", function () { cursor.classList.add("is-active"); draw(); });
			project.addEventListener("mouseleave", function () { cursor.classList.remove("is-active"); draw(); });
		});
	}

	/* ---- footer year ---- */
	var year = document.querySelector("[data-year]");
	if (year) year.textContent = new Date().getFullYear();
})();
