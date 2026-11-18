// Page background: the switcher in the corner, rain, and the rainy window.
// The mode itself is picked before the page paints by the inline script from
// worker/backgrounds.js, which leaves window.__bg behind for this file.
//
// Cost: effects draw on a canvas at no more than 30 frames a second, stop
// while the tab is hidden, and draw a single still frame for visitors who ask
// for reduced motion.
(() => {
  const bg = window.__bg;
  if (!bg) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cdn = (u, o) => `/cdn-cgi/image/${o},fit=scale-down,format=auto${u}`;
  const MODES = ["color", "photo", "rain", "window"];
  const LABEL = { color: "Colour", photo: "Photo", rain: "Rain", window: "Window" };
  const NOTE = {
    color: "A quiet colour.",
    photo: "One of my photos.",
    rain: "Rain, falling behind the page.",
    window: "One of my photos, through a window on a rainy day.",
  };
  const SIGNATURE = "Window was made by Claude, 17 November 2026.";
  const available = (m) => m === "color" || m === "rain" || bg.data.photos.length > 0;

  // ---------------------------------------------------------------- canvas
  // Layers are fixed full-screen canvases behind the page.
  let layers = [], raf = 0, last = 0, effect = null, W = 0, H = 0, dpr = 1;

  function layer() {
    const c = document.createElement("canvas");
    c.className = "bg-canvas";
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100lvh;z-index:-1;pointer-events:none";
    document.body.prepend(c);
    layers.push(c);
    return c.getContext("2d");
  }
  function measure() {
    W = window.innerWidth;
    H = Math.max(window.innerHeight, layers[0]?.getBoundingClientRect().height || 0);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    for (const c of layers) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (t - last < (effect.interval || 33)) return; // 30 frames a second at most
    last = t;
    effect.frame();
  }
  function stopEffect() {
    cancelAnimationFrame(raf);
    raf = 0;
    effect?.stop?.();
    effect = null;
    for (const c of layers) c.remove();
    layers = [];
  }
  function runEffect(make) {
    stopEffect();
    effect = make();
  }
  function animate() {
    if (!reduced && effect?.frame && !raf) raf = requestAnimationFrame(loop);
  }
  let lastW = window.innerWidth;
  addEventListener("resize", () => {
    // Phones change height as the address bar slides; only redo on real resizes.
    if (!effect || Math.abs(window.innerWidth - lastW) < 2) return;
    lastW = window.innerWidth;
    measure();
    effect.init();
  });

  // ------------------------------------------------------------------ rain
  function rain() {
    const ctx = layer();
    measure();
    let drops = [];
    const WIND = 0.17;
    const drop = (top) => {
      const l = 9 + Math.random() * 17;
      return { x: Math.random() * (W + H * WIND), y: top ? -l - Math.random() * 40 : Math.random() * H, l, v: 8 + Math.random() * 8 };
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(58, 76, 94, 0.32)";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (const d of drops) {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.l * WIND, d.y + d.l);
      }
      ctx.stroke();
    };
    const fx = {
      interval: 40, // 25 frames a second
      init() {
        drops = Array.from({ length: Math.min(140, Math.round((W * H) / 7500)) }, () => drop(false));
        draw();
      },
      frame() {
        for (const d of drops) {
          d.y += d.v;
          d.x -= d.v * WIND;
          if (d.y > H) Object.assign(d, drop(true));
        }
        draw();
      },
    };
    fx.init();
    return fx;
  }

  // ---------------------------------------------------------------- window
  // The page shows the photo blurred (fogged glass). Beads of water sit on
  // the glass, each a tiny upside-down lens onto the sharp photo; now and
  // then one grows heavy and runs down, wiping a clear line behind it. The
  // fog slowly creeps back over the clear lines.
  function windowFx(photo) {
    const img = new Image();
    img.decoding = "async";
    img.src = cdn(photo.u, "width=1600,quality=80");
    let glass, heads, ready = false;
    let s = 1, ox = 0, oy = 0, beads = [], runs = [], tick = 0;

    const fit = () => {
      s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      ox = (W - img.naturalWidth * s) / 2;
      oy = (H - img.naturalHeight * s) / 2;
    };
    // The sharp photo exactly as it lies behind the glass at (x, y).
    function clear(ctx, x, y, r) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7);
      ctx.clip();
      ctx.drawImage(img, (x - r - ox) / s, (y - r - oy) / s, (2 * r) / s, (2 * r) / s, x - r, y - r, 2 * r, 2 * r);
      ctx.restore();
    }
    // A water drop: a wide, upside-down view of the photo around it, with
    // a dark lower edge and a highlight.
    function bead(ctx, x, y, r) {
      const span = r * 5;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7);
      ctx.clip();
      ctx.translate(x, y);
      ctx.scale(1, -1);
      ctx.drawImage(img, (x - span - ox) / s, (y - span - oy) / s, (2 * span) / s, (2 * span) / s, -r, -r, 2 * r, 2 * r);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(x, y, r - 0.25, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = Math.max(0.6, r * 0.18);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - r * 0.35, y - r * 0.4, Math.max(0.5, r * 0.18), 0, 7);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fill();
    }
    const newBead = () => ({ x: Math.random() * W, y: Math.random() * H, r: 1.4 + Math.random() ** 2 * 5 });
    const newRun = () => ({
      x: Math.random() * W,
      y: -10 - Math.random() * H * 0.6,
      r: 4.5 + Math.random() * 4.5,
      v: 0,
      wait: 20 + Math.random() * 240,
    });

    function fog(amount) {
      glass.save();
      glass.globalCompositeOperation = "destination-out";
      glass.fillStyle = `rgba(0, 0, 0, ${amount})`;
      glass.fillRect(0, 0, W, H);
      glass.restore();
    }
    const fx = {
      interval: 50, // drops are slow; 20 frames a second is enough
      init() {
        if (!ready) return;
        heads.clearRect(0, 0, W, H);
        fit();
        glass.clearRect(0, 0, W, H);
        beads = Array.from({ length: Math.min(160, Math.round((W * H) / 6000)) }, newBead);
        for (const b of beads) bead(glass, b.x, b.y, b.r);
        runs = reduced ? [] : Array.from({ length: Math.max(3, Math.min(8, Math.round(W / 180))) }, newRun);
        for (const r of runs) r.y = Math.random() * H;
      },
      frame() {
        if (!ready) return;
        tick++;
        // Every 3 seconds the fog creeps back a little and some beads move.
        if (tick % 60 === 0) {
          fog(0.1);
          for (const b of beads) {
            if (Math.random() < 0.08) Object.assign(b, newBead());
            bead(glass, b.x, b.y, b.r);
          }
        }
        // Clear only where the running drops were last frame.
        for (const d of runs) if (d.drawn) heads.clearRect(d.drawn[0], d.drawn[1], d.drawn[2], d.drawn[2]);
        for (const d of runs) {
          if (d.wait > 0) {
            d.wait--;
          } else {
            d.v = Math.min(5, Math.max(0, d.v + (Math.random() - 0.42) * 0.5));
            const step = d.v;
            for (let k = 0; k < step; k += 1.5) clear(glass, d.x, d.y + k, d.r * 0.55);
            if (step > 0 && Math.random() < 0.025) bead(glass, d.x + (Math.random() - 0.5) * d.r, d.y, d.r * 0.4);
            d.y += step;
            d.x += (Math.random() - 0.5) * 0.4;
            d.r = Math.max(2, d.r - step * 0.0035);
            if (d.y > H + 10) Object.assign(d, newRun());
          }
          if (d.y > -d.r) {
            bead(heads, d.x, d.y, d.r);
            d.drawn = [d.x - d.r - 2, d.y - d.r - 2, 2 * d.r + 4];
          } else d.drawn = null;
        }
      },
      stop() {
        img.onload = null;
      },
    };
    glass = layer();
    heads = layer();
    measure();
    img.onload = () => {
      ready = true;
      tint(img);
      fx.init();
      animate();
    };
    return fx;
  }

  // Panels take a light version of the photo's average colour.
  function tint(image) {
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      const x = c.getContext("2d", { willReadFrequently: true });
      x.drawImage(image, 0, 0, 1, 1);
      const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
      const mix = (v) => Math.round(v * 0.22 + 255 * 0.78).toString(16).padStart(2, "0");
      bg.pick.tint = `#${mix(r)}${mix(g)}${mix(b)}`;
      bg.apply(bg.pick.mode, true);
    } catch {
      // keep the neutral tint
    }
  }
  function sampleTint(photo) {
    const i = new Image();
    i.onload = () => tint(i);
    i.src = cdn(photo.u, "width=32,quality=60");
  }

  function start(pick) {
    if (pick.mode === "rain") runEffect(rain);
    else if (pick.mode === "window") runEffect(() => windowFx(pick.photo));
    else stopEffect();
    if (pick.mode === "photo" && !pick.tint) sampleTint(pick.photo);
    animate();
  }

  // -------------------------------------------------------------- switcher
  const css = `
#bg-switch{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:40;font:600 .9rem/1.25 "Zilla Slab",Georgia,serif;color:#111}
#bg-switch button{font:inherit;color:inherit;cursor:pointer}
#bg-switch .bg-toggle{display:flex;align-items:center;gap:.45rem;padding:.3rem .8rem .3rem .35rem;border-radius:999px;border:1px solid rgba(0,0,0,.18);background:rgba(250,250,247,.94);box-shadow:0 2px 10px rgba(0,0,0,.12)}
#bg-switch .bg-dot{width:1.35rem;height:1.35rem;border-radius:50%;border:1px solid rgba(0,0,0,.2);background:#ececec center/cover}
#bg-menu{position:absolute;right:0;bottom:calc(100% + 8px);width:16.5rem;padding:.9rem;border-radius:14px;background:#f8f8f5;box-shadow:0 8px 30px rgba(0,0,0,.2);font-weight:400}
#bg-menu[hidden]{display:none}
#bg-menu .bg-opts{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
#bg-menu .bg-opt{display:grid;gap:.25rem;padding:.3rem;border:2px solid transparent;border-radius:10px;background:none;text-align:left;font-weight:600}
#bg-menu .bg-opt[aria-checked=true]{border-color:#111}
#bg-menu .bg-prev{height:3.2rem;border-radius:7px;background:#ddd center/cover;border:1px solid rgba(0,0,0,.12)}
#bg-menu .bg-note{margin:.7rem 0 .2rem;font-size:.85rem}
#bg-menu .bg-small{margin:.15rem 0;font-size:.78rem;color:#5a3b31}
#bg-menu .bg-small a{color:#0785ac}
#bg-menu .bg-again{margin-top:.6rem;width:100%;padding:.35rem;border-radius:999px;border:2px solid #1998db;background:#1998db;color:#fff}
#bg-switch :focus-visible{outline:3px solid #1998db;outline-offset:2px}
@media print{#bg-switch,.bg-canvas{display:none}}`;
  const RAIN_PREVIEW =
    "repeating-linear-gradient(100deg,transparent 0 9px,rgba(58,76,94,.45) 9px 10px),#d9dfe4";

  function build() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.append(style);

    const root = document.createElement("div");
    root.id = "bg-switch";
    root.innerHTML = `
      <button type="button" class="bg-toggle" aria-expanded="false" aria-controls="bg-menu">
        <span class="bg-dot" aria-hidden="true"></span><span class="bg-label"></span>
      </button>
      <div id="bg-menu" role="dialog" aria-label="Background" hidden>
        <div class="bg-opts" role="radiogroup" aria-label="Background"></div>
        <p class="bg-note"></p>
        <p class="bg-small bg-credit"></p>
        <p class="bg-small bg-sig"></p>
        <button type="button" class="bg-again">Another one</button>
      </div>`;
    document.body.append(root);

    const toggle = root.querySelector(".bg-toggle");
    const menu = root.querySelector("#bg-menu");
    const opts = root.querySelector(".bg-opts");
    const buttons = {};
    for (const m of MODES.filter(available)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "bg-opt";
      b.setAttribute("role", "radio");
      b.innerHTML = `<span class="bg-prev" aria-hidden="true"></span><span>${LABEL[m]}</span>`;
      b.addEventListener("click", () => choose(m));
      opts.append(b);
      buttons[m] = b;
    }

    function previews() {
      const p = bg.data.photos;
      const a = p[0], w = p[1] || p[0];
      if (buttons.color) buttons.color.firstChild.style.background = bg.data.colors.slice(0, 4).length > 1
        ? `linear-gradient(90deg,${bg.data.colors.slice(0, 4).map((c, i, l) => `${c} ${(i / l.length) * 100}% ${((i + 1) / l.length) * 100}%`).join(",")})`
        : bg.data.colors[0];
      if (buttons.photo && a) buttons.photo.firstChild.style.backgroundImage = `url("${cdn(a.u, "width=200,quality=70")}")`;
      if (buttons.rain) buttons.rain.firstChild.style.background = RAIN_PREVIEW;
      if (buttons.window && w)
        buttons.window.firstChild.style.backgroundImage = `radial-gradient(circle at 30% 40%,rgba(255,255,255,.6) 0 2px,transparent 3px),radial-gradient(circle at 70% 65%,rgba(255,255,255,.6) 0 2px,transparent 3px),url("${cdn(w.u, "width=200,blur=6,quality=70")}")`;
    }

    function render(pick) {
      toggle.querySelector(".bg-label").textContent = LABEL[pick.mode];
      toggle.setAttribute("aria-label", `Background: ${LABEL[pick.mode]}. Change background`);
      const dot = toggle.querySelector(".bg-dot");
      dot.style.background = "";
      if (pick.mode === "color") dot.style.background = pick.color;
      else if (pick.mode === "rain") dot.style.background = RAIN_PREVIEW;
      else dot.style.backgroundImage = `url("${cdn(pick.photo.u, "width=64,quality=60")}")`;
      for (const [m, b] of Object.entries(buttons)) b.setAttribute("aria-checked", String(m === pick.mode));
      menu.querySelector(".bg-note").textContent = NOTE[pick.mode];
      const credit = menu.querySelector(".bg-credit");
      credit.replaceChildren();
      if (pick.photo) {
        const a = document.createElement("a");
        a.href = "/photos/";
        a.textContent = pick.photo.c || "see all photos";
        credit.append("Photo: ", a);
      }
      menu.querySelector(".bg-sig").textContent = pick.mode === "window" ? SIGNATURE : "";
    }

    function choose(mode) {
      try {
        sessionStorage.setItem("bg-mode", mode);
      } catch {}
      bg.apply(mode, false);
    }
    menu.querySelector(".bg-again").addEventListener("click", () => bg.apply(bg.pick.mode, false));

    let previewed = false;
    function open(on) {
      menu.hidden = !on;
      toggle.setAttribute("aria-expanded", String(on));
      if (on) {
        if (!previewed) previews(), (previewed = true);
        (opts.querySelector("[aria-checked=true]") || opts.firstChild)?.focus();
      }
    }
    toggle.addEventListener("click", () => open(menu.hidden));
    document.addEventListener("click", (e) => {
      if (!menu.hidden && !root.contains(e.target)) open(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) open(false), toggle.focus();
    });

    // Re-render and restart effects whenever the background changes.
    let current = null;
    bg.onchange = (pick) => {
      render(pick);
      const key = pick.mode + (pick.photo?.u || "") + (pick.color || "");
      if (key !== current) {
        current = key;
        start(pick);
      }
    };
    bg.onchange(bg.pick);
  }

  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build);
})();
