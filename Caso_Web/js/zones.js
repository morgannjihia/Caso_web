// ============================================
// Zones page: search, filter, expand/collapse, deep links
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const cards = [...document.querySelectorAll(".zone-card")];
  const searchInput = document.getElementById("zone-search");
  const filterBtns = [...document.querySelectorAll(".zone-filters .chip[data-zone]")];
  const institutionCountEl = document.getElementById("institution-count");
  const zoneCountEl = document.getElementById("zone-count");
  const emptyEl = document.getElementById("zones-empty");
  const expandAllBtn = document.getElementById("expand-all");
  const collapseAllBtn = document.getElementById("collapse-all");

  if (!cards.length) return;

  let activeZone = "all";
  const totalInstitutions = cards.reduce(
    (sum, card) => sum + card.querySelectorAll("li").length,
    0
  );

  cards.forEach((card) => {
    const count = card.querySelectorAll("li").length;
    const meta = card.querySelector(".zone-meta");
    if (meta) {
      meta.textContent = `${count} institution${count === 1 ? "" : "s"}`;
    }
  });

  function setActiveFilter(zone) {
    activeZone = zone;
    filterBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.zone === zone);
    });
  }

  function updateUrl() {
    const url = new URL(location.href);
    const q = searchInput?.value.trim();
    if (activeZone === "all") url.searchParams.delete("zone");
    else url.searchParams.set("zone", activeZone);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }

  function applyFilters() {
    const q = searchInput?.value.trim().toLowerCase() || "";
    let visibleInstitutions = 0;
    let visibleZones = 0;

    cards.forEach((card) => {
      const zoneAllowed = activeZone === "all" || card.dataset.zone === activeZone;
      const items = [...card.querySelectorAll("li")];
      let matchesInZone = 0;

      items.forEach((li) => {
        const textMatch = !q || li.textContent.toLowerCase().includes(q);
        const show = zoneAllowed && textMatch;
        li.hidden = !show;
        li.classList.toggle("match", show && q.length > 0);
        if (show) matchesInZone++;
      });

      const cardVisible = zoneAllowed && (matchesInZone > 0 || !q);
      card.hidden = !cardVisible;
      if (q && cardVisible && matchesInZone > 0) card.open = true;

      if (cardVisible) {
        visibleZones++;
        visibleInstitutions += matchesInZone;
      }
    });

    if (institutionCountEl) institutionCountEl.textContent = visibleInstitutions;
    if (zoneCountEl) zoneCountEl.textContent = visibleZones;
    if (emptyEl) {
      emptyEl.hidden = visibleInstitutions > 0 || (!q && activeZone === "all");
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveFilter(btn.dataset.zone);
      applyFilters();
      updateUrl();
    });
  });

  searchInput?.addEventListener("input", () => {
    applyFilters();
    updateUrl();
  });

  // ── Accordion: only one zone open at a time ──
  let accordionLocked = false;
  cards.forEach((card) => {
    card.addEventListener("toggle", () => {
      if (accordionLocked) return;
      if (card.open) {
        cards.forEach((other) => {
          if (other !== card && other.open) other.open = false;
        });
      }
    });
  });

  expandAllBtn?.addEventListener("click", () => {
    accordionLocked = true;
    cards.forEach((card) => {
      if (!card.hidden) card.open = true;
    });
    accordionLocked = false;
  });

  collapseAllBtn?.addEventListener("click", () => {
    accordionLocked = true;
    cards.forEach((card) => {
      card.open = false;
    });
    accordionLocked = false;
  });

  const params = new URLSearchParams(location.search);
  const zoneParam = params.get("zone");
  const qParam = params.get("q");

  if (zoneParam && cards.some((c) => c.dataset.zone === zoneParam)) {
    setActiveFilter(zoneParam);
    const target = document.getElementById(`${zoneParam}-zone`);
    if (target) target.open = true;
  }

  if (qParam && searchInput) searchInput.value = qParam;

  if (institutionCountEl && !zoneParam && !qParam) {
    institutionCountEl.textContent = totalInstitutions;
  }
  if (zoneCountEl && !zoneParam && !qParam) {
    zoneCountEl.textContent = cards.length;
  }

  applyFilters();
});
