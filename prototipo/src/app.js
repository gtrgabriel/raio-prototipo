/* raio — protótipo do agente de compras (corte vertical do PRD v0.5) */
(() => {
  "use strict";

  // ---------- Formatação ----------
  const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const brl = (v) => BRL.format(v);
  const pct = (v) => (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
  const num = (v) => v.toLocaleString("pt-BR");
  const dDate = (iso) => new Date(iso.length === 10 ? iso + "T12:00:00-03:00" : iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  const dTime = (iso) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const round2 = (v) => Math.round(v * 100) / 100;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const $ = (sel, el = document) => el.querySelector(sel);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? Math.min(ms, 60) : ms));

  // PRNG determinístico para variar ofertas a cada rodada
  const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const rand = (seed) => { let t = (seed += 0x6d2b79f5); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // ---------- Ícones ----------
  const ICON = {
    inicio: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    avisos: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    itens: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    whatsapp: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    painel: '<path d="M4 20V11M10 20V5M16 20v-6M2 20h20"/>',
    plano: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
    ajustes: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.8-4M4 4v4h4M4 13a8 8 0 0 0 14.8 4M20 20v-4h-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  };
  const icon = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

  // ---------- Estado ----------
  const KEY = "raio-prototipo-v1";
  const SEED_NOW = "2026-11-18T09:12:00-03:00";
  let S;

  function seed() {
    const s = {
      v: 1,
      role: "comprador",
      priority: "preco",
      run: 0,
      balance: DATA.plans[0].tokens,
      tokensUsed: 0,
      extraBought: 0,
      phone: DATA.people.comprador.phone,
      items: DATA.items.map((i) => ({ ...i, offers: i.offers.map(([store, f, days]) => ({ store, f, days })), source: "Cadastro manual" })),
      purchases: DATA.purchases.map((p) => ({ ...p })),
      alerts: [],
      messages: [],
      events: [],
      dataPoints: 0,
      seq: 0,
    };
    S = s;
    log("2026-11-03T14:30:00-03:00", "comprador", "cadastro", `Cadastrou ${s.items.length} itens com o último preço pago (cadastro manual)`);
    s.dataPoints += s.items.length;
    s.purchases.forEach((p) => {
      const it = item(p.itemId);
      log(p.date, "comprador", "compra", `Registrou compra de ${it.name}: ${brl(p.paid)} (antes ${brl(p.before)})`);
      s.dataPoints += 1;
    });
    runComparison(SEED_NOW);
    // Um aviso já desbloqueado, para o painel ter histórico
    const a = s.alerts.find((x) => x.itemId === "papel");
    if (a) unlock(a.id, "2026-11-18T09:30:00-03:00");
    s.unread = s.alerts.filter((x) => x.status === "novo").length;
    return s;
  }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* armazenamento indisponível: segue em memória */ } }
  function load() { try { const v = JSON.parse(localStorage.getItem(KEY)); return v && v.v === 1 ? v : null; } catch (e) { return null; } }

  const item = (id) => S.items.find((i) => i.id === id);
  const person = (role) => DATA.people[role];
  const nextId = (p) => `${p}${++S.seq}`;
  function log(at, actor, type, text) { S.events.unshift({ at, actor, type, text }); }

  // ---------- Regras de negócio ----------
  function offersFor(it, run = S.run) {
    return it.offers.map((o) => {
      const noise = (rand(hash(`${run}|${it.id}|${o.store}`)) - 0.5) * 0.016;
      const price = round2(it.ref * o.f * (1 + noise));
      return { store: o.store, storeName: DATA.stores[o.store] || o.store, price, days: o.days, red: (it.last - price) / it.last };
    });
  }

  // RF-12: só avisa com redução acima de 1% contra o último preço pago.
  // RF-23: se a prioridade for prazo, o prazo é o diferencial (sem pagar mais que o último preço).
  function evaluate(it, offers = offersFor(it)) {
    if (S.priority === "prazo") {
      const ranked = [...offers].sort((a, b) => a.days - b.days || a.price - b.price);
      const eligible = ranked.filter((o) => o.price <= it.last);
      const best = eligible[0] || null;
      const faster = best && best.days < it.lastDays;
      const ok = !!best && (faster || best.red > DATA.threshold);
      return { ranked, best, ok, reason: faster ? "prazo" : "preco" };
    }
    const ranked = [...offers].sort((a, b) => a.price - b.price || a.days - b.days);
    const best = ranked[0];
    return { ranked, best, ok: best.red > DATA.threshold, reason: "preco" };
  }

  function runComparison(at = new Date().toISOString()) {
    S.run += 1;
    let created = 0;
    S.items.forEach((it) => {
      const ev = evaluate(it);
      if (!ev.ok) return;
      const open = S.alerts.find((a) => a.itemId === it.id && (a.status === "novo" || a.status === "desbloqueado"));
      if (open) {
        const better = ev.best.price < open.offer.price - 0.005 || (S.priority === "prazo" && ev.best.days < open.offer.days);
        if (!better) return;
        open.status = "substituido";
      }
      const a = {
        id: nextId("a"), itemId: it.id, at, run: S.run, status: "novo", reason: ev.reason, priority: S.priority,
        lastPrice: it.last, lastDays: it.lastDays, offer: { ...ev.best }, compared: ev.ranked.length,
      };
      S.alerts.unshift(a);
      created += 1;
      const saving = (a.lastPrice - a.offer.price) * it.qty;
      const head = a.reason === "prazo"
        ? `Entrega mais rápida: ${it.name} em ${a.offer.days} ${a.offer.days === 1 ? "dia" : "dias"} (hoje ${a.lastDays}) por ${brl(a.offer.price)}.`
        : `Valor melhor: ${it.name} de ${brl(a.lastPrice)} por ${brl(a.offer.price)} (−${pct(a.offer.red)}).`;
      S.messages.push({
        id: nextId("m"), alertId: a.id, at,
        text: `${head} ${saving > 0 ? `Economia estimada de ${brl(saving)} no volume do mês. ` : ""}Para ver o link da oferta, desbloqueie no raio (${DATA.unlockCost} tokens).`,
      });
      log(at, "sistema", "aviso", `Aviso de ${a.reason === "prazo" ? "prazo melhor" : "valor melhor"} para ${it.name} (${a.offer.storeName}, ${brl(a.offer.price)})`);
      log(at, "sistema", "whatsapp", `WhatsApp enviado para ${person("comprador").name} (envio simulado)`);
    });
    log(at, "sistema", "comparacao", `Comparação nº ${S.run}: ${S.items.length} itens, ${created} ${created === 1 ? "aviso novo" : "avisos novos"}`);
    return created;
  }

  function unlock(alertId, at = new Date().toISOString()) {
    const a = S.alerts.find((x) => x.id === alertId);
    if (!a || a.status !== "novo" || S.balance < DATA.unlockCost) return false;
    const it = item(a.itemId);
    S.balance -= DATA.unlockCost;
    S.tokensUsed += DATA.unlockCost;
    a.status = "desbloqueado";
    a.unlockedAt = at;
    a.link = `https://${slug(a.offer.storeName)}.exemplo/p/${slug(it.name)}`;
    log(at, S.role || "comprador", "desbloqueio", `Desbloqueou o link de ${it.name} (−${DATA.unlockCost} tokens)`);
    return true;
  }

  function registerPurchase(alertId, paid, qty, at = new Date().toISOString()) {
    const a = S.alerts.find((x) => x.id === alertId);
    const it = item(a.itemId);
    const best = evaluate(it).best;
    S.purchases.unshift({ itemId: it.id, before: it.last, paid, qty, best: !!best && paid <= best.price * (1 + DATA.threshold), date: at, alertId });
    log(at, S.role, "compra", `Registrou compra de ${it.name}: ${qty} × ${brl(paid)} (antes ${brl(it.last)})`);
    it.last = paid; it.lastDate = at.slice(0, 10); it.lastDays = a.offer.days; it.supplier = a.offer.storeName; it.source = "Registro após aviso";
    a.status = "comprado"; a.purchasedAt = at;
    S.dataPoints += 1;
  }

  // ---------- Métricas ----------
  function metrics() {
    const realized = S.purchases.reduce((t, p) => t + Math.max(0, p.before - p.paid) * p.qty, 0);
    const open = S.alerts.filter((a) => a.status === "novo" || a.status === "desbloqueado");
    const potential = open.reduce((t, a) => t + Math.max(0, a.lastPrice - a.offer.price) * item(a.itemId).qty, 0);
    const adherence = S.purchases.length ? S.purchases.filter((p) => p.best).length / S.purchases.length : 0;
    const sent = S.alerts.length;
    const unlocked = S.alerts.filter((a) => a.unlockedAt).length;
    const score = S.dataPoints * 10 + Math.floor(realized / 10);
    return { realized, potential, adherence, sent, unlocked, open, score };
  }

  // ---------- Roteamento ----------
  const ROUTES = {
    home: { label: "Agente de compras", lp: true },
    inicio: { label: "Início", render: () => (S.role === "gestor" ? viewPainel(true) : viewInicio()) },
    avisos: { label: "Avisos", render: viewAvisos },
    itens: { label: "Itens", render: viewItens },
    whatsapp: { label: "WhatsApp", render: viewWhatsapp },
    painel: { label: "Painel do gestor", render: () => viewPainel(false) },
    plano: { label: "Plano e tokens", render: viewPlano },
    ajustes: { label: "Ajustes", render: viewAjustes },
  };
  const route = () => { const h = location.hash.slice(1); return ROUTES[h] ? h : h ? "inicio" : "home"; };
  let filter = "abertos";
  let expanded = new Set();
  let flash = null;

  // ---------- Estado de motion ----------
  let prevRoute = null;
  let marks = {};            // { alertId: "just-unlocked" | "is-new" } — aplicadas uma vez no próximo render
  let busy = false;
  const memo = {};           // último valor exibido por contador, para animar de → para
  const FMT = {
    brl: (v) => brl(v), int: (v) => num(Math.round(v)), pct: (v) => `${Math.round(v)}%`, pts: (v) => `${num(Math.round(v))} pts`,
  };
  const cnt = (key, v, fmt) => `<strong data-key="${key}" data-count="${v}" data-fmt="${fmt}">${FMT[fmt](v)}</strong>`;

  function tweenNumber(el, from, to, fmt, ms) {
    if (reduced() || from === to) { el.textContent = FMT[fmt](to); return; }
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      el.textContent = FMT[fmt](from + (to - from) * e);
      if (p < 1 && el.isConnected) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function animateCounts(root, entering) {
    root.querySelectorAll("[data-count]").forEach((el) => {
      const to = +el.dataset.count, key = el.dataset.key;
      const from = entering ? 0 : (memo[key] ?? to);
      memo[key] = to;
      tweenNumber(el, from, to, el.dataset.fmt, entering ? 900 : 650);
    });
  }
  function moveNavIndicator(instant) {
    const nav = $("#nav"), ind = $(".nav-ind"), on = $("#nav a.on");
    if (!ind) return;
    if (!on) { ind.style.width = "0px"; return; }
    nav.classList.add("has-ind");
    const n = nav.getBoundingClientRect(), a = on.getBoundingClientRect();
    ind.classList.toggle("no-anim", !!instant || reduced());
    ind.style.transform = `translate(${a.left - n.left + nav.scrollLeft}px, ${a.top - n.top + nav.scrollTop}px)`;
    ind.style.width = `${a.width}px`;
    ind.style.height = `${a.height}px`;
  }
  function stagger(main) {
    [...main.children].forEach((c, i) => c.style.setProperty("--i", i));
    main.querySelectorAll(".kpis, .alerts, tbody, .phone-body, .plans, .audit").forEach((g) =>
      [...g.children].forEach((c, i) => c.style.setProperty("--k", Math.min(i, 12))));
    main.classList.remove("is-entering");
    void main.offsetWidth;
    main.classList.add("is-entering");
    clearTimeout(stagger.t);
    stagger.t = setTimeout(() => main.classList.remove("is-entering"), 1400);
  }
  function setBalance() {
    const el = $("#balance"), pill = $(".token-pill");
    const prev = memo.balance ?? S.balance;
    memo.balance = S.balance;
    tweenNumber(el, prev, S.balance, "int", 700);
    if (prev !== S.balance && !reduced()) {
      pill.classList.remove("bump-up", "bump-down"); void pill.offsetWidth;
      pill.classList.add(S.balance > prev ? "bump-up" : "bump-down");
      setTimeout(() => pill.classList.remove("bump-up", "bump-down"), 700);
    }
  }
  function floatGain(text, anchor) {
    if (reduced()) return;
    const r = (anchor || $(".token-pill")).getBoundingClientRect();
    const f = document.createElement("span");
    f.className = "gain-float"; f.textContent = text;
    f.style.left = `${r.left + r.width / 2}px`; f.style.top = `${r.top}px`;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1400);
  }

  function renderLanding() {
    const lp = $("#lp"), app = $(".app");
    app.hidden = true; lp.hidden = false;
    lp.innerHTML = window.RaioLP.html({ DATA, brl, pct, icon });
    window.RaioLP.mount(lp, { DATA, brl, pct, icon });
    document.title = "raio · Agente de compras";
  }

  function render() {
    const r = route();
    const entering = r !== prevRoute;
    if (ROUTES[r].lp) { if (entering) { window.scrollTo(0, 0); renderLanding(); } prevRoute = r; return; }
    const lp = $("#lp"), app = $(".app");
    if (!lp.hidden) {
      window.RaioLP.unmount(); lp.hidden = true; lp.innerHTML = ""; app.hidden = false;
      if (!reduced()) { app.classList.remove("app-enter"); void app.offsetWidth; app.classList.add("app-enter"); }
    }
    app.hidden = false;
    if (r === "whatsapp") S.unread = 0;
    $("#nav-links").innerHTML = Object.entries(ROUTES).filter(([, v]) => !v.lp).map(([k, v]) => {
      const badge = k === "avisos" ? metrics().open.filter((a) => a.status === "novo").length : k === "whatsapp" ? S.unread : 0;
      return `<a href="#${k}" class="${k === r ? "on" : ""}" ${k === r ? 'aria-current="page"' : ""}>${icon(k)}<span>${v.label}</span>${badge ? `<b class="count">${badge}</b>` : ""}</a>`;
    }).join("");
    const p = person(S.role);
    $("#who").innerHTML = `<span class="raio-avatar raio-avatar--sm ${S.role === "gestor" ? "raio-avatar--purple" : ""}">${p.initials}</span><span class="who-txt"><strong>${p.name}</strong><small>${p.role}</small></span>`;
    document.querySelectorAll("[data-role]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.role === S.role)));
    setBalance();
    const main = $("#view");
    main.innerHTML = ROUTES[r].render();
    document.title = `${ROUTES[r].label} · raio`;
    Object.entries(marks).forEach(([id, cls]) => { const el = document.getElementById(id); if (el) el.classList.add(cls); });
    marks = {};
    if (entering && !reduced()) stagger(main);
    animateCounts(main, entering);
    const chat = $(".phone-body"); if (chat) chat.scrollTop = chat.scrollHeight;
    const on = $("#nav a.on"), nav = $("#nav");
    if (on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2, behavior: reduced() || prevRoute === null ? "auto" : "smooth" });
    moveNavIndicator(prevRoute === null || ROUTES[prevRoute]?.lp);
    if (flash) { const el = document.getElementById(flash); if (el) { el.classList.add("flash"); el.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" }); } flash = null; }
    prevRoute = r;
    save();
  }
  window.addEventListener("resize", () => moveNavIndicator(true));
  document.addEventListener("scroll", (e) => { if (e.target && e.target.id === "nav") moveNavIndicator(true); }, true);

  // Compara com animação de "agente trabalhando" antes de mostrar o resultado
  async function runWithMotion(btn) {
    if (busy) return;
    busy = true;
    const main = $("#view");
    btn && btn.classList.add("is-busy");
    const stores = new Set(S.items.flatMap((i) => i.offers.map((o) => o.store))).size;
    const bar = document.createElement("div");
    bar.className = "scanbar"; bar.setAttribute("role", "status");
    bar.innerHTML = `<span>Comparando <b id="scan-n">0</b> de ${S.items.length} itens em ${stores} lojas</span><span class="scanbar-track"><span></span></span>`;
    const headEl = $(".page-head", main);
    headEl ? headEl.after(bar) : main.prepend(bar);
    document.body.classList.add("is-scanning");
    const n = $("#scan-n");
    for (let i = 1; i <= S.items.length; i++) { await wait(1100 / S.items.length); if (n) n.textContent = i; }
    await wait(120);
    const before = new Set(S.alerts.map((a) => a.id));
    const created = runComparison();
    S.unread += created;
    S.alerts.filter((a) => !before.has(a.id)).forEach((a) => (marks[a.id] = "is-new"));
    document.body.classList.remove("is-scanning");
    busy = false;
    render();
    toast(created ? `${created} ${created === 1 ? "aviso novo enviado" : "avisos novos enviados"} para ${person("comprador").name} no WhatsApp.` : "Comparação concluída. Nenhuma oferta passou de 1% abaixo do último preço pago.", created ? "gain" : "");
  }

  // Tira o card da lista com animação e só então re-renderiza
  function leaveThen(id, fn) {
    const el = document.getElementById(id);
    if (!el || reduced()) { fn(); return; }
    el.classList.add("is-leaving");
    setTimeout(fn, 360);
  }

  // ---------- Componentes de tela ----------
  const head = (title, sub, actions = "") => `
    <header class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${actions ? `<div class="page-actions">${actions}</div>` : ""}</header>`;
  const prioChip = () => `<span class="chip">${icon(S.priority === "prazo" ? "truck" : "painel", 14)} Prioridade: ${S.priority === "prazo" ? "prazo" : "preço"}</span>`;
  const statusBadge = (a) => ({
    novo: '<span class="raio-badge raio-badge--blue">Novo</span>',
    desbloqueado: '<span class="raio-badge raio-badge--lime">Link desbloqueado</span>',
    comprado: '<span class="raio-badge raio-badge--purple">Compra registrada</span>',
    ignorado: '<span class="raio-badge raio-badge--neutral">Ignorado</span>',
    substituido: '<span class="raio-badge raio-badge--neutral">Substituído</span>',
  }[a.status]);
  const redChip = (red) => red > DATA.threshold
    ? `<span class="delta good">−${pct(red)}</span>`
    : red > 0 ? `<span class="delta flat">−${pct(red)}</span>` : `<span class="delta flat">${red === 0 ? "0,0%" : "+" + pct(-red)}</span>`;
  const daysTxt = (d) => `${d} ${d === 1 ? "dia" : "dias"}`;

  function alertCard(a, compact = false) {
    const it = item(a.itemId);
    const saving = (a.lastPrice - a.offer.price) * it.qty;
    const ev = evaluate(it);
    const isOpen = expanded.has(a.id);
    let actions = "";
    if (a.status === "novo") {
      actions = `<button class="raio-btn raio-btn--cta raio-btn--sm" data-act="unlock" data-id="${a.id}">${icon("lock", 16)} Desbloquear link · ${DATA.unlockCost} tokens</button>
                 <button class="raio-btn raio-btn--ghost raio-btn--sm" data-act="ignore" data-id="${a.id}">Ignorar</button>`;
    } else if (a.status === "desbloqueado") {
      actions = `<div class="linkbox"><span class="linkbox-url" title="Link fictício">${esc(a.link)}</span><button class="iconbtn" data-act="copy" data-link="${esc(a.link)}" aria-label="Copiar link">${icon("copy", 16)}</button></div>
                 <button class="raio-btn raio-btn--cta raio-btn--sm" data-act="buy" data-id="${a.id}">${icon("check", 16)} Registrar compra</button>`;
    } else if (a.status === "comprado") {
      actions = `<span class="muted">Compra registrada em ${dTime(a.purchasedAt)}</span>`;
    }
    const reason = a.reason === "prazo"
      ? `<span class="chip chip--lime">${icon("truck", 14)} Entrega em ${daysTxt(a.offer.days)} (antes ${daysTxt(a.lastDays)})</span>`
      : `<span class="chip">${icon("truck", 14)} Entrega em ${daysTxt(a.offer.days)}</span>`;
    return `
      <article class="alert ${a.status}" id="${a.id}">
        <div class="alert-top">
          <div class="alert-title"><h3>${esc(it.name)}</h3><p>${esc(it.unit)} · ${esc(it.cat)}</p></div>
          ${statusBadge(a)}
        </div>
        <div class="prices">
          <div><small>Último preço pago</small><s>${brl(a.lastPrice)}</s></div>
          <span class="arrow" aria-hidden="true">→</span>
          <div><small>${a.status === "novo" ? "Oferta encontrada" : esc(a.offer.storeName)}</small><strong>${brl(a.offer.price)}</strong></div>
          ${redChip(a.offer.red)}
        </div>
        <div class="alert-meta">
          ${reason}
          ${saving > 0 ? `<span class="chip">Economia estimada: <b>${brl(saving)}</b>/mês (${it.qty} ${esc(it.unit)})</span>` : ""}
          ${a.status === "novo" ? `<span class="chip">${icon("lock", 14)} Loja e link ocultos até desbloquear</span>` : ""}
        </div>
        ${compact ? "" : `<div class="alert-actions">${actions}</div>`}
        ${compact ? "" : `<button class="linklike" data-act="expand" data-id="${a.id}" aria-expanded="${isOpen}">${isOpen ? "Ocultar" : "Ver"} comparação (${ev.ranked.length} ofertas)</button>`}
        ${isOpen && !compact ? compareTable(it, ev, a.status === "novo") : ""}
        <footer class="alert-foot">Aviso de ${dTime(a.at)} · WhatsApp enviado para ${esc(person("comprador").name)}</footer>
      </article>`;
  }

  function compareTable(it, ev, hideStores) {
    const rows = ev.ranked.map((o, i) => {
      const isBest = ev.best && o.store === ev.best.store;
      const name = hideStores && !isBest ? `Loja ${String.fromCharCode(65 + i)}` : hideStores ? "Melhor oferta (oculta)" : esc(o.storeName);
      return `<tr class="${isBest ? "best" : ""}"><td>${name}${isBest ? ' <span class="raio-badge raio-badge--lime mini">melhor</span>' : ""}</td><td class="n">${brl(o.price)}</td><td class="n">${daysTxt(o.days)}</td><td class="n">${redChip(o.red)}</td></tr>`;
    }).join("");
    return `<div class="tbl-wrap"><table class="tbl small"><thead><tr><th>Loja</th><th class="n">Preço</th><th class="n">Prazo</th><th class="n">vs. último pago</th></tr></thead><tbody>
      <tr class="ref"><td>Último preço pago (${esc(it.supplier)})</td><td class="n">${brl(it.last)}</td><td class="n">${daysTxt(it.lastDays)}</td><td class="n">—</td></tr>${rows}</tbody></table>
      <p class="hint">Regra: avisar só com redução acima de 1% contra o último preço pago${S.priority === "prazo" ? ", ou entrega mais rápida sem pagar mais que o último preço" : ""}.</p></div>`;
  }

  // ---------- Telas ----------
  function viewInicio() {
    const m = metrics();
    const novos = m.open.filter((a) => a.status === "novo");
    const comprador = person("comprador");
    return `
      ${head(`Olá, ${comprador.name.split(" ")[0]}`, `${DATA.company.name} · ${S.items.length} itens monitorados`, prioChip())}
      <section class="kpis">
        <a class="kpi kpi--link" href="#avisos"><small>Avisos novos</small>${cnt("c-novos", novos.length, "int")}<span>${novos.length ? "Aguardando sua decisão" : "Nenhum aviso pendente"}</span></a>
        <a class="kpi kpi--link" href="#plano"><small>Saldo de tokens</small>${cnt("c-saldo", S.balance, "int")}<span>${Math.floor(S.balance / DATA.unlockCost)} desbloqueios · plano Básico</span></a>
        <div class="kpi"><small>Economia que você gerou</small>${cnt("c-econ", m.realized, "brl")}<span>contra o último preço pago</span></div>
        <div class="kpi kpi--perf"><small>Seu desempenho <span class="tag-prop">proposta</span></small>${cnt("c-score", m.score, "pts")}<span>${S.dataPoints} dados trazidos × 10 + ${Math.floor(m.realized / 10)} pela economia</span></div>
      </section>
      <section class="block">
        <div class="block-head"><h2>Avisos para você</h2><a href="#avisos" class="linklike">Ver todos</a></div>
        ${novos.length ? `<div class="alerts">${novos.slice(0, 3).map((a) => alertCard(a)).join("")}</div>` : emptyState("Nenhum aviso novo", "Quando uma oferta ficar mais de 1% abaixo do último preço pago, ela aparece aqui e no seu WhatsApp.", `<button class="raio-btn raio-btn--primary raio-btn--sm" data-act="run">${icon("refresh", 16)} Rodar comparação</button>`)}
      </section>
      <section class="block">
        <div class="block-head"><h2>Mantenha os preços em dia</h2></div>
        <p class="lead">Sem ERP, o raio compara com o que você cadastra. Cada item novo ou preço atualizado soma pontos no seu desempenho.</p>
        <div class="row"><button class="raio-btn raio-btn--primary raio-btn--sm" data-act="new-item">${icon("plus", 16)} Cadastrar item</button><a class="raio-btn raio-btn--ghost raio-btn--sm" href="#itens">Revisar itens</a></div>
      </section>`;
  }

  function viewAvisos() {
    const groups = {
      abertos: S.alerts.filter((a) => a.status === "novo" || a.status === "desbloqueado"),
      comprados: S.alerts.filter((a) => a.status === "comprado"),
      todos: S.alerts,
    };
    const list = groups[filter];
    const tabs = [["abertos", "Abertos"], ["comprados", "Compras registradas"], ["todos", "Histórico"]].map(([k, l]) =>
      `<button class="seg-btn" data-act="filter" data-f="${k}" aria-pressed="${filter === k}">${l} <span>${groups[k].length}</span></button>`).join("");
    return `
      ${head("Avisos de valor melhor", "O agente só recomenda. A compra continua com você, fora do raio.",
        `${prioChip()}<button class="raio-btn raio-btn--primary raio-btn--sm" data-act="run">${icon("refresh", 16)} Rodar comparação</button>`)}
      <div class="seg" role="group" aria-label="Filtrar avisos">${tabs}</div>
      ${list.length ? `<div class="alerts">${list.map((a) => alertCard(a)).join("")}</div>`
        : emptyState(filter === "comprados" ? "Nenhuma compra registrada a partir de avisos" : "Nenhum aviso aberto", "Rode a comparação para buscar ofertas dos itens cadastrados.", "")}`;
  }

  function viewItens() {
    const rows = S.items.map((it) => {
      const ev = evaluate(it);
      const b = ev.best;
      return `<tr>
        <td class="wrap"><strong>${esc(it.name)}</strong><small>${num(it.qty)} × ${esc(it.unit)} por mês · ${esc(it.cat)}</small></td>
        <td class="n"><strong>${brl(it.last)}</strong><small>${dDate(it.lastDate)} · ${daysTxt(it.lastDays)}</small><small>${esc(it.source)}</small></td>
        <td class="n">${b ? `<strong>${brl(b.price)}</strong><small>${daysTxt(b.days)}</small>` : '<small>sem oferta elegível</small>'}</td>
        <td class="n">${b ? (ev.ok ? redChip(b.red) : `<span class="delta flat" title="Abaixo do limiar de 1%">${b.red > 0 ? "−" + pct(b.red) : "sem ganho"}</span>`) : "—"}</td>
        <td class="n"><button class="raio-btn raio-btn--ghost raio-btn--sm" data-act="edit-item" data-id="${it.id}">Editar</button></td>
      </tr>`;
    }).join("");
    return `
      ${head("Itens e último preço pago", "Base da comparação e da economia. No protótipo, os dados entram por cadastro manual.",
        `<button class="raio-btn raio-btn--primary raio-btn--sm" data-act="new-item">${icon("plus", 16)} Cadastrar item</button>`)}
      <div class="sources">
        <span class="source on">${icon("check", 14)} Cadastro manual</span>
        <span class="source off" title="Fora do recorte desta semana">Upload de NF em PDF · em breve</span>
        <span class="source off" title="Fora do recorte desta semana">ERP com API · em breve</span>
      </div>
      <div class="tbl-wrap panel"><table class="tbl"><thead><tr><th>Item</th><th class="n">Último preço pago</th><th class="n">Melhor oferta</th><th class="n">vs. último pago</th><th class="n"><span class="sr">Ações</span></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function viewWhatsapp() {
    const c = person("comprador");
    const msgs = S.messages.slice(-12).map((m) => {
      const a = S.alerts.find((x) => x.id === m.alertId);
      return `<div class="bubble"><p><b>⚡ raio</b></p><p>${esc(m.text)}</p>
        <button class="bubble-cta" data-act="goto-alert" data-id="${m.alertId}">${a && a.status === "novo" ? "Abrir e desbloquear" : "Abrir aviso"}</button>
        <time>${dTime(m.at)}</time></div>`;
    }).join("");
    return `
      ${head("Alertas no WhatsApp", "O aviso de valor melhor vai para o comprador. Nesta semana o envio é simulado.")}
      <div class="wa-grid">
        <div class="phone" aria-label="Prévia das mensagens enviadas">
          <div class="phone-bar"><span class="raio-avatar raio-avatar--sm raio-avatar--lime">⚡</span><div><strong>raio</strong><small>Mensagens para ${esc(c.name)}</small></div></div>
          <div class="phone-body">${msgs || '<p class="muted center">Nenhuma mensagem enviada ainda.</p>'}</div>
        </div>
        <div class="panel stack">
          <h2>Como o envio funciona</h2>
          <dl class="dl">
            <dt>Destinatário</dt><dd>${esc(c.name)}, ${esc(c.role.toLowerCase())}</dd>
            <dt>Número</dt><dd>${esc(S.phone)} <span class="tag-prop">fictício</span></dd>
            <dt>Provedor</dt><dd>A definir. No protótipo, o envio é simulado.</dd>
            <dt>Quando envia</dt><dd>Quando a comparação encontra redução acima de 1% contra o último preço pago${S.priority === "prazo" ? ", ou entrega mais rápida sem pagar mais" : ""}.</dd>
            <dt>O que vai na mensagem</dt><dd>Item, preços, economia estimada e o convite para desbloquear o link com ${DATA.unlockCost} tokens. A loja e o link não vão no WhatsApp.</dd>
          </dl>
          <button class="raio-btn raio-btn--primary raio-btn--sm" data-act="run">${icon("refresh", 16)} Rodar comparação e enviar</button>
        </div>
      </div>`;
  }

  function viewPainel(asHome) {
    const m = metrics();
    const byItem = S.items.map((it) => {
      const ps = S.purchases.filter((p) => p.itemId === it.id);
      const realized = ps.reduce((t, p) => t + Math.max(0, p.before - p.paid) * p.qty, 0);
      const ev = evaluate(it);
      return { it, realized, ev, ps };
    });
    const max = Math.max(1, ...byItem.map((r) => r.realized));
    const bars = byItem.filter((r) => r.realized > 0).sort((a, b) => b.realized - a.realized).map((r) =>
      `<div class="bar-row"><span class="bar-label">${esc(r.it.name)}</span><span class="bar-track"><span class="bar" style="width:${(r.realized / max) * 100}%"></span></span><span class="bar-val">${brl(r.realized)}</span></div>`).join("");
    const rows = byItem.map(({ it, ev, ps }) => {
      const last = ps[0];
      const cond = ev.best ? `<strong>${brl(ev.best.price)}</strong><small>${daysTxt(ev.best.days)} · ${esc(ev.best.storeName)}</small>` : "—";
      const status = !last ? '<span class="delta flat">sem compra registrada</span>'
        : last.best ? '<span class="delta good">na melhor condição</span>' : '<span class="delta warn">fora da melhor condição</span>';
      return `<tr><td class="wrap"><strong>${esc(it.name)}</strong><small>${esc(it.cat)}</small></td><td class="n">${brl(it.last)}</td><td class="n">${cond}</td><td>${status}</td></tr>`;
    }).join("");
    const events = S.events.slice(0, 10).map((e) =>
      `<li><time>${dTime(e.at)}</time><span class="ev-actor">${e.actor === "sistema" ? "Sistema" : esc(person(e.actor).name)}</span><span>${esc(e.text)}</span></li>`).join("");
    const g = person("gestor");
    return `
      ${head(asHome ? `Olá, ${g.name.split(" ")[0]}` : "Painel do gestor", "Economia contra o último preço pago, no ciclo de novembro de 2026.", prioChip())}
      <section class="kpis">
        <div class="kpi kpi--hero"><small>Economia realizada</small>${cnt("g-econ", m.realized, "brl")}<span>${S.purchases.length} compras registradas contra o último preço pago</span></div>
        <div class="kpi"><small>Economia em aberto</small>${cnt("g-aberto", m.potential, "brl")}<span>${m.open.length} avisos ainda sem compra (volume do mês)</span></div>
        <div class="kpi"><small>Compras na melhor condição</small>${cnt("g-ader", m.adherence * 100, "pct")}<span>${S.purchases.filter((p) => p.best).length} de ${S.purchases.length} compras registradas</span></div>
        <div class="kpi"><small>Tokens usados no ciclo</small>${cnt("g-tok", S.tokensUsed, "int")}<span>${m.unlocked} links desbloqueados · ${m.sent} avisos enviados</span></div>
      </section>
      <div class="grid-2">
        <section class="panel stack"><h2>Economia por item</h2>${bars || '<p class="muted">Nenhuma economia registrada ainda.</p>'}</section>
        <section class="panel stack"><h2>Desempenho do comprador <span class="tag-prop">proposta</span></h2>
          <div class="perf"><span class="raio-avatar raio-avatar--md">${person("comprador").initials}</span><div><strong>${esc(person("comprador").name)}</strong><small>${S.dataPoints} dados trazidos · ${brl(m.realized)} de economia</small></div><b class="perf-score">${num(m.score)} pts</b></div>
          <p class="hint">Indicador mínimo: sobe quando o comprador traz ou atualiza dados e quando há economia contra o último preço pago. A fórmula ainda precisa ser validada.</p>
        </section>
      </div>
      <section class="block"><div class="block-head"><h2>Melhor condição de preço e entrega</h2></div>
        <div class="tbl-wrap panel"><table class="tbl"><thead><tr><th>Item</th><th class="n">Último preço pago</th><th class="n">Melhor condição hoje</th><th>Última compra</th></tr></thead><tbody>${rows}</tbody></table></div>
      </section>
      <section class="block"><div class="block-head"><h2>Registro de auditoria</h2><span class="muted">últimos 10 eventos</span></div>
        <ul class="audit panel">${events}</ul>
      </section>`;
  }

  function viewPlano() {
    const pct_ = Math.min(100, (S.tokensUsed / (DATA.plans[0].tokens + S.extraBought * DATA.extraPack.tokens)) * 100);
    const cards = DATA.plans.map((p) => {
      const current = p.id === "basico";
      return `<article class="plan ${current ? "plan--current" : ""}">
        <div class="plan-top"><h3>${p.name}</h3>${current ? '<span class="raio-badge raio-badge--blue">Plano atual</span>' : '<span class="tag-prop">proposta a validar</span>'}</div>
        <p class="plan-price">${brl(p.price)}<small>/mês</small></p>
        <ul><li><b>${num(p.tokens)}</b> tokens no ciclo</li><li><b>${p.tokens / DATA.unlockCost}</b> desbloqueios de link</li><li>${brl(p.price / (p.tokens / DATA.unlockCost))} por desbloqueio</li></ul>
        ${current ? "" : `<button class="raio-btn raio-btn--ghost raio-btn--sm raio-btn--block" disabled>Disponível após validação</button>`}
      </article>`;
    }).join("");
    return `
      ${head("Plano e tokens", `Ciclo de ${dDate(DATA.cycle.start)} a ${dDate(DATA.cycle.end)}. Tokens do ciclo não acumulam para o mês seguinte (proposta).`)}
      <section class="panel balance">
        <div><small>Saldo atual</small>${cnt("p-saldo", S.balance, "int")}<span class="unit">tokens</span><span>${Math.floor(S.balance / DATA.unlockCost)} desbloqueios disponíveis · ${DATA.unlockCost} tokens por link (valor provisório)</span></div>
        <div class="meter" role="img" aria-label="${Math.round(pct_)}% dos tokens do ciclo usados"><span style="width:${pct_}%"></span></div>
        <div class="row"><button class="raio-btn raio-btn--accent raio-btn--sm" data-act="extra">${icon("plus", 16)} Comprar pacote extra · ${brl(DATA.extraPack.price)}</button><span class="muted">+${DATA.extraPack.tokens} tokens, válidos até o fim do ciclo</span></div>
      </section>
      <div class="plans">${cards}</div>
      <p class="hint">Só o preço do Básico (R$ 200) foi definido. Quantidades de tokens, Prata, Gold, pacote extra e expiração seguem a proposta do PRD v0.5 e ainda precisam ser validados.</p>`;
  }

  function viewAjustes() {
    const opt = (v, t, d) => `<label class="choice"><input type="radio" name="prio" id="prio-${v}" value="${v}" ${S.priority === v ? "checked" : ""}><span><strong>${t}</strong><small>${d}</small></span></label>`;
    return `
      ${head("Ajustes da empresa", `${DATA.company.name} · CNPJ ${DATA.company.cnpj} (fictício)`)}
      <div class="grid-2">
        <section class="panel stack"><h2>Prioridade das recomendações</h2>
          ${opt("preco", "Preço", "Avisa quando a oferta fica mais de 1% abaixo do último preço pago.")}
          ${opt("prazo", "Prazo", "O prazo é o diferencial: avisa a entrega mais rápida sem pagar mais que o último preço.")}
          <p class="hint">Limiar do aviso: redução acima de 1% contra o último preço pago (regra fixa do MVP).</p>
        </section>
        <section class="panel stack"><h2>WhatsApp do comprador</h2>
          <label class="raio-input" for="phone" style="width:100%"><span class="raio-input__label">Número que recebe os avisos</span><input id="phone" value="${esc(S.phone)}" inputmode="tel" autocomplete="off"></label>
          <button class="raio-btn raio-btn--primary raio-btn--sm" data-act="save-phone">Salvar número</button>
          <p class="hint">Envio simulado nesta semana. O provedor ainda será definido.</p>
        </section>
      </div>
      <section class="panel stack danger"><h2>Dados do protótipo</h2><p class="muted">Todos os dados são fictícios e ficam só neste navegador.</p>
        <div><button class="raio-btn raio-btn--outline raio-btn--sm" data-act="reset">Restaurar dados de exemplo</button></div></section>`;
  }

  const emptyState = (t, d, a) => `<div class="empty"><h3>${t}</h3><p>${d}</p>${a}</div>`;

  // ---------- Modal e toast ----------
  function openModal(title, body, onSubmit, submitLabel = "Confirmar") {
    const host = $("#modal");
    host.innerHTML = `<div class="overlay" data-act="close-modal"></div>
      <form class="raio-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" id="modal-form" novalidate>
        <div class="raio-modal__head"><span id="modal-title">${title}</span><button type="button" class="raio-modal__close" data-act="close-modal" aria-label="Fechar">✕</button></div>
        <div class="raio-modal__body">${body}
          <div class="modal-actions"><button type="button" class="raio-btn raio-btn--ghost" data-act="close-modal">Cancelar</button><button type="submit" class="raio-btn raio-btn--cta">${submitLabel}</button></div>
        </div></form>`;
    host.hidden = false;
    const form = $("#modal-form");
    form.addEventListener("submit", (e) => { e.preventDefault(); if (onSubmit(new FormData(form), form) !== false) closeModal(); });
    (form.querySelector("input,select") || form.querySelector("[type=submit]")).focus();
  }
  function closeModal(instant) {
    const h = $("#modal");
    if (h.hidden) return;
    const done = () => { h.hidden = true; h.innerHTML = ""; h.classList.remove("is-closing"); };
    if (instant || reduced()) { done(); return; }
    h.classList.add("is-closing");
    setTimeout(done, 180);
  }
  let toastT;
  function toast(msg, kind = "") {
    const t = $("#toast");
    t.textContent = msg;
    t.className = `toast${kind ? " toast--" + kind : ""}`;
    t.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("show")));
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.classList.remove("show"); toastT = setTimeout(() => (t.hidden = true), 300); }, 3400);
  }

  const field = (id, label, value, attrs = "") => `<label class="raio-input" for="${id}"><span class="raio-input__label">${label}</span><input id="${id}" name="${id}" value="${esc(value)}" ${attrs}></label>`;

  function itemForm(it) {
    const isNew = !it;
    it = it || { name: "", unit: "unidade", cat: DATA.categories[0], qty: 1, last: "", lastDate: new Date().toISOString().slice(0, 10), lastDays: 5, supplier: "" };
    const cats = DATA.categories.map((c) => `<option ${c === it.cat ? "selected" : ""}>${c}</option>`).join("");
    openModal(isNew ? "Cadastrar item" : "Editar item", `
      ${field("f-name", "Item", it.name, 'required placeholder="Ex.: Papel sulfite A4"')}
      <div class="form-2">
        <label class="raio-input raio-input--select" for="f-cat"><span class="raio-input__label">Categoria</span><select id="f-cat" name="f-cat">${cats}</select></label>
        ${field("f-unit", "Unidade", it.unit, "required")}
      </div>
      <div class="form-2">
        ${field("f-last", "Último preço pago (R$)", it.last === "" ? "" : String(it.last).replace(".", ","), 'required inputmode="decimal" placeholder="0,00"')}
        ${field("f-qty", "Quantidade por mês", it.qty, 'required inputmode="numeric"')}
      </div>
      <div class="form-2">
        ${field("f-date", "Data da última compra", it.lastDate, 'type="date" required')}
        ${field("f-days", "Prazo de entrega (dias)", it.lastDays, 'required inputmode="numeric"')}
      </div>
      ${field("f-supplier", "Onde comprou", it.supplier, 'placeholder="Ex.: loja física do bairro"')}
      <p class="form-error" id="f-error" hidden></p>`,
      (fd, form) => {
        const v = (k) => String(fd.get(k) || "").trim();
        const price = parseFloat(v("f-last").replace(/\./g, "").replace(",", "."));
        const qty = parseInt(v("f-qty"), 10), days = parseInt(v("f-days"), 10);
        const err = !v("f-name") ? "Informe o nome do item." : !(price > 0) ? "Informe o último preço pago, por exemplo 29,90." : !(qty > 0) ? "Informe a quantidade por mês." : !(days >= 0) ? "Informe o prazo de entrega em dias." : "";
        if (err) { const e = $("#f-error", form); e.textContent = err; e.hidden = false; return false; }
        const now = new Date().toISOString();
        if (isNew) {
          const id = nextId("i");
          const stores = Object.keys(DATA.stores);
          const h = hash(v("f-name"));
          const offers = [0, 1, 2].map((k) => ({ store: stores[(h + k * 2) % stores.length], f: round2(0.92 + rand(h + k) * 0.14), days: 1 + Math.floor(rand(h + 10 + k) * 7) }));
          S.items.push({ id, name: v("f-name"), unit: v("f-unit"), cat: v("f-cat"), qty, ref: price, last: price, lastDate: v("f-date"), lastDays: days, supplier: v("f-supplier") || "Não informado", source: "Cadastro manual", offers });
          log(now, S.role, "cadastro", `Cadastrou ${v("f-name")} a ${brl(price)} (cadastro manual)`);
          toast("Item cadastrado. +10 pts no desempenho.");
        } else {
          const changed = price !== it.last;
          Object.assign(it, { name: v("f-name"), unit: v("f-unit"), cat: v("f-cat"), qty, last: price, lastDate: v("f-date"), lastDays: days, supplier: v("f-supplier") || it.supplier, source: changed ? "Cadastro manual" : it.source });
          log(now, S.role, "atualizacao", `Atualizou ${it.name}${changed ? `: último preço pago ${brl(price)}` : ""}`);
          toast("Item atualizado. +10 pts no desempenho.");
        }
        S.dataPoints += 1;
        render();
      }, isNew ? "Cadastrar" : "Salvar");
  }

  // ---------- Ações ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act],[data-role]");
    if (!el) return;
    if (el.dataset.role) { S.role = el.dataset.role; toast(`Agora você vê o raio como ${person(S.role).name} (${person(S.role).role.toLowerCase()}).`); render(); return; }
    const id = el.dataset.id;
    switch (el.dataset.act) {
      case "run": runWithMotion(el); break;
      case "unlock": {
        const a = S.alerts.find((x) => x.id === id); const it = item(a.itemId);
        if (S.balance < DATA.unlockCost) {
          openModal("Saldo insuficiente", `<p>Você tem ${num(S.balance)} tokens e o desbloqueio custa ${DATA.unlockCost}.</p><p class="muted">Compre um pacote extra de ${DATA.extraPack.tokens} tokens por ${brl(DATA.extraPack.price)} para continuar.</p>`,
            () => { location.hash = "plano"; }, "Ver plano e tokens");
          break;
        }
        openModal("Desbloquear link da oferta", `
          <p><strong>${esc(it.name)}</strong> por <strong>${brl(a.offer.price)}</strong> (−${pct(a.offer.red)} contra o último preço pago).</p>
          <dl class="dl"><dt>Custo</dt><dd>${DATA.unlockCost} tokens <span class="tag-prop">valor provisório</span></dd><dt>Saldo depois</dt><dd>${num(S.balance - DATA.unlockCost)} tokens</dd></dl>
          <p class="hint">O raio mostra a loja e o link. A compra é feita por você, fora da plataforma.</p>`,
          () => { unlock(id); marks[id] = "just-unlocked"; render(); toast(`Link desbloqueado. −${DATA.unlockCost} tokens.`); }, `Desbloquear · ${DATA.unlockCost} tokens`);
        break;
      }
      case "ignore": { const a = S.alerts.find((x) => x.id === id); a.status = "ignorado"; log(new Date().toISOString(), S.role, "ignorar", `Ignorou o aviso de ${item(a.itemId).name}`); leaveThen(id, () => { render(); toast("Aviso ignorado."); }); break; }
      case "buy": {
        const a = S.alerts.find((x) => x.id === id); const it = item(a.itemId);
        openModal("Registrar compra", `
          <p class="muted">Registre o que foi comprado para medir a economia contra o último preço pago (${brl(it.last)}).</p>
          <div class="form-2">${field("b-price", "Preço pago (R$)", String(a.offer.price).replace(".", ","), 'inputmode="decimal" required')}${field("b-qty", `Quantidade (${it.unit})`, it.qty, 'inputmode="numeric" required')}</div>
          <p class="form-error" id="b-error" hidden></p>`,
          (fd, form) => {
            const price = parseFloat(String(fd.get("b-price")).replace(/\./g, "").replace(",", ".")); const qty = parseInt(fd.get("b-qty"), 10);
            if (!(price > 0) || !(qty > 0)) { const er = $("#b-error", form); er.textContent = "Informe preço e quantidade maiores que zero."; er.hidden = false; return false; }
            const saving = (it.last - price) * qty;
            const card = document.getElementById(id);
            registerPurchase(id, price, qty);
            if (saving > 0) floatGain(`+${brl(saving)}`, card && card.querySelector(".prices strong"));
            leaveThen(id, () => {
              render();
              toast(saving > 0 ? `Compra registrada. Economia de ${brl(saving)} contra o último preço pago.` : "Compra registrada.", saving > 0 ? "gain" : "");
            });
          }, "Registrar compra");
        break;
      }
      case "copy": {
        const link = el.dataset.link;
        const done = () => toast("Link copiado (link fictício do protótipo).");
        try { navigator.clipboard.writeText(link).then(done, () => toast(link)); } catch (_) { toast(link); }
        break;
      }
      case "expand": expanded.has(id) ? expanded.delete(id) : expanded.add(id); render(); break;
      case "filter": filter = el.dataset.f; render(); break;
      case "goto-alert": { const a = S.alerts.find((x) => x.id === id); filter = a && (a.status === "comprado") ? "comprados" : a && (a.status === "novo" || a.status === "desbloqueado") ? "abertos" : "todos"; flash = id; location.hash === "#avisos" ? render() : (location.hash = "avisos"); break; }
      case "new-item": itemForm(null); break;
      case "edit-item": itemForm(item(id)); break;
      case "extra":
        openModal("Comprar pacote extra", `<p>+${DATA.extraPack.tokens} tokens por <strong>${brl(DATA.extraPack.price)}</strong>, válidos até ${dDate(DATA.cycle.end)}.</p><p class="hint">Compra simulada. Nenhuma cobrança é feita no protótipo. Meio de pagamento a definir.</p>`,
          () => { S.balance += DATA.extraPack.tokens; S.extraBought += 1; log(new Date().toISOString(), S.role, "tokens", `Comprou pacote extra: +${DATA.extraPack.tokens} tokens (simulado)`); render(); floatGain(`+${DATA.extraPack.tokens} tokens`); toast(`+${DATA.extraPack.tokens} tokens adicionados.`, "gain"); }, `Comprar · ${brl(DATA.extraPack.price)}`);
        break;
      case "save-phone": { const v = $("#phone").value.trim(); if (v) { S.phone = v; log(new Date().toISOString(), S.role, "ajuste", "Atualizou o WhatsApp do comprador"); toast("Número salvo."); render(); } break; }
      case "reset":
        openModal("Restaurar dados de exemplo", "<p>Isso apaga o que você fez no protótipo e volta aos dados fictícios iniciais.</p>",
          () => { const role = S.role; S = seed(); S.role = role; filter = "abertos"; expanded = new Set(); toast("Dados de exemplo restaurados."); render(); }, "Restaurar");
        break;
      case "close-modal": closeModal(); break;
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.name === "prio") {
      S.priority = e.target.value;
      log(new Date().toISOString(), S.role, "ajuste", `Prioridade alterada para ${S.priority === "prazo" ? "prazo" : "preço"}`);
      toast("Prioridade salva. Rode a comparação para gerar avisos com a nova regra.");
      render();
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });
  window.addEventListener("hashchange", () => { closeModal(true); render(); window.scrollTo(0, 0); });

  // ---------- Tema: segue o tema de quem está vendo ----------
  const root = document.documentElement;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const applyTheme = () => document.body.setAttribute("data-theme", root.getAttribute("data-theme") || (mq.matches ? "dark" : "light"));
  new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  mq.addEventListener ? mq.addEventListener("change", applyTheme) : mq.addListener(applyTheme);
  applyTheme();

  S = load() || seed();
  render();
})();
