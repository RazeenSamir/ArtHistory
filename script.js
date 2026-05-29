/* ══════════════════════════════════════════
   INSIDE THE ENLIGHTENMENT — script.js
   ══════════════════════════════════════════ */

// ── Custom Cursor ──────────────────────────────
const cursorGlow = document.getElementById('cursor-glow');
let mouseX = 0, mouseY = 0;
let curX = 0, curY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

document.querySelectorAll('a, button, .frame-item, .material-card, .finding-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursorGlow.classList.add('expanded'));
  el.addEventListener('mouseleave', () => cursorGlow.classList.remove('expanded'));
});

function animateCursor() {
  curX += (mouseX - curX) * 0.12;
  curY += (mouseY - curY) * 0.12;
  cursorGlow.style.left = curX + 'px';
  cursorGlow.style.top  = curY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ── Navigation scroll state ───────────────────
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
});

// ── Dust Particles ────────────────────────────
const dustCanvas = document.getElementById('dust-canvas');
const ctx = dustCanvas.getContext('2d');
let dustParticles = [];

function resizeDust() {
  dustCanvas.width  = window.innerWidth;
  dustCanvas.height = window.innerHeight;
}
resizeDust();
window.addEventListener('resize', resizeDust);

for (let i = 0; i < 60; i++) {
  dustParticles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.3,
    speed: Math.random() * 0.3 + 0.1,
    drift: (Math.random() - 0.5) * 0.2,
    opacity: Math.random() * 0.5 + 0.1,
    opacityDir: Math.random() > 0.5 ? 1 : -1,
  });
}

