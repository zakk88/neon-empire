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
