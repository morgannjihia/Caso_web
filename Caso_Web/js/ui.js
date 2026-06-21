// ============================================
// Shared UI: mobile nav, active link, scroll reveals
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => links.classList.remove("open"));
    });
  }

  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === page) {
      link.classList.add("nav-active");
      link.setAttribute("aria-current", "page");
    }
  });

  const revealTargets = document.querySelectorAll(
    ".card, .section-head, .zone-card, .zones-toolbar, .home-stats, .zone-chips"
  );
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealTargets.forEach((el) => el.classList.add("visible"));
    return;
  }

  revealTargets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((el) => observer.observe(el));
});