function drawDust() {
  ctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
  dustParticles.forEach(p => {
    p.y -= p.speed;
    p.x += p.drift;
    p.opacity += p.opacityDir * 0.003;
    if (p.opacity > 0.6 || p.opacity < 0.05) p.opacityDir *= -1;
    if (p.y < -10) { p.y = dustCanvas.height + 10; p.x = Math.random() * dustCanvas.width; }
    if (p.x < 0 || p.x > dustCanvas.width) p.x = Math.random() * dustCanvas.width;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201,169,110,${p.opacity})`;
    ctx.fill();
  });
  requestAnimationFrame(drawDust);
}
drawDust();

// ── Scroll Reveal ─────────────────────────────
const reveals = document.querySelectorAll('.reveal-on-scroll');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

reveals.forEach(el => revealObserver.observe(el));

// ── Animated counters ────────────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.count);
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('[data-count]');
      nums.forEach(n => animateCount(n));
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const statSection = document.querySelector('.entrance-stats');
if (statSection) counterObserver.observe(statSection);

// ── Artwork bar animations ────────────────────
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.artwork-bar').forEach(bar => {
        const w = bar.dataset.width;
        setTimeout(() => { bar.style.width = w + '%'; }, 400);
      });
      entry.target.querySelectorAll('.mat-bar-fill').forEach(bar => {
        const w = bar.dataset.width;
        setTimeout(() => { bar.style.width = w + '%'; }, 400);
      });
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.frame-item, .material-card').forEach(el => barObserver.observe(el));

// ── Object Type Line Chart ────────────────────
const objTypeCanvas = document.getElementById('obj-type-canvas');

const objectTypeData = {
  intervals: ['1650','1660','1670','1680','1690','1700','1710','1720','1730','1740','1750','1760','1770'],
  series: [
    { name: 'Statuette',      data: [7,  2,  6, 11,  8, 14,  6, 2, 3, 18, 17, 33, 9],  color: '#c9a96e' },
    { name: 'Sculpture',      data: [2, 16, 12, 25,  9, 17, 10, 2, 5,  2, 12,  4, 1],  color: '#e8e0d5' },
    { name: 'Bust',           data: [2,  1, 14,  8,  8, 14,  2, 0, 5,  4,  9, 13, 11], color: '#c17f5a' },
    { name: 'Sculpted Group', data: [1,  2,  5,  5,  1, 15,  2, 1, 1,  4,  8,  8, 9],  color: '#9ab5c4' },
    { name: 'Bas-relief',     data: [2, 18,  5,  8, 11,  8,  0, 0, 2,  3,  1,  0, 4],  color: '#8fad91' },
  ]
};

const objTypeLegendEl = document.getElementById('obj-type-legend');
if (objTypeLegendEl) {
  objectTypeData.series.forEach(s => {
    const item = document.createElement('span');
    item.className = 'obj-type-legend-item';
    item.style.setProperty('--legend-color', s.color);
    item.textContent = s.name;
    objTypeLegendEl.appendChild(item);
  });
}

function drawObjTypeChart(progress) {
  if (!objTypeCanvas) return;
  const oc = objTypeCanvas.getContext('2d');
  const W = objTypeCanvas.width, H = objTypeCanvas.height;
  const pad = { top: 20, right: 20, bottom: 40, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  oc.clearRect(0, 0, W, H);

  const maxVal = 35;
  const pts = objectTypeData.intervals.length;
  const xStep = chartW / (pts - 1);

  function toX(i) { return pad.left + i * xStep; }
  function toY(v) { return pad.top + chartH - (v / maxVal) * chartH; }

  // Grid lines
  oc.strokeStyle = 'rgba(201,169,110,0.07)';
  oc.lineWidth = 1;
  for (let v = 0; v <= maxVal; v += 7) {
    const y = toY(v);
    oc.beginPath(); oc.moveTo(pad.left, y); oc.lineTo(W - pad.right, y); oc.stroke();
    oc.fillStyle = 'rgba(201,169,110,0.35)';
    oc.font = '10px Inter, sans-serif';
    oc.textAlign = 'right';
    oc.fillText(v, pad.left - 6, y + 4);
  }

  // X-axis labels
  oc.fillStyle = 'rgba(201,169,110,0.4)';
  oc.font = '9px Inter, sans-serif';
  oc.textAlign = 'center';
  objectTypeData.intervals.forEach((d, i) => {
    oc.fillText(d, toX(i), H - pad.bottom + 16);
  });

  // Draw each series
  objectTypeData.series.forEach(s => {
    const totalPts = Math.floor(pts * progress);
    if (totalPts < 2) return;

    oc.beginPath();
    oc.moveTo(toX(0), toY(s.data[0]));
    for (let i = 1; i < totalPts; i++) {
      const xc = (toX(i - 1) + toX(i)) / 2;
      const yc = (toY(s.data[i - 1]) + toY(s.data[i])) / 2;
      oc.quadraticCurveTo(toX(i - 1), toY(s.data[i - 1]), xc, yc);
    }
    oc.strokeStyle = s.color;
    oc.lineWidth = 2.2;
    oc.globalAlpha = 0.9;
    oc.stroke();
    oc.globalAlpha = 1;

    for (let i = 0; i < totalPts; i++) {
      oc.beginPath();
      oc.arc(toX(i), toY(s.data[i]), 3, 0, Math.PI * 2);
      oc.fillStyle = s.color;
      oc.fill();
    }
  });
}

let objTypeAnimated = false;
const objTypeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !objTypeAnimated) {
      objTypeAnimated = true;
      const dur = 1800;
      const start = performance.now();
      function anim(now) {
        const prog = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - prog, 2);
        drawObjTypeChart(eased);
        if (prog < 1) requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
      objTypeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

if (objTypeCanvas) objTypeObserver.observe(objTypeCanvas);

// ── Donut Chart ───────────────────────────────
const donutCanvas = document.getElementById('donut-canvas');
const legendEl = document.getElementById('donut-legend');

const materialData = [
  { name: 'Marble',     count: 303, color: '#e8e0d5' },
  { name: 'Other',      count: 83,  color: '#4a4238' },
  { name: 'Bronze',     count: 84,  color: '#c9a96e' },
  { name: 'Terracotta', count: 79,  color: '#c17f5a' },
  { name: 'Porcelain',  count: 26,  color: '#d4e8f0' },
  { name: 'Wood',       count: 25,  color: '#8B5A2B' },
];
const totalMat = materialData.reduce((s, d) => s + d.count, 0);

// Build legend
if (legendEl) {
  materialData.forEach(d => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background:${d.color}"></span>
      <span class="legend-label">${d.name}</span>
      <span class="legend-pct">${((d.count / totalMat) * 100).toFixed(1)}%</span>`;
    legendEl.appendChild(item);
  });
}

function drawDonut(progress) {
  if (!donutCanvas) return;
  const dc = donutCanvas.getContext('2d');
  const cx = 130, cy = 130, outerR = 120, innerR = 75;
  dc.clearRect(0, 0, 260, 260);

  let startAngle = -Math.PI / 2;
  const totalAngle = Math.PI * 2 * progress;

  materialData.forEach((d, i) => {
    const slice = (d.count / totalMat) * totalAngle;
    dc.beginPath();
    dc.moveTo(cx, cy);
    dc.arc(cx, cy, outerR, startAngle, startAngle + slice);
    dc.closePath();
    dc.fillStyle = d.color;
    dc.globalAlpha = 0.85;
    dc.fill();

    // Gap
    dc.beginPath();
    dc.moveTo(cx, cy);
    dc.arc(cx, cy, outerR + 2, startAngle + slice - 0.002, startAngle + slice + 0.008);
    dc.closePath();
    dc.fillStyle = '#0d0b09';
    dc.globalAlpha = 1;
    dc.fill();

    startAngle += slice;
  });

  // Donut hole
  dc.beginPath();
  dc.arc(cx, cy, innerR, 0, Math.PI * 2);
  dc.fillStyle = '#12100c';
  dc.globalAlpha = 1;
  dc.fill();

  // Ring
  dc.beginPath();
  dc.arc(cx, cy, outerR, 0, Math.PI * 2);
  dc.strokeStyle = 'rgba(201,169,110,0.15)';
  dc.lineWidth = 1;
  dc.stroke();
}

