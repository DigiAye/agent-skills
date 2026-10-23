/* fx.js: shared, dependency-free enhancements for the agent-skills pages.
   Everything here is progressive enhancement; every page is complete without it.
   Exposes window.FX = { reduced, pointer, canvas, sprite, terminal, refresh }. */
(() => {
  const doc = document, root = doc.documentElement;
  root.classList.add("js");
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => mq.matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const FX = (window.FX = { reduced, pointer: { x: .5, y: .5 } });

  /* ---- Pointer: spotlight rims on .glass, tilt on [data-tilt], page-level --px/--py ---- */
  let panels = [], tilts = [], raf = 0, cx = innerWidth / 2, cy = innerHeight / 2;
  const collect = () => { panels = [...doc.querySelectorAll(".glass")]; tilts = [...doc.querySelectorAll("[data-tilt]")]; };
  const paint = () => {
    raf = 0;
    for (const el of panels) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > innerHeight + 300) continue;
      const dx = Math.max(r.left - cx, 0, cx - r.right), dy = Math.max(r.top - cy, 0, cy - r.bottom);
      const d = Math.hypot(dx, dy);
      el.style.setProperty("--mx", (cx - r.left) + "px");
      el.style.setProperty("--my", (cy - r.top) + "px");
      el.style.setProperty("--glow", d > 320 ? 0 : (1 - d / 320).toFixed(3));
    }
    for (const el of tilts) {
      const r = el.getBoundingClientRect(), max = +el.dataset.tilt || 4;
      const inside = cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
      el.style.setProperty("--rx", (inside ? ((cy - r.top) / r.height - .5) * -2 * max : 0).toFixed(2) + "deg");
      el.style.setProperty("--ry", (inside ? ((cx - r.left) / r.width - .5) * 2 * max : 0).toFixed(2) + "deg");
    }
  };
  if (fine) {
    collect();
    doc.addEventListener("pointermove", (e) => {
      cx = e.clientX; cy = e.clientY;
      FX.pointer.x = cx / innerWidth; FX.pointer.y = cy / innerHeight;
      if (reduced()) return;
      root.style.setProperty("--px", FX.pointer.x.toFixed(3));
      root.style.setProperty("--py", FX.pointer.y.toFixed(3));
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
    for (const b of doc.querySelectorAll("[data-magnet]")) {
      b.addEventListener("pointermove", (e) => {
        if (reduced()) return;
        const r = b.getBoundingClientRect();
        b.style.setProperty("--tx", ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + "px");
        b.style.setProperty("--ty", ((e.clientY - r.top - r.height / 2) * .32).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", () => { b.style.setProperty("--tx", "0px"); b.style.setProperty("--ty", "0px"); });
    }
  }
  FX.refresh = collect;
  /* Scroll progress (0..1 over the first viewport) for scroll-reactive light; cheap, passive. */
  let sraf = 0;
  const onScroll = () => { sraf = 0; root.style.setProperty("--sy", Math.min(1, scrollY / innerHeight).toFixed(3)); root.classList.toggle("scrolled", scrollY > 40); };
  addEventListener("scroll", () => { if (!sraf) sraf = requestAnimationFrame(onScroll); }, { passive: true }); onScroll();

  /* ---- Scroll reveals: native scroll-driven animation where supported, IO elsewhere ---- */
  const native = CSS.supports("animation-timeline: view()");
  if (!native) {
    root.classList.add("io-reveal");
    const targets = doc.querySelectorAll(".reveal");
    if (reduced() || !("IntersectionObserver" in window)) targets.forEach((n) => n.classList.add("in"));
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
      targets.forEach((n) => io.observe(n));
    }
  }

  /* ---- Canvas loop: DPR-capped, pauses when the tab is hidden or the canvas is offscreen,
          never starts under reduced motion (the CSS gradient underneath is the fallback). ---- */
  FX.canvas = (canvas, draw, cap = 1.5) => {
    const ctx = canvas && canvas.getContext && canvas.getContext("2d", { alpha: true });
    if (!ctx || reduced()) return null;
    let w = 0, h = 0, id = 0, seen = true, last = 0;
    const size = () => {
      const r = Math.min(devicePixelRatio || 1, cap);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * r); canvas.height = Math.round(h * r);
      ctx.setTransform(r, 0, 0, r, 0, 0);
    };
    const frame = (now) => {
      id = 0;
      if (!seen || doc.hidden || reduced()) return;
      const dt = Math.min((now - (last || now)) / 1000, .05); last = now;
      draw(ctx, w, h, dt, now / 1000);
      id = requestAnimationFrame(frame);
    };
    const go = () => { if (!id) { last = 0; id = requestAnimationFrame(frame); } };
    size(); addEventListener("resize", size, { passive: true });
    doc.addEventListener("visibilitychange", go);
    mq.addEventListener("change", go);
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; go(); }).observe(canvas);
    canvas.classList.add("on"); go();
    return { size };
  };
  /* ---- WebGL fragment-shader background: one full-screen triangle, hand-written GLSL.
          Returns null when WebGL is unavailable (caller falls back to canvas2D / static CSS). ---- */
  FX.gl = (canvas, frag, setUniforms, cap = 1.25) => {
    if (reduced()) return null;
    let gl; try { gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"), fs = sh(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return null;
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const U = {}; const u = (n) => U[n] || (U[n] = gl.getUniformLocation(prog, n));
    let w = 0, h = 0, id = 0, seen = true, t0 = 0;
    const size = () => { const r = Math.min(devicePixelRatio || 1, cap); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = Math.round(w * r); canvas.height = Math.round(h * r); gl.viewport(0, 0, canvas.width, canvas.height); };
    const frame = (now) => {
      id = 0; if (!seen || doc.hidden || reduced()) return;
      if (!t0) t0 = now;
      gl.uniform2f(u("u_res"), canvas.width, canvas.height);
      gl.uniform1f(u("u_time"), (now - t0) / 1000);
      gl.uniform2f(u("u_pointer"), FX.pointer.x, 1 - FX.pointer.y);
      setUniforms && setUniforms((n, ...v) => gl["uniform" + v.length + "f"](u(n), ...v), w, h);
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      id = requestAnimationFrame(frame);
    };
    const go = () => { if (!id) id = requestAnimationFrame(frame); };
    size(); addEventListener("resize", size, { passive: true });
    doc.addEventListener("visibilitychange", go); mq.addEventListener("change", go);
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; go(); }).observe(canvas);
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); canvas.classList.remove("on"); });
    canvas.classList.add("on", "gl"); go();
    return { gl, size };
  };
  /* Pre-rendered soft glow dot: cheap to draw thousands of times, unlike shadowBlur. */
  FX.sprite = (rgb, size = 64) => {
    const c = doc.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d"), grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, `rgba(${rgb},1)`); grd.addColorStop(.18, `rgba(${rgb},.8)`); grd.addColorStop(.45, `rgba(${rgb},.18)`); grd.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grd; g.fillRect(0, 0, size, size);
    return c;
  };

  /* ---- Terminal playback. Lines are already in the DOM; this types the prompt and
          reveals the rest in sequence, pausing when offscreen or hidden. ---- */
  FX.terminal = (el, pause = 5200) => {
    const lines = [...el.querySelectorAll(".ln")];
    if (!lines.length || reduced()) return;
    const type = lines[0].querySelector(".type"), full = type ? type.textContent : "", speed = +el.dataset.speed || 40;
    let i = 0, ch = 0, seen = false, tm = 0;
    el.classList.add("play");
    const step = () => {
      tm = 0;
      if (!seen || doc.hidden) return;
      if (i === 0 && type && ch <= full.length) {
        lines[0].classList.add("on");
        type.textContent = full.slice(0, ch++);
        tm = setTimeout(step, ch > full.length ? 420 : speed * (.7 + Math.random() * .8));
        if (ch > full.length) i = 1;
        return;
      }
      if (i < lines.length) {
        lines[i].classList.add("on");
        tm = setTimeout(step, +lines[i].dataset.d || 300); i++;
        return;
      }
      tm = setTimeout(() => { lines.forEach((l) => l.classList.remove("on")); i = 0; ch = 0; if (type) type.textContent = ""; step(); }, pause);
    };
    const go = () => { if (!tm) step(); };
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; go(); }, { threshold: .25 }).observe(el);
    doc.addEventListener("visibilitychange", go);
  };
  doc.querySelectorAll(".term[data-play]").forEach((t) => FX.terminal(t));

  /* ---- Command palette: Cmd/Ctrl+K. Pages plus the sections on this page. ---- */
  const seen = new Set(), items = [];
  const add = (label, href, kind) => { if (label && href && !seen.has(href)) { seen.add(href); items.push({ label, href, kind }); } };
  doc.querySelectorAll("[data-cmdk]").forEach((a) => add(a.dataset.cmdk, a.getAttribute("href"), "Go"));
  doc.querySelectorAll(".site-nav li a").forEach((a) => add(a.textContent.trim(), a.getAttribute("href"), "Go"));
  doc.querySelectorAll("main section[id] > h2").forEach((h) => add(h.textContent.trim(), "#" + h.closest("section").id, "Jump"));
  if (items.length && "HTMLDialogElement" in window) {
    const dlg = doc.createElement("dialog");
    dlg.className = "cmdk"; dlg.setAttribute("aria-label", "Command palette");
    dlg.innerHTML = `<div class="box glass"><input type="search" autocomplete="off" spellcheck="false" placeholder="Where to?" aria-label="Search pages and sections" aria-controls="cmdk-list"><ul id="cmdk-list" role="listbox"></ul><div class="hint"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div></div>`;
    doc.body.append(dlg);
    const input = dlg.querySelector("input"), list = dlg.querySelector("ul");
    let shown = [], sel = 0;
    const render = () => {
      const q = input.value.trim().toLowerCase();
      shown = items.filter((it) => it.label.toLowerCase().includes(q));
      sel = Math.min(sel, Math.max(shown.length - 1, 0));
      list.innerHTML = shown.length
        ? shown.map((it, i) => `<li role="option" id="cmdk-${i}" aria-selected="${i === sel}" data-i="${i}">${it.label}<span>${it.kind}</span></li>`).join("")
        : `<li class="empty" aria-disabled="true">Nothing matches</li>`;
      input.setAttribute("aria-activedescendant", shown.length ? "cmdk-" + sel : "");
    };
    const open = () => { if (dlg.open) return; input.value = ""; sel = 0; render(); dlg.showModal(); input.focus(); };
    const run = (i) => { const it = shown[i]; if (!it) return; dlg.close(); location.href = it.href; };
    input.addEventListener("input", () => { sel = 0; render(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % shown.length; render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; render(); }
      else if (e.key === "Enter") { e.preventDefault(); run(sel); }
    });
    list.addEventListener("click", (e) => { const li = e.target.closest("li[data-i]"); if (li) run(+li.dataset.i); });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    doc.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); dlg.open ? dlg.close() : open(); }
    });
    const mac = /mac|iphone|ipad/i.test(navigator.platform || "");
    doc.querySelectorAll("[data-cmdk-open]").forEach((b) => {
      b.addEventListener("click", open);
      const k = b.querySelector("kbd"); if (k && !mac) k.textContent = "Ctrl";
    });
  }
})();
