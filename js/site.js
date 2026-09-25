(function () {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function list(items, ordered) {
    if (!items?.length) return "";
    const tag = ordered ? "ol" : "ul";
    return `<${tag} class="detail-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</${tag}>`;
  }

  function flowHtml(steps, title) {
    if (!steps?.length) return "";
    const cards = steps
      .map((s, i) => {
        const kind = `k-${s.kind || "process"}`;
        const arrow =
          i < steps.length - 1 ? `<div class="flow-arrow" aria-hidden="true">→</div>` : "";
        return `<div class="flow-item">
          <div class="flow-card ${kind}">
            <div class="fl">${esc(s.label)}</div>
            <div class="fn">${esc(s.note || "")}</div>
          </div>
          ${arrow}
        </div>`;
      })
      .join("");
    return `<div class="flow-board">
      ${title ? `<div class="flow-title">${esc(title)}</div>` : ""}
      <div class="flow-row">${cards}</div>
    </div>`;
  }

  function flowStagesHtml(stages) {
    if (!stages?.length) return "";
    return `<div class="flow-stages">
      <div class="flow-title" style="margin-bottom:0.75rem">Journey flow (map + EMI documentation)</div>
      ${stages
        .map(
          (st) => `
        <div class="flow-stage">
          <div class="flow-stage-head">
            <span class="flow-stage-num">${esc(st.stage || "")}</span>
            <strong>${esc(st.title)}</strong>
          </div>
          ${flowHtml(st.steps, "")}
          ${
            st.branches?.length
              ? `<div class="flow-branches">${st.branches
                  .map(
                    (b) =>
                      `<a class="pill amber" href="#${esc(b.to)}" data-page="${esc(b.to)}">${esc(b.label)}</a>`
                  )
                  .join("")}</div>`
              : ""
          }
        </div>`
        )
        .join("")}
    </div>`;
  }

  function journeyById(id) {
    return KYC_DATA.journeys.find((j) => j.id === id);
  }

  function pageOrder() {
    const pages = [];
    for (const g of KYC_DATA.nav) {
      for (const it of g.items) pages.push(it.page);
    }
    return pages;
  }

  function buildSidebar() {
    const host = $("#nav-root");
    host.innerHTML = KYC_DATA.nav
      .map((g) => {
        const items = g.items
          .map((it) => {
            const depth = it.depth === 2 ? "depth-2" : "";
            const label =
              it.depth === 2
                ? `<span class="jid">${esc(it.page)}</span> ${esc(it.label)}`
                : esc(it.label);
            return `<a href="#${esc(it.page)}" class="${depth}" data-page="${esc(it.page)}">${label}</a>`;
          })
          .join("");
        return `<div class="nav-group${g.open === false ? " collapsed" : ""}" data-group="${esc(g.id)}">
          <button type="button" class="nav-group-toggle" data-toggle-group="${esc(g.id)}">
            <span>${esc(g.label)}</span><span class="chev">▾</span>
          </button>
          <div class="nav-items">${items}</div>
        </div>`;
      })
      .join("");
  }

  function renderSpine() {
    const host = $("#spine-detail");
    if (!host) return;
    const flow = flowHtml(KYC_DATA.spineFlow, "Picture of the whole spine (left → right)");
    const steps = KYC_DATA.spine
      .map(
        (s) => `
      <article class="step-block${s.trap ? " trap-step" : ""}" id="spine-${esc(s.step)}">
        <h3><span class="step-num">Step ${esc(s.step)}</span>${esc(s.phase)}</h3>
        <p class="prose"><strong>In simple words:</strong> ${esc(s.simple || s.what)}</p>
        <p class="prose"><strong>A bit more detail:</strong> ${esc(s.detail)}</p>
        <p class="prose"><strong>Rule to remember:</strong> ${esc(s.rule)}</p>
      </article>`
      )
      .join("");
    host.innerHTML = flow + steps;
  }

  function renderLadder() {
    const host = $("#ladder-cards");
    if (!host) return;
    const intro = flowHtml(KYC_DATA.ladderFlow, "Try A first. Only go down if A is truly impossible.");
    const cards = KYC_DATA.ladder
      .map(
        (r) => `
      <article class="journey-card" id="rung-${esc(r.rung)}" style="border-left-color:${esc(r.color)}">
        <h3>Option ${esc(r.rung)} · ${esc(r.title)}</h3>
        <div class="eli5" style="margin-top:0.5rem">
          <p><strong>When:</strong> ${esc(r.when)}</p>
          <p class="analogy"><strong>Why:</strong> ${esc(r.why)}</p>
        </div>
        <p class="prose"><strong>What is required:</strong> ${esc(r.needs)}</p>
        <p class="prose"><strong>What you get:</strong> ${esc(r.outcome)}</p>
      </article>`
      )
      .join("");
    host.innerHTML = intro + cards;
  }

  function renderJourneyIndex() {
    const host = $("#journeys-index");
    if (!host) return;
    const groups = {};
    for (const j of KYC_DATA.journeys) (groups[j.group] ||= []).push(j);
    let html = flowHtml(KYC_DATA.bigPictureFlow, "Big picture: how a new wallet is born");
    for (const [group, listJ] of Object.entries(groups)) {
      html += `<h2>${esc(group)}</h2>`;
      html += listJ
        .map(
          (j) => `
        <article class="journey-card" style="border-left-color:${esc(j.color)}">
          <h3>${esc(j.id)} · ${esc(j.title)}</h3>
          <div class="meta">
            <a class="pill green" href="#${esc(j.id)}" data-page="${esc(j.id)}">Read in plain English →</a>
            <a class="pill violet" href="#workflows" data-open-wf="${esc(j.id)}">Interactive diagram →</a>
          </div>
          <p class="prose">${esc(j.plain || j.summary)}</p>
        </article>`
        )
        .join("");
    }
    host.innerHTML = html;
  }

  function renderJourneyPage(j) {
    const compliance = j.compliance
      ? `<div class="compliance-panel">
          <h2>Rules &amp; compliance</h2>
          <p class="prose muted-lead">${esc(j.compliance.headline || "What this journey must obey")}</p>
          <div class="detail-grid">
            <div class="detail-box full">
              <h4>Must follow (non‑negotiable)</h4>
              ${list(j.compliance.mustFollow, true)}
            </div>
            <div class="detail-box">
              <h4>Rule books / instruments</h4>
              ${list(j.compliance.instruments, false)}
            </div>
            <div class="detail-box">
              <h4>Fail closed</h4>
              ${list(j.compliance.failClosed, false)}
            </div>
            <div class="detail-box full">
              <h4>What an auditor should be able to see</h4>
              ${list(j.compliance.auditMusts, false)}
            </div>
          </div>
          <p class="prose muted-lead" style="margin-top:0.35rem">
            Broader picture: <a href="#audit" data-page="audit">SBP audit readiness</a>
            · <a href="#regulatory" data-page="regulatory">Regulatory foundations</a>
          </p>
        </div>`
      : j.rules || j.regulatory?.length
        ? `<div class="compliance-panel">
            <h2>Rules &amp; compliance</h2>
            ${j.rules ? `<p class="prose"><strong>Rules:</strong> ${esc(j.rules)}</p>` : ""}
            ${list(j.regulatory, false)}
          </div>`
        : "";

    const remember = j.remember?.length
      ? `<div class="remember-box"><h4>Remember these points</h4>${list(j.remember, false)}</div>`
      : "";

    const facts =
      j.entersAt || j.actors || j.rules || j.timeLimits || j.openQuestion
        ? `<div class="journey-facts">
            ${j.entersAt ? `<div><strong>Enters at</strong><span>${esc(j.entersAt)}</span></div>` : ""}
            ${j.actors ? `<div><strong>Actors</strong><span>${esc(j.actors)}</span></div>` : ""}
            ${j.timeLimits ? `<div><strong>Time / limits</strong><span>${esc(j.timeLimits)}</span></div>` : ""}
            ${
              j.openQuestion
                ? `<div class="open-q"><strong>Open question</strong><span>${esc(j.openQuestion)}</span></div>`
                : ""
            }
          </div>`
        : "";

    const story = j.story
      ? `<div class="journey-story"><h3>What this journey is</h3><p>${esc(j.story)}</p></div>`
      : "";

    const diagram = j.diagram
      ? `<figure class="journey-diagram">
          <figcaption>${esc(j.diagram.caption || "Reference flow diagram")}</figcaption>
          <img src="${esc(j.diagram.src)}" alt="${esc(j.diagram.alt || j.title)}" loading="lazy" />
        </figure>`
      : "";

    const flowBlock = j.flowStages?.length
      ? flowStagesHtml(j.flowStages)
      : flowHtml(j.flow, `${j.id} flow (follow the arrows)`);

    return `
      <p class="eyebrow">${esc(j.group)}</p>
      <h1>${esc(j.id)} · ${esc(j.title)}</h1>

      <div class="eli5">
        <h3>In plain English</h3>
        <p>${esc(j.plain || j.summary)}</p>
        ${j.analogy ? `<p class="analogy"><strong>Simple analogy:</strong> ${esc(j.analogy)}</p>` : ""}
      </div>

      ${story}
      ${diagram}
      ${flowBlock}
      ${compliance}
      ${remember}
      ${facts}

      <div class="meta">
        <span class="pill amber">Starts when: ${esc(j.trigger)}</span>
        <span class="pill green">Ends with: ${esc(j.outcome)}</span>
        <a class="pill violet" href="#workflows" data-open-wf="${esc(j.id)}">Interactive diagram →</a>
      </div>

      <h2>Customer</h2>
      <p class="prose muted-lead">What the customer does and sees</p>
      ${list(j.customerSteps, true)}

      <h2>Operations</h2>
      <p class="prose muted-lead">What staff must check</p>
      ${list(j.opsControls, false)}

      <h2>System</h2>
      <p class="prose muted-lead">What the software must enforce</p>
      ${list(j.systemInvariants, false)}

      <details style="margin:1rem 0;color:#93a0b8">
        <summary style="cursor:pointer;color:#7dd3fc">More detail (why it exists &amp; connections)</summary>
        ${j.whyItExists ? `<p class="prose">${esc(j.whyItExists)}</p>` : ""}
        ${j.rules ? `<h3>Rules (short reference)</h3><p class="prose">${esc(j.rules)}</p>` : ""}
        <h3>Connections</h3>
        ${list(j.connects, false)}
      </details>
    `;
  }

  function ensureJourneyPages() {
    const main = $("#dynamic-pages");
    main.innerHTML = KYC_DATA.journeys
      .map(
        (j) =>
          `<section class="page" id="page-${esc(j.id)}" style="--acc:${esc(j.color)}">${renderJourneyPage(j)}</section>`
      )
      .join("");
  }

  function renderStates() {
    $("#states-table").innerHTML = KYC_DATA.states
      .map((s) => `<tr><td><code>${esc(s.code)}</code></td><td>${esc(s.meaning)}</td></tr>`)
      .join("");
  }

  function renderLimits() {
    $("#limits-table").innerHTML = KYC_DATA.limits
      .map(
        (r) => `<tr>
        <td><strong>${esc(r.band)}</strong></td>
        <td>${esc(r.load)}</td>
        <td>${esc(r.cash)}</td>
        <td>${esc(r.notes)}</td>
      </tr>`
      )
      .join("");
    $("#exclusions-list").innerHTML = KYC_DATA.exclusions14vi.map((x) => `<li>${esc(x)}</li>`).join("");
  }

  function renderAnnexure() {
    const aj = KYC_DATA.annexureJ;
    $("#annexure-salaried").innerHTML = aj.salaried.map((x) => `<li>${esc(x)}</li>`).join("");
    $("#annexure-nonsal").innerHTML = aj.nonSalaried.map((x) => `<li>${esc(x)}</li>`).join("");
    $("#annexure-alt").innerHTML = aj.alternate.map((x) => `<li>${esc(x)}</li>`).join("");
  }

  function renderGlossary() {
    const root = $("#glossary-root");
    if (!root) return;
    const items = KYC_DATA.glossary || [];
    const cats = KYC_DATA.glossaryCategories || [...new Set(items.map((g) => g.category))];
    const filter = $("#glossary-filter");
    if (filter && filter.options.length <= 1) {
      cats.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        filter.appendChild(opt);
      });
    }

    const paint = () => {
      const q = ($("#glossary-search")?.value || "").trim().toLowerCase();
      const cat = $("#glossary-filter")?.value || "";
      const filtered = items.filter((g) => {
        if (cat && g.category !== cat) return false;
        if (!q) return true;
        const blob = `${g.term} ${g.plain} ${g.detail || ""} ${g.alsoCalled || ""} ${g.seeAlso || ""} ${g.journey || ""}`.toLowerCase();
        return blob.includes(q);
      });
      const count = $("#glossary-count");
      if (count) count.textContent = `Showing ${filtered.length} of ${items.length} terms.`;

      const byCat = {};
      for (const g of filtered) (byCat[g.category || "Other"] ||= []).push(g);

      root.innerHTML = Object.keys(byCat)
        .map((category) => {
          const rows = byCat[category]
            .map(
              (g) => `
            <tr>
              <td><strong>${esc(g.term)}</strong>
                ${g.alsoCalled ? `<div style="color:#93a0b8;font-size:0.78rem;margin-top:0.25rem">Also called: ${esc(g.alsoCalled)}</div>` : ""}
                ${g.journey ? `<div style="margin-top:0.3rem"><span class="pill blue">${esc(g.journey)}</span></div>` : ""}
              </td>
              <td>${esc(g.plain)}</td>
              <td>${esc(g.detail || g.sys || "")}
                ${g.seeAlso ? `<div style="color:#7dd3fc;font-size:0.8rem;margin-top:0.35rem">See also: ${esc(g.seeAlso)}</div>` : ""}
              </td>
            </tr>`
            )
            .join("");
          return `
            <h2 id="vocab-${esc(category).replace(/\s+/g, "-").toLowerCase()}">${esc(category)}</h2>
            <div class="table-wrap">
              <table>
                <thead><tr><th style="width:22%">Term</th><th style="width:32%">Plain English</th><th>More detail</th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`;
        })
        .join("") || `<p class="prose">No terms match your search.</p>`;
    };

    $("#glossary-search")?.removeEventListener("input", window.__glossPaint);
    $("#glossary-filter")?.removeEventListener("change", window.__glossPaint);
    window.__glossPaint = paint;
    $("#glossary-search")?.addEventListener("input", paint);
    $("#glossary-filter")?.addEventListener("change", paint);
    paint();
  }

  function fillWorkflowSelect() {
    const sel = $("#wf-select");
    sel.innerHTML = Object.keys(KYC_WORKFLOWS)
      .map((k) => `<option value="${esc(k)}">${esc(KYC_WORKFLOWS[k].label)}</option>`)
      .join("");
  }

  function renderWorkflow(id) {
    const wf = KYC_WORKFLOWS[id] || KYC_WORKFLOWS.overview;
    const summary = $("#wf-summary");
    if (summary) summary.textContent = "";

    const legend = `
      <div class="wf-legend" aria-label="Colour meaning">
        <span><i class="lg start"></i> Start</span>
        <span><i class="lg process"></i> Action</span>
        <span><i class="lg decision"></i> Decision</span>
        <span><i class="lg db"></i> Saved state</span>
        <span><i class="lg pending"></i> Wait / hold</span>
        <span><i class="lg danger"></i> Stop / reject</span>
        <span><i class="lg end"></i> Success end</span>
      </div>`;

    const plain = `
      <div class="eli5 wf-plain">
        <h3>In plain English</h3>
        <p>${esc(wf.plain || wf.summary || "")}</p>
        <div class="wf-meta-row">
          ${wf.when ? `<div><strong>When it starts</strong><span>${esc(wf.when)}</span></div>` : ""}
          ${wf.outcome ? `<div><strong>What you end with</strong><span>${esc(wf.outcome)}</span></div>` : ""}
        </div>
      </div>`;

    const tip = wf.tip
      ? `<div class="remember-box"><h4>Remember</h4><p class="prose" style="margin:0">${esc(wf.tip)}</p></div>`
      : "";

    const flow = flowHtml(wf.steps || [], "Follow the arrows left → right");

    const forks =
      wf.forks?.length > 0
        ? `<div class="wf-forks">
            <h3>If something branches</h3>
            <div class="wf-fork-grid">
              ${wf.forks
                .map(
                  (f) => `
                <div class="wf-fork-card">
                  <div class="wf-fork-if">If: ${esc(f.if)}</div>
                  <div class="wf-fork-then">Then: ${esc(f.then)}</div>
                </div>`
                )
                .join("")}
            </div>
          </div>`
        : "";

    const walk =
      wf.walkthrough?.length > 0
        ? `<div class="wf-walk">
            <h3>Step-by-step story</h3>
            <ol class="wf-story">
              ${wf.walkthrough
                .map(
                  (w) => `
                <li>
                  <div class="wf-story-n">${esc(w.n)}</div>
                  <div>
                    <strong>${esc(w.title)}</strong>
                    <p>${esc(w.text)}</p>
                  </div>
                </li>`
                )
                .join("")}
            </ol>
          </div>`
        : "";

    const related =
      wf.related && (journeyById(wf.related) || wf.related === "spine")
        ? `<p class="wf-related">
            ${
              wf.related === "spine"
                ? `<a href="#spine" data-page="spine">Read the full spine in plain English →</a>`
                : `<a href="#${esc(wf.related)}" data-page="${esc(wf.related)}">Read ${esc(wf.related)} journey page →</a>`
            }
          </p>`
        : "";

    $("#wf-canvas").innerHTML = plain + legend + flow + forks + tip + walk + related;
  }

  function renderFooterNav(pageId) {
    const order = pageOrder();
    const idx = order.indexOf(pageId);
    const prev = idx > 0 ? order[idx - 1] : null;
    const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
    const label = (id) => {
      for (const g of KYC_DATA.nav) {
        const it = g.items.find((x) => x.page === id);
        if (it) return it.depth === 2 ? `${it.page} · ${it.label}` : it.label;
      }
      return id;
    };
    const host = $("#page-footer-nav");
    if (!host) return;
    host.innerHTML = `
      ${prev ? `<a href="#${esc(prev)}" data-page="${esc(prev)}"><small>Previous</small><strong>${esc(label(prev))}</strong></a>` : "<span></span>"}
      ${next ? `<a class="next" href="#${esc(next)}" data-page="${esc(next)}"><small>Next</small><strong>${esc(label(next))}</strong></a>` : ""}
    `;
  }

  function closeMobileNav() {
    $("#sidebar")?.classList.remove("open");
    $("#backdrop")?.classList.remove("show");
  }

  function showPage(id) {
    if (!$(`#page-${id}`) && !journeyById(id)) id = "overview";
    // journey pages are dynamic
    if (journeyById(id) && !$(`#page-${id}`)) ensureJourneyPages();

    $$(".page").forEach((p) => p.classList.toggle("active", p.id === `page-${id}`));
    $$(".nav-items a[data-page]").forEach((a) => a.classList.toggle("active", a.dataset.page === id));

    // auto-expand group containing active link
    const activeLink = $(`.nav-items a[data-page="${id}"]`);
    if (activeLink) {
      const group = activeLink.closest(".nav-group");
      group?.classList.remove("collapsed");
    }

    history.replaceState(null, "", `#${id}`);
    renderFooterNav(id);
    closeMobileNav();
    window.scrollTo(0, 0);

    if (id === "workflows") renderWorkflow($("#wf-select")?.value || "overview");
    runMermaid();
  }

  function runMermaid() {
    if (typeof mermaid === "undefined") return;
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        flowchart: { useMaxWidth: true, htmlLabels: true },
      });
      const nodes = $$("pre.mermaid").filter((el) => !el.getAttribute("data-processed"));
      if (nodes.length) mermaid.run({ nodes });
    } catch (err) {
      console.warn("mermaid render skipped", err);
    }
  }

  function initNav() {
    document.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-toggle-group]");
      if (toggle) {
        e.preventDefault();
        const g = $(`.nav-group[data-group="${toggle.getAttribute("data-toggle-group")}"]`);
        g?.classList.toggle("collapsed");
        return;
      }

      const pageLink = e.target.closest("[data-page]");
      if (pageLink) {
        e.preventDefault();
        showPage(pageLink.dataset.page);
        return;
      }

      const wfLink = e.target.closest("[data-open-wf]");
      if (wfLink) {
        e.preventDefault();
        const jid = wfLink.getAttribute("data-open-wf");
        showPage("workflows");
        if (KYC_WORKFLOWS[jid]) {
          $("#wf-select").value = jid;
          renderWorkflow(jid);
        }
      }
    });

    $("#nav-search")?.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      $$(".nav-items a").forEach((a) => {
        const show = !q || a.textContent.toLowerCase().includes(q);
        a.style.display = show ? "" : "none";
        if (show && q) a.closest(".nav-group")?.classList.remove("collapsed");
      });
    });

    $("#menuBtn")?.addEventListener("click", () => {
      $("#sidebar").classList.add("open");
      $("#backdrop").classList.add("show");
    });
    $("#backdrop")?.addEventListener("click", closeMobileNav);

    window.addEventListener("hashchange", () => {
      const id = location.hash.replace("#", "") || "overview";
      if ($(`#page-${id}`) || journeyById(id)) showPage(id);
    });
  }

  function initWorkflows() {
    fillWorkflowSelect();
    $("#wf-select")?.addEventListener("change", () => renderWorkflow($("#wf-select").value));
    $("#wf-play")?.addEventListener("click", () => renderWorkflow($("#wf-select").value));
  }

  function boot() {
    buildSidebar();
    ensureJourneyPages();
    const overviewFlow = $("#overview-flow");
    if (overviewFlow) overviewFlow.innerHTML = flowHtml(KYC_DATA.bigPictureFlow, "Opening a wallet — at a glance");
    const activationFlow = $("#activation-flow");
    if (activationFlow) activationFlow.innerHTML = flowHtml(KYC_DATA.activationFlow, "Activation flow");
    const auditFlow = $("#audit-story-flow");
    if (auditFlow) {
      auditFlow.innerHTML = flowHtml(
        KYC_DATA.auditStoryFlow || [
          { label: "Tracking ID", note: "Case file opens", kind: "db" },
          { label: "Evidence", note: "ID · photo · consent", kind: "process" },
          { label: "Sanctions", note: "Lists clear or stop", kind: "decision" },
          { label: "Risk", note: "Low/Med or EDD", kind: "decision" },
          { label: "Prove ID", note: "BV or Verisys", kind: "process" },
          { label: "Cool 2 hours", note: "No spend yet", kind: "pending" },
          { label: "Wallet number", note: "Late · auditable", kind: "end" },
        ],
        "The story auditors must be able to replay"
      );
    }
    renderSpine();
    renderLadder();
    renderJourneyIndex();
    renderStates();
    renderLimits();
    renderAnnexure();
    renderGlossary();
    initNav();
    initWorkflows();
    const hash = location.hash.replace("#", "") || "overview";
    showPage($(`#page-${hash}`) || journeyById(hash) ? hash : "overview");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
