// Vantriel — ambient scroll environment, sticky showcase, and early-access form

(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- scroll progress: drives the ambient parallax, the rail, and the
         per-section relight. One continuous state, so sections blend rather
         than swap. ---- */
  var railFill = document.getElementById("railFill");
  var railItems = document.querySelectorAll(".scroll-rail li");
  var sectionIds = ["hero", "system", "collection", "why", "pricing", "notify"];
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var scrolled = root.scrollTop || document.body.scrollTop;
      var max = root.scrollHeight - root.clientHeight;
      var progress = max > 0 ? scrolled / max : 0;

      root.style.setProperty("--sp", progress.toFixed(4));
      if (railFill) railFill.style.height = (progress * 100).toFixed(2) + "%";

      var current = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top < window.innerHeight * 0.5) {
          current = sections[i];
        }
      }
      if (current && root.dataset.section !== current.id) {
        root.dataset.section = current.id;
      }
      railItems.forEach(function (li) {
        li.classList.toggle("active", li.getAttribute("data-target") === (current && current.id));
      });

      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  railItems.forEach(function (li) {
    li.addEventListener("click", function () {
      var target = document.getElementById(li.getAttribute("data-target"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---- collection: sticky product cross-fade driven by the scrolling copy ---- */
  var steps = document.querySelectorAll(".showcase-step");
  var showcaseImgs = document.querySelectorAll(".showcase-img");
  var showcaseGlow = document.getElementById("showcaseGlow");
  var glowColors = [
    "rgba(124,196,216,0.42)", // cleanser — slate
    "rgba(230,176,106,0.42)", // moisturizer — bronze
    "rgba(143,202,166,0.42)", // spf — moss
  ];

  function setShowcase(index) {
    steps.forEach(function (step) {
      step.classList.toggle("is-active", Number(step.dataset.index) === index);
    });
    showcaseImgs.forEach(function (img) {
      img.classList.toggle("is-active", Number(img.dataset.index) === index);
    });
    if (showcaseGlow) {
      showcaseGlow.style.setProperty("--glow-color", glowColors[index] || glowColors[0]);
    }
  }

  if (steps.length && "IntersectionObserver" in window) {
    var stepObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setShowcase(Number(entry.target.dataset.index));
          }
        });
      },
      // a band across the middle of the viewport: whichever step sits there wins
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    steps.forEach(function (step) { stepObserver.observe(step); });
    setShowcase(0);
  } else {
    steps.forEach(function (step) { step.classList.add("is-active"); });
  }

  /* ---- hero: product leans toward the cursor ---- */
  var heroStage = document.getElementById("heroStage");
  var heroProduct = document.getElementById("heroProduct");

  if (heroStage && heroProduct && !prefersReducedMotion) {
    heroStage.addEventListener("mousemove", function (e) {
      var rect = heroStage.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      heroProduct.style.transform =
        "rotateY(" + (x * 14).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg)";
      heroProduct.style.animationPlayState = "paused";
    });
    heroStage.addEventListener("mouseleave", function () {
      heroProduct.style.transform = "";
      heroProduct.style.animationPlayState = "";
    });
  }

  /* ---- stat counters ---- */
  var statEls = document.querySelectorAll(".stat-num[data-count]");
  if (statEls.length && "IntersectionObserver" in window) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          statObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach(function (el) { statObserver.observe(el); });
  }

  function countUp(el) {
    var target = Number(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    if (prefersReducedMotion || target === 0) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1100;
    var start = performance.now();
    function frame(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
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
