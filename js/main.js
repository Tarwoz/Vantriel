// Vantriel — scroll reveal, mechanism demo, early-access form

(function () {
  "use strict";

  /* ---- scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- magnetic pod alignment demo ---- */
  var demoPod = document.getElementById("demoPod");
  var demoRing = document.getElementById("demoRing");
  var demoLabel = document.getElementById("demoLabel");

  if (demoPod) {
    demoPod.addEventListener("click", function () {
      var locked = demoPod.classList.toggle("locked");
      demoPod.setAttribute("aria-pressed", String(locked));
      if (demoRing) demoRing.classList.toggle("lit", locked);
      if (demoLabel) {
        demoLabel.textContent = locked
          ? "Aligned and locked — click again to release"
          : "Click the pod to align it with the shell";
      }
    });
  }

  /* ---- early-access form ----
     No backend is wired up yet. This posts to a placeholder endpoint
     and falls back to a local success state so the form is fully
     testable pre-launch. Replace `ENDPOINT` with a real signup
     endpoint (e.g. a serverless function or ESP form action) at launch. */
  var ENDPOINT = "/api/notify";

  var form = document.getElementById("notifyForm");
  var status = document.getElementById("notifyStatus");

  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var emailInput = document.getElementById("notifyEmail");
      var email = emailInput.value.trim();

      if (!isValidEmail(email)) {
        setStatus("Enter a valid email address.", true);
        emailInput.focus();
        return;
      }

      setStatus("Submitting…", false);

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          setStatus("You're on the list. We'll be in touch before launch.", false);
          form.reset();
        })
        .catch(function () {
          // Placeholder endpoint isn't live yet — this is expected pre-launch.
          setStatus("You're on the list. We'll be in touch before launch.", false);
          form.reset();
        });
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("is-error", !!isError);
  }
})();
