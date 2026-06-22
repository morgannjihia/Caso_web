// ============================================
// Shared UI — nav, scroll reveals, counters,
// progress bar, back-to-top, ripple, parallax
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  // ── Reading progress bar ──────────────────
  const progressBar = document.createElement("div");
  progressBar.id = "reading-progress";
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = docHeight > 0 ? (scrollTop / docHeight * 100) + "%" : "0%";
  }

  // ── Back-to-top button ────────────────────
  const backBtn = document.createElement("button");
  backBtn.id = "back-to-top";
  backBtn.setAttribute("aria-label", "Back to top");
  backBtn.innerHTML = "↑";
  document.body.appendChild(backBtn);
  backBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  function updateBackBtn() {
    backBtn.classList.toggle("visible", window.scrollY > 400);
  }

  // ── Scroll handler ────────────────────────
  window.addEventListener("scroll", () => {
    updateProgress();
    updateBackBtn();
    if (heroEl) parallaxHero();
  }, { passive: true });

  updateProgress();
  updateBackBtn();

  // ── Mobile nav (smooth slide) ─────────────
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }

  // ── Active nav link ───────────────────────
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === page) {
      link.classList.add("nav-active");
      link.setAttribute("aria-current", "page");
    }
  });

  // ── Reduced-motion gate ───────────────────
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Button ripple ─────────────────────────
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (reducedMotion) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const wave = document.createElement("span");
      wave.className = "ripple-wave";
      wave.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
      btn.appendChild(wave);
      wave.addEventListener("animationend", () => wave.remove());
    });
  });

  // ── Hero parallax (subtle) ────────────────
  const heroEl = document.querySelector(".hero");
  function parallaxHero() {
    if (!heroEl || reducedMotion) return;
    const offset = Math.min(window.scrollY * 0.25, 80);
    heroEl.style.transform = `translateY(${offset}px)`;
  }

  // ── Animated counters ─────────────────────
  function animateCounter(el, target, suffix, duration) {
    const start = performance.now();
    const isDecimal = String(target).includes(".");
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = eased * target;
      el.textContent = isDecimal
        ? value.toFixed(1) + suffix
        : Math.floor(value) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── Scroll reveal + stagger ───────────────
  const revealSelectors = [
    ".card", ".section-head", ".zone-card",
    ".zones-toolbar", ".home-stats", ".zone-chips",
    ".form-card", ".leader-card", ".evang-card"
  ];

  if (reducedMotion) {
    document.querySelectorAll(revealSelectors.join(",")).forEach((el) => {
      el.classList.add("visible");
    });
    // Still run counters
    document.querySelectorAll("[data-count]").forEach((el) => {
      const { target, suffix } = el.dataset;
      el.textContent = target + (suffix || "");
    });
    return;
  }

  // Stagger cards inside a grid
  document.querySelectorAll(".grid-3, .zone-grid, .grid-2").forEach((grid) => {
    grid.querySelectorAll(".card, .zone-card, .leader-card, .evang-card").forEach((card, i) => {
      card.classList.add("reveal", `reveal-delay-${Math.min(i + 1, 6)}`);
    });
  });

  // Section heads from left, standalone cards from bottom
  document.querySelectorAll(".section-head").forEach((el) => el.classList.add("reveal-left"));
  document.querySelectorAll(".zones-toolbar, .form-card").forEach((el) => el.classList.add("reveal-scale"));
  document.querySelectorAll(".home-stats, .zone-chips").forEach((el) => el.classList.add("reveal"));

  // Cards not inside grids
  document.querySelectorAll(".card:not(.grid-3 .card):not(.grid-2 .card)").forEach((el) => {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
  });

  const allReveal = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("visible");
        observer.unobserve(el);

        // Animated counter trigger
        el.querySelectorAll("[data-count]").forEach((counter) => {
          const target = parseFloat(counter.dataset.count);
          const suffix = counter.dataset.suffix || "";
          animateCounter(counter, target, suffix, 1400);
        });

        // If the element itself is a counter parent
        if (el.dataset && el.dataset.count) {
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          animateCounter(el, target, suffix, 1400);
        }
      });
    },
    { threshold: 0.12 }
  );

  allReveal.forEach((el) => observer.observe(el));

  // ── Counter elements (home-stats strong tags) ──
  document.querySelectorAll(".home-stats strong").forEach((el) => {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)(\+?)$/);
    if (!match) return;
    const target = parseInt(match[1]);
    const suffix = match[2] || "";
    el.textContent = "0" + suffix;
    el.dataset.count = target;
    el.dataset.suffix = suffix;

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(el, target, suffix, 1200);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counterObserver.observe(el);
  });

});
