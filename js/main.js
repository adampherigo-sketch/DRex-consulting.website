/* =========================================================
   DRex Consulting — MAIN BEHAVIOUR
   initNav()  — active tab, mobile menu toggle, focus mgmt
   initYear() — fill the footer copyright year
   initSmoothScroll() — in-page anchor scrolling + focus

   Runs on `components:loaded` (navbar/footer just injected)
   and again on DOMContentLoaded for anything already in the
   DOM. Every step is idempotent.
========================================================= */
(function () {
  "use strict";

  /* below this width the nav is a top bar with a hamburger; at or above
     it, the fixed left binding rail. Must match the CSS breakpoint in
     style.css / responsive.css (1024px). */
  var mqMobile = window.matchMedia("(max-width: 1023.98px)");
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------ */
  function initNav() {
    var nav = document.querySelector("[data-nav]");
    if (!nav || nav.dataset.navReady === "true") return;
    nav.dataset.navReady = "true";

    var toggle = nav.querySelector("[data-nav-toggle]");
    var menu = nav.querySelector("[data-nav-menu]");
    var links = menu
      ? Array.prototype.slice.call(menu.querySelectorAll("a"))
      : [];

    /* active link: match the href basename against this page */
    var here = location.pathname.split("/").pop() || "index.html";
    links.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var target = href.split("#")[0].split("/").pop() || "index.html";
      if (target === here) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });

    if (!toggle || !menu) return;

    /* JS is present: reveal the toggle, let CSS collapse the menu */
    toggle.hidden = false;

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    function setState(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        menu.hidden = false;
        menu.classList.add("is-open");
      } else {
        menu.classList.remove("is-open");
        if (mqMobile.matches) menu.hidden = true;
      }
    }

    function openMenu() {
      setState(true);
      if (links[0]) links[0].focus();
    }

    function closeMenu(returnFocus) {
      var wasOpen = isOpen();
      setState(false);
      if (returnFocus && wasOpen) toggle.focus();
    }

    function syncViewport() {
      if (mqMobile.matches) {
        if (!isOpen()) {
          menu.hidden = true;
          menu.classList.remove("is-open");
        }
      } else {
        menu.hidden = false;
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    }

    toggle.addEventListener("click", function () {
      if (isOpen()) closeMenu(false);
      else openMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) closeMenu(true);
    });

    document.addEventListener("click", function (event) {
      if (isOpen() && !nav.contains(event.target)) closeMenu(false);
    });

    /* disclosure pattern: close when focus tabs out of the nav entirely */
    nav.addEventListener("focusout", function () {
      window.requestAnimationFrame(function () {
        if (isOpen() && !nav.contains(document.activeElement)) closeMenu(false);
      });
    });

    menu.addEventListener("click", function (event) {
      if (isOpen() && event.target.closest("a")) closeMenu(false);
    });

    if (mqMobile.addEventListener) {
      mqMobile.addEventListener("change", syncViewport);
    } else if (mqMobile.addListener) {
      mqMobile.addListener(syncViewport);
    }

    syncViewport();
  }

  /* ------------------------------------------------------
     COPYRIGHT YEAR
  ------------------------------------------------------ */
  function initYear() {
    var year = String(new Date().getFullYear());
    var nodes = document.querySelectorAll("[data-current-year]");
    Array.prototype.forEach.call(nodes, function (node) {
      node.textContent = year;
    });
  }

  /* ------------------------------------------------------
     SMOOTH IN-PAGE SCROLLING
  ------------------------------------------------------ */
  function initSmoothScroll() {
    if (document.documentElement.dataset.smoothReady === "true") return;
    document.documentElement.dataset.smoothReady = "true";

    document.addEventListener("click", function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute("href").slice(1);
      if (!id) return;

      var target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();

      if (mqReduce.matches) {
        target.scrollIntoView();
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });

      if (window.history && history.replaceState) {
        history.replaceState(null, "", "#" + id);
      }
    });
  }

  /* ------------------------------------------------------
     BOOT
  ------------------------------------------------------ */
  function run() {
    initNav();
    initYear();
    initSmoothScroll();
  }

  document.addEventListener("components:loaded", run);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