let donutAnimated = false;
const donutObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !donutAnimated) {
      donutAnimated = true;
      let prog = 0;
      const dur = 1400;
      const start = performance.now();
      function anim(now) {
        prog = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - prog, 2);
        drawDonut(eased);
        if (prog < 1) requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
      donutObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

if (donutCanvas) donutObserver.observe(donutCanvas);

// ── Line Chart (Material Trends) ──────────────
const lineCanvas = document.getElementById('line-canvas');

const lineData = {
  intervals: ['1650','1660','1670','1680','1690','1700','1710','1720','1730','1740','1750','1760','1770'],
  series: [
    { name: 'Marble',     data: [9,  28, 31, 45, 23, 60, 19, 1,  12, 13, 23, 23, 16], color: '#e8e0d5' },
    { name: 'Bronze',     data: [5,  2,  5,  40, 8,  9,  1,  2,  0,  3,  4,  2,  3 ], color: '#c9a96e' },
    { name: 'Terracotta', data: [0,  3,  6,  2,  7,  5,  3,  2,  7,  8,  7,  21, 8 ], color: '#c17f5a' },
    { name: 'Porcelain',  data: [0,  0,  0,  0,  0,  0,  0,  0,  1,  6,  5,  10, 4 ], color: '#d4e8f0' },
    { name: 'Wood',       data: [1,  1,  0,  3,  1,  4,  0,  0,  1,  2,  3,  5,  4 ], color: '#a07850' },
  ]
};

// Build line legend dynamically
const lineLegendEl = document.getElementById('line-legend');
if (lineLegendEl) {
  lineData.series.forEach(s => {
    const item = document.createElement('span');
    item.className = 'obj-type-legend-item';
    item.style.setProperty('--legend-color', s.color);
    item.textContent = s.name;
    lineLegendEl.appendChild(item);
  });
}

function drawLineChart(progress) {
  if (!lineCanvas) return;
  const lc = lineCanvas.getContext('2d');
  const W = lineCanvas.width, H = lineCanvas.height;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  lc.clearRect(0, 0, W, H);

  const maxVal = 65;
  const pts = lineData.intervals.length;
  const xStep = chartW / (pts - 1);

  function toX(i) { return pad.left + i * xStep; }
  function toY(v) { return pad.top + chartH - (v / maxVal) * chartH; }

  // Grid
  lc.strokeStyle = 'rgba(201,169,110,0.07)';
  lc.lineWidth = 1;
  for (let v = 0; v <= maxVal; v += 13) {
    const y = toY(v);
    lc.beginPath(); lc.moveTo(pad.left, y); lc.lineTo(W - pad.right, y); lc.stroke();
    lc.fillStyle = 'rgba(201,169,110,0.35)';
    lc.font = '10px Inter, sans-serif';
    lc.textAlign = 'right';
    lc.fillText(v, pad.left - 6, y + 4);
  }

  // X labels
  lc.fillStyle = 'rgba(201,169,110,0.4)';
  lc.font = '9px Inter, sans-serif';
  lc.textAlign = 'center';
  lineData.intervals.forEach((d, i) => {
    lc.fillText(d, toX(i), H - pad.bottom + 16);
  });

  const drawSeries = (data, color) => {
    const totalPts = Math.floor(pts * progress);
    if (totalPts < 2) return;

    lc.beginPath();
    lc.moveTo(toX(0), toY(data[0]));
    for (let i = 1; i < totalPts; i++) {
      const xc = (toX(i - 1) + toX(i)) / 2;
      const yc = (toY(data[i - 1]) + toY(data[i])) / 2;
      lc.quadraticCurveTo(toX(i - 1), toY(data[i - 1]), xc, yc);
    }
    lc.strokeStyle = color;
    lc.lineWidth = 2.2;
    lc.globalAlpha = 0.9;
    lc.stroke();
    lc.globalAlpha = 1;

    for (let i = 0; i < totalPts; i++) {
      lc.beginPath();
      lc.arc(toX(i), toY(data[i]), 3, 0, Math.PI * 2);
      lc.fillStyle = color;
      lc.fill();
    }
  };

  lineData.series.forEach(s => drawSeries(s.data, s.color));

  // Subtle area fill under marble
  const totalPts = Math.floor(pts * progress);
  const marbleData = lineData.series[0].data;
  if (totalPts >= 2) {
    lc.beginPath();
    lc.moveTo(toX(0), toY(marbleData[0]));
    for (let i = 1; i < totalPts; i++) {
      const xc = (toX(i - 1) + toX(i)) / 2;
      const yc = (toY(marbleData[i - 1]) + toY(marbleData[i])) / 2;
      lc.quadraticCurveTo(toX(i - 1), toY(marbleData[i - 1]), xc, yc);
    }
    lc.lineTo(toX(totalPts - 1), toY(0));
    lc.lineTo(toX(0), toY(0));
    lc.closePath();
    const grad = lc.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0, 'rgba(232,224,213,0.10)');
    grad.addColorStop(1, 'rgba(232,224,213,0)');
    lc.fillStyle = grad;
    lc.fill();
  }
}

