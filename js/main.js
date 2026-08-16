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

  /* ---- scroll progress rail ---- */
  var railFill = document.getElementById("railFill");
  var railItems = document.querySelectorAll(".scroll-rail li");
  var sectionIds = ["hero", "system", "collection", "why", "pricing", "notify"];
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function updateRail() {
    var doc = document.documentElement;
    var scrolled = doc.scrollTop;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (scrolled / max) * 100 : 0;
    if (railFill) railFill.style.height = pct + "%";

    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top < window.innerHeight * 0.5) {
        current = sections[i];
      }
    }
    railItems.forEach(function (li) {
      li.classList.toggle("active", li.getAttribute("data-target") === current.id);
    });
  }

  if (railFill) {
    window.addEventListener("scroll", updateRail, { passive: true });
    window.addEventListener("resize", updateRail);
    updateRail();
  }

  railItems.forEach(function (li) {
    li.addEventListener("click", function () {
      var target = document.getElementById(li.getAttribute("data-target"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---- product card 3D tilt ---- */
  var tiltCards = document.querySelectorAll(".product-card");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    tiltCards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "rotateY(" + (x * 10) + "deg) rotateX(" + (-y * 10) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
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
