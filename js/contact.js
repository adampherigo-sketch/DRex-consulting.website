/* =========================================================
   DRex Consulting — CONTACT FORM BEHAVIOUR  (contact.html)

   Progressive enhancement for #contact-form:
   - form carries `novalidate`; this script does the checks
   - validates on submit and on blur of each required field
   - inline .field-error text, linked via aria-describedby,
     with aria-invalid on the control
   - focuses the first invalid field on submit
   - on a valid submit, posts to Netlify Forms (no keys) and
     reports the result through one aria-live region
   - never invents an endpoint or an address

   Dependency-free. Runs immediately (script is at end of body).
========================================================= */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = form.querySelector(".form-status");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var fields = [
    { el: form.elements["name"], kind: "required", label: "your name" },
    { el: form.elements["email"], kind: "email", label: "your email address" },
    { el: form.elements["working-on"], kind: "required", label: "what you're working on" },
    { el: form.elements["how-can-drex-help"], kind: "required", label: "how DRex can help" }
  ].filter(function (f) { return f.el; });

  function errorNode(field) {
    var id = field.el.getAttribute("aria-describedby");
    return id ? document.getElementById(id) : null;
  }

  function showError(field, message) {
    var node = errorNode(field);
    field.el.setAttribute("aria-invalid", "true");
    if (node) {
      node.textContent = message;
      node.hidden = false;
    }
  }

  function clearError(field) {
    var node = errorNode(field);
    field.el.removeAttribute("aria-invalid");
    if (node) {
      node.textContent = "";
      node.hidden = true;
    }
  }

  function validateField(field) {
    var value = (field.el.value || "").trim();
    if (!value) {
      showError(field, "Please enter " + field.label + ".");
      return false;
    }
    if (field.kind === "email" && !EMAIL_RE.test(value)) {
      showError(field, "Please enter a valid email address.");
      return false;
    }
    clearError(field);
    return true;
  }

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.className = "form-status" + (kind ? " form-status--" + kind : "");
    statusEl.textContent = message;
  }

  fields.forEach(function (field) {
    field.el.addEventListener("blur", function () {
      validateField(field);
    });
    field.el.addEventListener("input", function () {
      if (field.el.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field.el;
    });

    if (firstInvalid) {
      setStatus("Please fix the highlighted fields and try again.", "error");
      firstInvalid.focus();
      return;
    }

    var graceful = "Thanks — this form isn't fully wired up to a mailbox yet. Please try again a little later.";

    if (form.dataset.netlify !== "true") {
      setStatus(graceful, "notice");
      return;
    }

    setStatus("Sending your note…", "notice");

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function (res) {
        if (res.ok) {
          setStatus("Thanks — your note is on its way. We'll be in touch soon.", "success");
          form.reset();
          fields.forEach(clearError);
        } else {
          setStatus(graceful, "notice");
        }
      })
      .catch(function () {
        setStatus(graceful, "notice");
      });
  });
})();
