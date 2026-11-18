/* raio — landing page (home). Exposta como window.RaioLP para o app montar no hash vazio ou #home. */
window.RaioLP = (() => {
  "use strict";
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timers = [];
  let observers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function html({ DATA, brl, pct, icon }) {
    // Exemplos derivados dos dados fictícios do protótipo (não são dados de mercado)
    const examples = DATA.items.map((it) => {
      const bestF = Math.min(...it.offers.map((o) => o[1]));
      const best = Math.round(it.ref * bestF * 100) / 100;
      return { name: it.name, paid: it.ref, best, red: (it.ref - best) / it.ref };
    }).filter((e) => e.red > 0.01);
    const tick = examples.map((e) => `<span class="lp-tick"><b>${e.name}</b> pagou ${brl(e.paid)} <i>→</i> tinha por ${brl(e.best)} <em>−${pct(e.red)}</em></span>`).join("");
    const basico = DATA.plans[0];

    return `
    <header class="lp-hero">
      <div class="lp-wrap lp-nav">
        <a href="#home" class="lp-logo" aria-label="raio"><img src="{{logo-lime}}" alt="raio" width="96" height="29"></a>
        <nav class="lp-links" aria-label="Seções da página">
          <button data-lp-scroll="lp-como">Como funciona</button>
          <button data-lp-scroll="lp-regra">Regra do 1%</button>
          <button data-lp-scroll="lp-planos">Planos</button>
        </nav>
        <a class="raio-btn raio-btn--accent raio-btn--sm" href="#inicio">Entrar no protótipo</a>
      </div>

      <div class="lp-wrap lp-hero-grid">
        <div class="lp-hero-copy">
          <p class="lp-eyebrow lp-in" style="--d:0">${icon("avisos", 14)} Agente de compras para empresas com CNPJ</p>
          <h1 class="lp-in" style="--d:1">Pare de pagar a mais<br><span class="lp-hl">sem perceber.</span></h1>
          <p class="lp-sub lp-in" style="--d:2">O raio vigia o preço de tudo que sua empresa compra. Quando aparece uma oferta mais de 1% abaixo do último preço pago, o comprador recebe no WhatsApp. O gestor vê, em reais, quanto deixou de escorrer.</p>
          <div class="lp-ctas lp-in" style="--d:3">
            <a class="raio-btn raio-btn--accent raio-btn--lg" href="#inicio">Entrar no protótipo</a>
            <button class="lp-ghost" data-lp-scroll="lp-como">Ver como funciona <span aria-hidden="true">↓</span></button>
          </div>
          <ul class="lp-proof lp-in" style="--d:4">
            <li>${icon("check", 14)} Só recomenda: a compra continua com vocês</li>
            <li>${icon("check", 14)} Funciona sem ERP</li>
            <li>${icon("check", 14)} Aviso direto no WhatsApp</li>
          </ul>
        </div>

        <div class="lp-demo" id="lp-demo" data-stage="0" aria-label="Demonstração animada: o raio encontra um preço melhor e avisa o comprador">
          <div class="lp-dcard">
            <div class="lp-dhead"><span class="lp-live"><i></i> Monitorando</span><span class="lp-dcount">8 itens · 5 lojas</span></div>
            <h3 id="lp-d-name">Papel sulfite A4 75g</h3>
            <p class="lp-dunit" id="lp-d-unit">caixa c/ 10 resmas · último preço pago</p>
            <div class="lp-dprice">
              <s id="lp-d-old">R$ 289,90</s>
              <strong id="lp-d-new">R$ 289,90</strong>
              <span class="delta good" id="lp-d-red">−9,0%</span>
            </div>
            <div class="lp-scan"><span></span></div>
            <ul class="lp-dstores" id="lp-d-stores"></ul>
          </div>
          <div class="lp-bubble">
            <span class="lp-bubble-from"><b>⚡ raio</b> · WhatsApp · agora</span>
            <p id="lp-d-msg">Valor melhor encontrado.</p>
          </div>
          <div class="lp-unlock"><span class="raio-mark" aria-hidden="true"></span> −100 tokens · link liberado</div>
          <p class="lp-demo-note">Simulação com dados fictícios</p>
        </div>
      </div>
      <div class="raio-mark lp-bolt" aria-hidden="true"></div>
    </header>

    <section class="lp-sec lp-leak">
      <div class="lp-wrap">
        <p class="lp-kicker lp-rv">O problema</p>
        <h2 class="lp-rv">Ninguém está roubando.<br>O dinheiro só escorre.</h2>
        <p class="lp-lead lp-rv">Compra no marketplace de sempre, com o fornecedor de sempre, pelo preço de sempre. Sem comparar, sem registrar, sem ninguém olhando. Cada compra parece pequena. O mês inteiro, não.</p>
      </div>
      <div class="lp-marquee" aria-label="Exemplos fictícios de compras acima do melhor preço">
        <div class="lp-marquee-track">${tick}${tick}</div>
      </div>
      <div class="lp-wrap lp-three">
        <article class="lp-rv"><span class="lp-num">Sem comparação</span><p>O preço de hoje vira o preço de sempre. Ninguém confere se o mesmo item está mais barato em outra loja.</p></article>
        <article class="lp-rv"><span class="lp-num">Sem auditoria</span><p>Não fica registro de quem comprou, por quanto e se havia opção melhor quando a compra foi feita.</p></article>
        <article class="lp-rv"><span class="lp-num">Sem visibilidade</span><p>O empresário só vê o total no fim do mês. A diferença que escapou em cada pedido não aparece em lugar nenhum.</p></article>
      </div>
    </section>

    <section class="lp-sec lp-how" id="lp-como">
      <div class="lp-wrap">
        <p class="lp-kicker lp-rv">Como funciona</p>
        <h2 class="lp-rv">Quatro passos.<br>Nenhum sistema novo para aprender.</h2>
        <ol class="lp-steps">
          <li class="lp-step lp-rv">
            <span class="lp-step-n">1</span>
            <h3>Conte o que vocês compram</h3>
            <p>Item, quantidade e o último preço pago. Hoje por cadastro manual; NF em PDF e ERP com API vêm depois.</p>
            <div class="lp-mini"><div class="raio-input" style="width:100%"><span class="raio-input__label">Último preço pago</span><span class="lp-mini-val">R$ 289,90</span></div></div>
          </li>
          <li class="lp-step lp-rv">
            <span class="lp-step-n">2</span>
            <h3>O raio compara</h3>
            <p>Busca ofertas do mesmo item e ordena pelo que importa para a empresa: menor preço ou entrega mais rápida.</p>
            <div class="lp-mini lp-mini-bars"><span style="--w:91%"></span><span style="--w:97%"></span><span style="--w:100%"></span></div>
          </li>
          <li class="lp-step lp-rv">
            <span class="lp-step-n">3</span>
            <h3>Só avisa quando vale</h3>
            <p>Se a oferta fica mais de 1% abaixo do último preço pago, o comprador recebe no WhatsApp. Abaixo disso, silêncio.</p>
            <div class="lp-mini"><span class="lp-mini-bubble">⚡ Valor melhor: −9,0%</span></div>
          </li>
          <li class="lp-step lp-rv">
            <span class="lp-step-n">4</span>
            <h3>Desbloqueie e compre onde quiser</h3>
            <p>Com ${DATA.unlockCost} tokens o comprador vê a loja e o link. A compra é feita por vocês, fora do raio, e a economia entra no painel.</p>
            <div class="lp-mini"><span class="raio-btn raio-btn--cta raio-btn--sm" aria-hidden="true">${icon("lock", 14)} Desbloquear · ${DATA.unlockCost}</span></div>
          </li>
        </ol>
      </div>
    </section>

    <section class="lp-sec lp-rule" id="lp-regra" data-theme="dark">
      <div class="lp-wrap lp-rule-grid">
        <div>
          <p class="lp-kicker lp-rv">A regra do 1%</p>
          <h2 class="lp-rv">Barulho não economiza.<br>Por isso existe um limite.</h2>
          <p class="lp-lead lp-rv">Um aviso a cada centavo vira spam e o comprador para de ler. O raio só chama quando a diferença passa de 1% contra o último preço pago. Teste a regra:</p>
        </div>
        <div class="lp-calc lp-rv" id="lp-calc">
          <label for="lp-c-last"><span>Último preço pago</span><output id="lp-c-last-o">R$ 289,90</output></label>
          <input type="range" id="lp-c-last" min="10" max="600" step="0.1" value="289.9">
          <label for="lp-c-off"><span>Oferta encontrada</span><output id="lp-c-off-o">−3,0%</output></label>
          <input type="range" id="lp-c-off" min="-15" max="5" step="0.1" value="-3">
          <label for="lp-c-qty"><span>Quantidade por mês</span><output id="lp-c-qty-o">4</output></label>
          <input type="range" id="lp-c-qty" min="1" max="200" step="1" value="4">
          <div class="lp-verdict" id="lp-verdict" data-on="true">
            <div class="lp-verdict-meter"><span id="lp-c-bar"></span><i class="lp-verdict-line" title="limiar de 1%"></i></div>
            <p class="lp-verdict-title" id="lp-c-title">⚡ O raio avisa o comprador</p>
            <p class="lp-verdict-sub" id="lp-c-sub">Oferta a R$ 281,20. Economia de R$ 34,80 no mês.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="lp-sec lp-roles">
      <div class="lp-wrap">
        <p class="lp-kicker lp-rv">Para quem</p>
        <h2 class="lp-rv">O comprador vira protagonista.<br>O gestor ganha um placar.</h2>
        <div class="lp-roles-grid">
          <article class="lp-role lp-rv">
            <span class="raio-avatar raio-avatar--md">AS</span>
            <h3>Quem compra</h3>
            <p>Recebe o aviso no celular, decide se vale abrir o link e registra a compra. Cada preço que traz para o raio e cada real economizado sobem o desempenho dele.</p>
            <ul><li>Aviso no WhatsApp</li><li>Decide o que desbloquear</li><li>Indicador de desempenho <span class="tag-prop">proposta</span></li></ul>
          </article>
          <article class="lp-role lp-role--gestor lp-rv">
            <span class="raio-avatar raio-avatar--md raio-avatar--purple">CL</span>
            <h3>Quem responde pelo caixa</h3>
            <p>Vê a economia contra o último preço pago, quais compras saíram na melhor condição e o registro de cada link aberto.</p>
            <div class="lp-big"><small>Economia realizada no exemplo do protótipo</small><strong data-lp-count="114" data-fmt="brl">${brl(114)}</strong></div>
          </article>
        </div>
      </div>
    </section>

    <section class="lp-sec lp-plans" id="lp-planos">
      <div class="lp-wrap lp-plans-grid">
        <div>
          <p class="lp-kicker lp-rv">Planos</p>
          <h2 class="lp-rv">Paga pelo link que abre.<br>Não pelo aviso que recebe.</h2>
          <p class="lp-lead lp-rv">Os avisos são ilimitados. Tokens só são usados quando o comprador decide ver a loja e o link de uma oferta.</p>
        </div>
        <article class="lp-plan lp-rv">
          <div class="plan-top"><h3>Básico</h3><span class="raio-badge raio-badge--lime">Para começar</span></div>
          <p class="plan-price">${brl(basico.price)}<small>/mês</small></p>
          <ul><li><b>${basico.tokens}</b> tokens no ciclo</li><li><b>${basico.tokens / DATA.unlockCost}</b> links desbloqueados</li><li>Avisos ilimitados no WhatsApp</li></ul>
          <a class="raio-btn raio-btn--cta raio-btn--block" href="#plano">Ver planos no protótipo</a>
          <p class="hint">Prata, Gold e pacotes extras estão em proposta. ${DATA.unlockCost} tokens por link é valor provisório.</p>
        </article>
      </div>
    </section>

    <section class="lp-final">
      <div class="lp-wrap">
        <h2 class="lp-rv">Feche o ralo<br>antes da próxima compra.</h2>
        <a class="raio-btn raio-btn--primary raio-btn--lg lp-rv" href="#inicio">Entrar no protótipo</a>
      </div>
    </section>
    <footer class="lp-foot"><div class="lp-wrap"><img src="{{logo-blue-lime}}" alt="raio" width="72" height="22" class="lp-foot-logo"><span>Protótipo com dados fictícios · PRD v0.5 · novembro de 2026</span></div></footer>`;
  }

  // ---------- Demo do hero ----------
  function demo(root, { DATA, brl, pct }) {
    const el = root.querySelector("#lp-demo");
    if (!el) return;
    const picks = ["papel", "cafe", "disco"].map((id) => DATA.items.find((i) => i.id === id));
    const $ = (id) => root.querySelector(id);
    let k = 0;
    const tween = (node, from, to, ms) => {
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / ms); const e = 1 - Math.pow(1 - p, 3);
        node.textContent = brl(from + (to - from) * e);
        if (p < 1 && el.isConnected) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const show = (it, stage) => {
      const offers = it.offers.map(([s, f, d]) => ({ s: DATA.stores[s], p: Math.round(it.ref * f * 100) / 100, d })).sort((a, b) => a.p - b.p);
      const best = offers[0];
      const red = (it.ref - best.p) / it.ref;
      $("#lp-d-name").textContent = it.name;
      $("#lp-d-unit").textContent = `${it.unit} · último preço pago`;
      $("#lp-d-old").textContent = brl(it.ref);
      $("#lp-d-red").textContent = `−${pct(red)}`;
      $("#lp-d-stores").innerHTML = offers.map((o, i) => `<li style="--i:${i}" class="${i === 0 ? "best" : ""}"><span>Loja ${String.fromCharCode(65 + i)}</span><b>${brl(o.p)}</b><small>${o.d} ${o.d === 1 ? "dia" : "dias"}</small></li>`).join("");
      $("#lp-d-msg").textContent = `Valor melhor: ${it.name} de ${brl(it.ref)} por ${brl(best.p)}. Economia de ${brl((it.ref - best.p) * it.qty)} no mês.`;
      return best;
    };
    if (reduce()) { const b = show(picks[0]); $("#lp-d-new").textContent = brl(b.p); el.dataset.stage = "3"; return; }
    const cycle = () => {
      if (!el.isConnected) return;
      const it = picks[k++ % picks.length];
      el.dataset.stage = "0";
      const best = show(it);
      $("#lp-d-new").textContent = brl(it.ref);
      later(() => { el.dataset.stage = "1"; tween($("#lp-d-new"), it.ref, best.p, 900); }, 1500);
      later(() => { el.dataset.stage = "2"; }, 2700);
      later(() => { el.dataset.stage = "3"; }, 4100);
      later(() => { el.dataset.stage = "out"; }, 6800);
      later(cycle, 7300);
    };
    cycle();
  }

  // ---------- Calculadora da regra do 1% ----------
  function calc(root, { brl, pct }) {
    const q = (id) => root.querySelector(id);
    const last = q("#lp-c-last"), off = q("#lp-c-off"), qty = q("#lp-c-qty");
    if (!last) return;
    const update = () => {
      const L = +last.value, d = +off.value / 100, Q = +qty.value;
      const price = Math.round(L * (1 + d) * 100) / 100;
      const red = (L - price) / L;
      const on = red > 0.01;
      q("#lp-c-last-o").textContent = brl(L);
      q("#lp-c-off-o").textContent = `${d <= 0 ? "−" : "+"}${pct(Math.abs(d))} (${brl(price)})`;
      q("#lp-c-qty-o").textContent = Q;
      const v = q("#lp-verdict");
      v.dataset.on = String(on);
      q("#lp-c-bar").style.width = `${Math.max(0, Math.min(100, (red / 0.15) * 100))}%`;
      q("#lp-c-title").textContent = on ? "⚡ O raio avisa o comprador" : red > 0 ? "O raio fica quieto" : "Nada a avisar";
      q("#lp-c-sub").textContent = on
        ? `Oferta ${pct(red)} abaixo. Economia de ${brl((L - price) * Q)} no mês.`
        : red > 0 ? `${pct(red)} de diferença não passa do limite de 1%.` : "A oferta não é mais barata que o último preço pago.";
    };
    [last, off, qty].forEach((i) => i.addEventListener("input", update));
    update();
  }

  // ---------- Contador do gestor ----------
  function counters(root, { brl }) {
    const els = root.querySelectorAll("[data-lp-count]");
    if (!els.length || reduce() || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const to = +en.target.dataset.lpCount, t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 1400); en.target.textContent = brl(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    els.forEach((e) => io.observe(e));
    observers.push(io);
  }

  function mount(root, ctx) {
    unmount();
    root.querySelectorAll("[data-lp-scroll]").forEach((b) => b.addEventListener("click", () => {
      const t = root.querySelector("#" + b.dataset.lpScroll);
      if (t) t.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
    }));
    // Garantia: mesmo que a animação de entrada não rode (miniatura, aba em segundo plano), o hero aparece
    later(() => root.classList.add("lp-ready"), 1800);
    demo(root, ctx);
    calc(root, ctx);
    counters(root, ctx);
  }
  function unmount() { timers.forEach(clearTimeout); timers = []; observers.forEach((o) => o.disconnect()); observers = []; }

  return { html, mount, unmount };
})();
