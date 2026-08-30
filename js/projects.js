/* =========================================================
   DRex Consulting — PROJECTS PAGE
   initProjectFilter() — accessible category filter for the
   Field Notes card grid.

   Progressive enhancement: the filter markup ships with the
   `hidden` attribute. If this script never runs, visitors
   simply see all six cards and no controls. When it runs it
   unhides the filter and wires the buttons.

   Loads BEFORE js/main.js. No dependency on components.js —
   the filter markup is part of the page, not an injected
   partial — but we still re-check on `components:loaded`
   in case boot order ever changes. Idempotent.
========================================================= */
(function () {
  "use strict";

  function initProjectFilter() {
    var root = document.querySelector("[data-project-filter]");
    if (!root || root.dataset.filterReady === "true") return;

    var grid = document.querySelector("[data-project-grid]");
    var buttons = Array.prototype.slice.call(
      root.querySelectorAll("[data-filter]")
    );
    var status = root.querySelector("[data-project-count]");
    if (!grid || !buttons.length) return;

    var cards = Array.prototype.slice.call(
      grid.querySelectorAll("[data-category]")
    );
    if (!cards.length) return;

    root.dataset.filterReady = "true";
    root.hidden = false;

    function labelFor(filter) {
      for (var i = 0; i < buttons.length; i += 1) {
        if (buttons[i].dataset.filter === filter) {
          return (
            buttons[i].dataset.label ||
            (buttons[i].textContent || "").trim()
          );
        }
      }
      return filter;
    }

    function apply(filter) {
      var shown = 0;

      cards.forEach(function (card) {
        var match =
          filter === "all" || card.dataset.category === filter;
        card.hidden = !match;
        if (match) shown += 1;
      });

      buttons.forEach(function (btn) {
        btn.setAttribute(
          "aria-pressed",
          btn.dataset.filter === filter ? "true" : "false"
        );
      });

      if (status) {
        if (filter === "all") {
          status.textContent =
            "Showing all " + shown + " project notes.";
        } else {
          status.textContent =
            "Showing " +
            shown +
            " " +
            labelFor(filter) +
            " project note" +
            (shown === 1 ? "" : "s") +
            ".";
        }
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(btn.dataset.filter || "all");
      });
    });

    /* establish the default "show everything" state */
    apply("all");
  }

  document.addEventListener("components:loaded", initProjectFilter);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectFilter);
  } else {
    initProjectFilter();
  }
})();