let lineAnimated = false;
const lineObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !lineAnimated) {
      lineAnimated = true;
      const dur = 1800;
      const start = performance.now();
      function anim(now) {
        const prog = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - prog, 2);
        drawLineChart(eased);
        if (prog < 1) requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
      lineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

if (lineCanvas) lineObserver.observe(lineCanvas);

// ── Timeline Line ─────────────────────────────
const timelineLine = document.getElementById('timeline-line');
const tlObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      timelineLine.classList.add('animate');
      tlObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
if (timelineLine) tlObserver.observe(timelineLine);

// ── Parallax on scroll ────────────────────────
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;

      // Hero parallax
      const heroBg = document.querySelector('.hero-bg');
      const heroContent = document.querySelector('.hero-content');
      if (heroBg) heroBg.style.transform = `translateY(${y * 0.3}px)`;
      if (heroContent) heroContent.style.transform = `translateY(${y * 0.15}px)`;

      // Hallway depth
      const hallVanish = document.querySelector('.hall-vanish-point');
      if (hallVanish) {
        const section = document.getElementById('hallway');
        if (section) {
          const rect = section.getBoundingClientRect();
          const prog = Math.max(0, Math.min(1, -rect.top / rect.height));
          hallVanish.style.boxShadow = `0 0 ${60 + prog * 80}px ${30 + prog * 50}px rgba(201,169,110,${0.04 + prog * 0.08})`;
        }
      }

      // Grand gallery beam intensity
      const beams = document.querySelectorAll('.grand-light-beam');
      if (beams.length) {
        const section = document.getElementById('conclusion');
        if (section) {
          const rect = section.getBoundingClientRect();
          const prog = Math.max(0, Math.min(1, -rect.top / rect.height));
          beams.forEach(b => b.style.opacity = 0.5 + prog * 0.8);
        }
      }

      ticking = false;
    });
    ticking = true;
  }
});

// ── Frame hover glow effect ───────────────────
document.querySelectorAll('.frame-item').forEach(frame => {
  frame.addEventListener('mouseenter', () => {
    frame.style.zIndex = '10';
  });
  frame.addEventListener('mouseleave', () => {
    frame.style.zIndex = '';
  });
});

// ── Entrance door-open effect ─────────────────
const pyramidLarge = document.querySelector('.pyramid-large svg');
const entranceObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && pyramidLarge) {
      pyramidLarge.style.transition = 'transform 2s cubic-bezier(0.16,1,0.3,1), opacity 2s ease';
      pyramidLarge.style.transform = 'scale(1.05)';
      pyramidLarge.style.opacity = '0.8';
    }
  });
}, { threshold: 0.3 });

const entranceSection = document.getElementById('entrance');
if (entranceSection) entranceObserver.observe(entranceSection);

// ── Resize canvases ───────────────────────────
function resizeLineCanvas() {
  if (!lineCanvas) return;
  const parent = lineCanvas.parentElement;
  if (parent) {
    lineCanvas.width = parent.offsetWidth;
    if (lineAnimated) drawLineChart(1);
  }
}

function resizeObjTypeCanvas() {
  if (!objTypeCanvas) return;
  const parent = objTypeCanvas.parentElement;
  if (parent) {
    objTypeCanvas.width = parent.offsetWidth;
    if (objTypeAnimated) drawObjTypeChart(1);
    else drawObjTypeChart(0);
  }
}

window.addEventListener('resize', () => { resizeLineCanvas(); resizeObjTypeCanvas(); });
resizeLineCanvas();
resizeObjTypeCanvas();

// ── Initial draw (placeholder state) ─────────
drawLineChart(0);
drawDonut(0);
