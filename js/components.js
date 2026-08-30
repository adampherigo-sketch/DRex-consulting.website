/* =========================================================
   DRex Consulting — COMPONENT LOADER
   Runs first. Marks <html> as JS-capable, then injects the
   shared navbar + footer partials and announces when done.

   Progressive enhancement: if the fetches fail (most often
   because the page was opened straight from disk over
   file://), the page still shows all of its own content —
   this script only warns the developer and never throws.
========================================================= */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var PARTS = [
    {
      selector: '#navbar-container, [data-component="navbar"]',
      file: "components/navbar.html"
    },
    {
      selector: '#footer-container, [data-component="footer"]',
      file: "components/footer.html"
    }
  ];

  function inject(part) {
    var host = document.querySelector(part.selector);
    if (!host) return Promise.resolve();

    return fetch(part.file).then(function (res) {
      if (!res.ok) {
        throw new Error("HTTP " + res.status + " while loading " + part.file);
      }
      return res.text();
    }).then(function (markup) {
      host.innerHTML = markup;
    });
  }

  Promise.all(PARTS.map(inject)).then(function () {
    document.dispatchEvent(new CustomEvent("components:loaded"));
  }).catch(function (err) {
    console.warn(
      "[DRex] Shared navbar/footer could not be loaded (" + err.message + ").\n" +
      "These partials load with fetch(), which browsers block on the file:// " +
      "protocol. Serve the folder over HTTP instead — e.g. run `npx serve` in " +
      "the project root, or use the VS Code \"Live Server\" extension — then reload."
    );
  });
})();
