// Кількість частин фігури
const PARTS = [
  { name: 'head',    color: '#fff', x: 120, y: 10, w: 60, h: 60, r: 30 },
  { name: 'body',    color: '#fff', x: 140, y: 70, w: 20, h: 100, r: 10 },
  { name: 'left-arm', color: '#fff', x: 80,  y: 80, w: 60, h: 20, r: 10 },
  { name: 'right-arm',color: '#fff', x: 160, y: 80, w: 60, h: 20, r: 10 },
  { name: 'left-leg', color: '#fff', x: 120, y: 170, w: 20, h: 80, r: 10 },
  { name: 'right-leg',color: '#fff', x: 160, y: 170, w: 20, h: 80, r: 10 },
];

let startTime, endTime, moves = 0;
let positions = {};
let correct = 0;

const container = document.getElementById('human-figure');
const stats = document.getElementById('stats');
const startBtn = document.getElementById('start-btn');

function randomOffset() {
  const angle = Math.random() * 2 * Math.PI;
  const dist = 120 + Math.random() * 120;
  return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist };
}

function createParts() {
  container.innerHTML = '';
  positions = {};
  PARTS.forEach(part => {
    const el = document.createElement('div');
    el.className = 'part';
    el.style.background = part.color;
    el.style.width = part.w + 'px';
    el.style.height = part.h + 'px';
    el.style.borderRadius = part.r + 'px';
    el.style.left = part.x + 'px';
    el.style.top = part.y + 'px';
    el.dataset.name = part.name;
    el.dataset.correctX = part.x;
    el.dataset.correctY = part.y;
    el.style.boxShadow = '0 0 8px #8888';
    container.appendChild(el);
    positions[part.name] = { x: part.x, y: part.y };
  });
}

function scatterParts() {
  document.querySelectorAll('.part').forEach(el => {
    const { dx, dy } = randomOffset();
    el.style.left = (parseInt(el.dataset.correctX) + dx) + 'px';
    el.style.top = (parseInt(el.dataset.correctY) + dy) + 'px';
  });
}

function enableDrag() {
  let dragEl = null, offsetX = 0, offsetY = 0;
  container.addEventListener('mousedown', e => {
    if (!e.target.classList.contains('part')) return;
    dragEl = e.target;
    dragEl.classList.add('dragging');
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });
  document.addEventListener('mousemove', e => {
    if (!dragEl) return;
    const rect = container.getBoundingClientRect();
    dragEl.style.left = (e.clientX - rect.left - offsetX) + 'px';
    dragEl.style.top = (e.clientY - rect.top - offsetY) + 'px';
  });
  document.addEventListener('mouseup', e => {
    if (!dragEl) return;
    moves++;
    // Перевірка чи близько до цілі
    const correctX = parseInt(dragEl.dataset.correctX);
    const correctY = parseInt(dragEl.dataset.correctY);
    const left = parseInt(dragEl.style.left);
    const top = parseInt(dragEl.style.top);
    const dist = Math.sqrt((left - correctX) ** 2 + (top - correctY) ** 2);
    if (dist < 25) {
      dragEl.style.left = correctX + 'px';
      dragEl.style.top = correctY + 'px';
      dragEl.draggable = false;
      dragEl.style.pointerEvents = 'none';
      dragEl.style.boxShadow = '0 0 16px 2px #6f0';
      correct++;
      if (correct === PARTS.length) finishCaptcha();
    }
    dragEl.classList.remove('dragging');
    dragEl = null;
    updateStats();
  });
}

function updateStats() {
  const now = Date.now();
  const time = startTime ? ((now - startTime) / 1000).toFixed(2) : '0.00';
  stats.innerHTML = `Частин зібрано: <b>${correct}/${PARTS.length}</b><br>Кількість рухів: <b>${moves}</b><br>Час: <b>${time} сек</b>`;
}

function finishCaptcha() {
  endTime = Date.now();
  const time = ((endTime - startTime) / 1000).toFixed(2);
  const accuracy = (PARTS.length / moves * 100).toFixed(1);
  stats.innerHTML = `<b>Готово!</b><br>Час: <b>${time} сек</b><br>Точність: <b>${accuracy}%</b><br>Рухів: <b>${moves}</b>`;
}

function startCaptcha() {
  correct = 0;
  moves = 0;
  startTime = Date.now();
  endTime = null;
  createParts();
  scatterParts();
  updateStats();
}

startBtn.onclick = () => {
  startCaptcha();
};

enableDrag(); 