// Neon Empire — shared page behavior
// [NE] Ticking sync clock in the empire status panel (home page only).
(function () {
  var el = document.getElementById("sync-clock");
  if (!el) return;
  var parts = el.textContent.trim().split(":").map(Number);
  var seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  function pad(n) {
    return String(n).padStart(2, "0");
  }
  setInterval(function () {
    seconds++;
    el.textContent =
      pad(Math.floor(seconds / 3600)) +
      ":" +
      pad(Math.floor((seconds % 3600) / 60)) +
      ":" +
      pad(seconds % 60);
  }, 1000);
})();

// [NE] Feature accordions: one item open at a time, optional linked image swap.
(function () {
  document.querySelectorAll("[data-accordion]").forEach(function (list) {
    var img = document.querySelector(list.dataset.accordionImg || "");
    list.querySelectorAll(".acc-item").forEach(function (item) {
      item.addEventListener("click", function () {
        list.querySelectorAll(".acc-item").forEach(function (other) {
          other.classList.toggle("open", other === item);
        });
        if (img && item.dataset.img) img.src = item.dataset.img;
      });
    });
  });
})();

// [NE] Home-page parallax: the hero backdrop drifts slower than the scroll;
// section imagery gets a subtle counter-drift based on viewport position.
(function () {
  var hero = document.querySelector(".hero .hero-bg");
  if (!hero) return; // home page only
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var items = document.querySelectorAll(".section .frame-img, .section .card-img");
  var ticking = false;

  function apply() {
    ticking = false;
    // Backdrop moves at ~20% of scroll speed; capped by the 25% oversize slack.
    var drift = Math.min(window.scrollY * 0.2, hero.parentElement.getBoundingClientRect().height * 0.24);
    hero.style.transform = "translateY(" + drift + "px)";
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var centerOffset = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = "translateY(" + centerOffset * -0.09 + "px)";
    });
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(apply);
    }
  }, { passive: true });
  apply();
})();

// [NE] District rail: clicking a card selects it (cyan); hover glow is CSS-only.
(function () {
  var rail = document.querySelector(".district-rail");
  if (!rail) return;
  var cards = rail.querySelectorAll(".district-card");
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      cards.forEach(function (other) {
        other.classList.toggle("active", other === card);
      });
    });
  });
})();

// [NE] Empire status boot sequence: fires once when the panel is in view.
// CSS drives the panel/map/bar animations; this handles the number count-ups
// and starts everything at the right moment.
(function () {
  var panel = document.querySelector(".empire-panel");
  if (!panel) return;
  // html.anim is only set when JS runs and motion is allowed — if it's absent
  // the panel is already in its final state, so leave it alone.
  if (!document.documentElement.classList.contains("anim")) return;

  var counts = panel.querySelectorAll(".count");
  // Bar delays in CSS: 0.60 / 0.73 / 0.86 / 0.99s. Numbers ride alongside.
  var startDelays = [600, 730, 860, 990];
  var DURATION = 1000;

  function decimals(el) {
    return parseInt(el.dataset.dec || "0", 10);
  }

  function settle(el) {
    el.textContent = parseFloat(el.dataset.to).toFixed(decimals(el));
  }

  // Digits churn at random ("decoding"), then lock: the value counts up with a
  // jitter that decays to zero, so it settles rather than snapping.
  function scrambleText(to, dec) {
    var intDigits = String(Math.floor(Math.abs(to))).length;
    var min = Math.pow(10, intDigits - 1);
    var span = Math.pow(10, intDigits) - min;
    return (min + Math.random() * span).toFixed(dec);
  }

  function countUp(el, delay) {
    var to = parseFloat(el.dataset.to);
    var dec = decimals(el);
    var done = false;
    var SCRAMBLE = 380;
    var COUNT = 640;

    function finish() {
      if (done) return;
      done = true;
      el.classList.remove("scrambling");
      settle(el);
    }

    setTimeout(function () {
      if (done) return;
      el.classList.add("scrambling");
      var churn = setInterval(function () {
        if (done) return clearInterval(churn);
        el.textContent = scrambleText(to, dec);
      }, 45);

      setTimeout(function () {
        clearInterval(churn);
        if (done) return;
        el.classList.remove("scrambling");
        var t0 = null;
        function step(t) {
          if (done) return;
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / COUNT, 1);
          // easeOutQuint base, with jitter that fades out as it locks on
          var base = to * (1 - Math.pow(1 - p, 5));
          var jitter = Math.pow(1 - p, 2) * (Math.random() - 0.5) * to * 0.5;
          el.textContent = Math.max(0, base + jitter).toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
          else finish();
        }
        requestAnimationFrame(step);
      }, SCRAMBLE);
    }, delay);

    // rAF is suspended in background tabs, which would strand the number
    // mid-scramble. Guarantee the final value lands regardless.
    setTimeout(finish, delay + SCRAMBLE + COUNT + 250);
  }

  function boot() {
    panel.classList.add("boot");
    counts.forEach(function (el, i) {
      countUp(el, startDelays[i] || 600);
    });
  }

  // Zero the numbers immediately so they never flash their final value.
  counts.forEach(function (el) {
    el.textContent = (0).toFixed(decimals(el));
  });

  // Hold the sequence until the tab is actually visible, so a page opened in a
  // background tab still plays its boot when the user switches to it.
  function whenVisible(run) {
    if (!document.hidden) return run();
    var fired = false;
    function go() {
      if (fired) return;
      fired = true;
      run();
    }
    document.addEventListener("visibilitychange", function onVis() {
      if (!document.hidden) {
        document.removeEventListener("visibilitychange", onVis);
        go();
      }
    });
    // Some embedded contexts (preview panes, webviews) report hidden
    // indefinitely — never leave the panel stranded at opacity 0.
    setTimeout(go, 1500);
  }

  if (!("IntersectionObserver" in window)) return whenVisible(boot);
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        io.disconnect();
        whenVisible(boot);
      }
    });
  }, { threshold: 0.2 });
  io.observe(panel);
})();
