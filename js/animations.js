/* =========================================================
   DRex Consulting — SCROLL REVEAL
   Adds `.is-visible` to [data-reveal] elements and the hero
   `.drawn-underline` as they enter the viewport.

   The matching CSS only hides these elements when <html> has
   `.js`, so with JS off everything is visible. Under
   prefers-reduced-motion: reduce we skip the observer and
   mark everything visible immediately.

   Re-scans on `components:loaded` in case the injected
   partials bring their own reveal targets.
========================================================= */
(function () {
  "use strict";

  var SELECTOR = "[data-reveal], .drawn-underline";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var observer = null;

  function revealAll() {
    var nodes = document.querySelectorAll(SELECTOR);
    Array.prototype.forEach.call(nodes, function (node) {
      node.classList.add("is-visible");
    });
  }

  function getObserver() {
    if (observer) return observer;
    if (!("IntersectionObserver" in window)) return null;

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px"
    });

    return observer;
  }

  function scan() {
    if (reduce) {
      revealAll();
      return;
    }

    var obs = getObserver();
    if (!obs) {
      revealAll();
      return;
    }

    var nodes = document.querySelectorAll(SELECTOR);
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.dataset.revealBound === "true") return;
      node.dataset.revealBound = "true";
      obs.observe(node);
    });
  }

  /* Safety net for motion-OK users: the CSS hides [data-reveal] as soon
     as `.js` lands, and only the IntersectionObserver reveals it again.
     If the observer never fires for a node that's already on screen
     (very short page, a later JS error, an element shown after a filter
     toggle), that content would be stranded invisible. Once the page has
     fully loaded, force-reveal anything at or above the fold; items
     genuinely below the fold stay observed and animate on scroll. */
  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var nodes = document.querySelectorAll(SELECTOR);
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.classList.contains("is-visible")) return;
      if (node.getBoundingClientRect().top < vh * 1.25) {
        node.classList.add("is-visible");
      }
    });
  }

  document.addEventListener("components:loaded", scan);
  window.addEventListener("load", revealInView);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }
})();
