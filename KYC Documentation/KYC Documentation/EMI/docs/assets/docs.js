(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];

  const pages = $$("article[data-page]").map((el) => ({
    id: el.dataset.page,
    title: el.dataset.title,
    brief: el.dataset.brief || "",
    group: el.dataset.group || "",
    el,
  }));
  const byId = Object.fromEntries(pages.map((p) => [p.id, p]));
  const order = pages.map((p) => p.id);

  function currentId() {
    const hash = (location.hash || "#start").replace(/^#\/?/, "").split("?")[0];
    return byId[hash] ? hash : "start";
  }

  function setActiveNav(id) {
    $$(".nav a[data-page]").forEach((a) => {
      a.classList.toggle("active", a.dataset.page === id);
    });
    const link = $(`.nav a[data-page="${id}"]`);
    const group = link && link.closest(".children");
    if (group) {
      const btn = group.previousElementSibling;
      if (btn && btn.classList.contains("group")) btn.classList.add("open");
    }
  }

  function buildToc(article) {
    const toc = $("#toc-list");
    toc.innerHTML = "";
    $$("h2, h3", article).forEach((h, i) => {
      if (!h.id) h.id = (h.textContent || "s")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + (i ? "-" + i : "");
      const a = document.createElement("a");
      a.href = `#${currentId()}`;
      a.dataset.anchor = h.id;
      a.className = h.tagName === "H3" ? "h3" : "h2";
      a.textContent = h.textContent;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById(h.id).scrollIntoView({ behavior: "smooth", block: "start" });
      });
      toc.appendChild(a);
    });
  }

  function pager(id) {
    const i = order.indexOf(id);
    const box = $(".pager");
    const prev = i > 0 ? byId[order[i - 1]] : null;
    const next = i < order.length - 1 ? byId[order[i + 1]] : null;
    box.classList.toggle("single", !(prev && next));
    box.innerHTML = "";
    if (prev) {
      box.innerHTML += `<a href="#${prev.id}"><p class="dir">Previous</p><strong>${prev.title}</strong></a>`;
    }
    if (next) {
      box.innerHTML += `<a href="#${next.id}"><p class="dir">Next</p><strong>${next.title}</strong></a>`;
    }
  }

  function show(id) {
    const page = byId[id] || byId.start;
    pages.forEach((p) => {
      p.el.hidden = p.id !== page.id;
    });
    document.title = page.title + " · EMI KYC";
    const titleEl = document.getElementById("page-title");
    const briefEl = document.getElementById("page-brief");
    if (titleEl) titleEl.textContent = page.title;
    if (briefEl) briefEl.textContent = page.brief;
    setActiveNav(page.id);
    buildToc(page.el);
    pager(page.id);
    window.scrollTo(0, 0);
    $(".sidebar").classList.remove("open");
    history.replaceState(null, "", "#" + page.id);
  }

  function copyMarkdown() {
    const page = byId[currentId()];
    const title = `# ${page.title}\n\n${page.brief}\n\n`;
    const body = page.el.innerText.replace(/\n{3,}/g, "\n\n");
    navigator.clipboard.writeText(title + body).then(() => {
      const btn = $("[data-copy]");
      const old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => (btn.textContent = old), 1200);
    });
  }

  function openSearch() {
    $(".overlay").classList.add("open");
    const input = $("#q");
    input.value = "";
    renderHits("");
    input.focus();
  }
  function closeSearch() {
    $(".overlay").classList.remove("open");
  }
  function renderHits(q) {
    const needle = q.trim().toLowerCase();
    const hits = pages.filter((p) => {
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.brief.toLowerCase().includes(needle) ||
        p.el.innerText.toLowerCase().includes(needle)
      );
    });
    const box = $(".search-hits");
    box.innerHTML = hits
      .slice(0, 12)
      .map(
        (p, i) =>
          `<a href="#${p.id}" class="${i === 0 ? "active" : ""}" data-hit="${p.id}"><strong>${p.title}</strong><small>${p.brief}</small></a>`
      )
      .join("") || `<p style="padding:12px 16px;color:var(--muted)">No matches.</p>`;
    $$("[data-hit]", box).forEach((a) =>
      a.addEventListener("click", () => closeSearch())
    );
  }

  $$(".nav button.group").forEach((btn) => {
    btn.addEventListener("click", () => btn.classList.toggle("open"));
  });

  $("[data-copy]").addEventListener("click", copyMarkdown);
  $("[data-search]").addEventListener("click", openSearch);
  $("#open-search").addEventListener("click", openSearch);
  $("[data-menu]").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
  $(".overlay").addEventListener("click", (e) => {
    if (e.target === $(".overlay")) closeSearch();
  });
  $("#q").addEventListener("input", (e) => renderHits(e.target.value));
  $("#q").addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearch();
    if (e.key === "Enter") {
      const first = $("[data-hit]");
      if (first) {
        location.hash = first.dataset.hit;
        closeSearch();
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") closeSearch();
  });

  window.addEventListener("hashchange", () => show(currentId()));
  show(currentId());
})();
