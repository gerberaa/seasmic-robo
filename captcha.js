// Масив частин маскота з координатами та SVG-файлами
const PARTS = [
  { name: 'head',      file: 'head.png',      x: 29,  y: 115,   w: 300, h: 290 },
  { name: 'body',      file: 'body.png',      x: 32,  y: 123,  w: 300, h: 250 },
  { name: 'left_hand', file: 'left_hand.png', x: 50,   y: 114,  w: 270,  h: 250 },
  { name: 'right_hand',file: 'right_hand.png',x: 47, y: 123,  w: 270,  h: 250 },
  { name: 'legs',      file: 'legs.png',      x: 33,  y: 111, w: 300, h: 260 },
];

let startTime, endTime, moves = 0;
let positions = {};
let correct = 0;

const container = document.getElementById('human-figure');
const stats = document.getElementById('stats');
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-captcha');

function randomOffset() {
  const angle = Math.random() * 2 * Math.PI;
  const dist = 120 + Math.random() * 120;
  return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist };
}

function createParts() {
  console.log('createParts: створюю частини');
  container.innerHTML = '';
  positions = {};
  PARTS.forEach(part => {
    const el = document.createElement('img');
    el.className = 'part';
    el.src = part.file;
    el.style.width = part.w + 'px';
    el.style.height = part.h + 'px';
    el.style.left = part.x + 'px';
    el.style.top = part.y + 'px';
    el.dataset.name = part.name;
    el.dataset.correctX = part.x;
    el.dataset.correctY = part.y;
    el.draggable = false;
    container.appendChild(el);
    positions[part.name] = { x: part.x, y: part.y };
    console.log(`createParts: додано ${part.name} (${part.file}) x:${part.x} y:${part.y} w:${part.w} h:${part.h}`);
  });
}

function scatterParts() {
  console.log('scatterParts: розкидаю частини');
  document.querySelectorAll('.part').forEach(el => {
    const { dx, dy } = randomOffset();
    el.style.left = (parseInt(el.dataset.correctX) + dx) + 'px';
    el.style.top = (parseInt(el.dataset.correctY) + dy) + 'px';
    console.log(`scatterParts: ${el.dataset.name} -> left:${el.style.left} top:${el.style.top}`);
  });
}

function enableDrag() {
  let dragEl = null, offsetX = 0, offsetY = 0;
  let coordHint = null;
  container.addEventListener('mousedown', e => {
    if (!e.target.classList.contains('part')) return;
    dragEl = e.target;
    dragEl.classList.add('dragging');
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    console.log(`mousedown: ${dragEl.dataset.name} offsetX:${offsetX} offsetY:${offsetY}`);
    // Показуємо підказку координат
    if (!coordHint) {
      coordHint = document.createElement('div');
      coordHint.style.position = 'fixed';
      coordHint.style.background = 'rgba(0,0,0,0.8)';
      coordHint.style.color = '#0f0';
      coordHint.style.fontFamily = 'monospace';
      coordHint.style.fontSize = '14px';
      coordHint.style.padding = '2px 6px';
      coordHint.style.borderRadius = '4px';
      coordHint.style.pointerEvents = 'none';
      coordHint.style.zIndex = 10000;
      document.body.appendChild(coordHint);
    }
    coordHint.style.display = 'block';
  });
  document.addEventListener('mousemove', e => {
    if (!dragEl) return;
    const rect = container.getBoundingClientRect();
    const left = e.clientX - rect.left - offsetX;
    const top = e.clientY - rect.top - offsetY;
    dragEl.style.left = left + 'px';
    dragEl.style.top = top + 'px';
    // Оновлюємо підказку координат
    if (coordHint) {
      coordHint.textContent = `x: ${Math.round(left)}, y: ${Math.round(top)}`;
      coordHint.style.left = (e.clientX + 16) + 'px';
      coordHint.style.top = (e.clientY + 16) + 'px';
    }
    console.log(`mousemove: ${dragEl.dataset.name} -> left:${left} top:${top}`);
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
    console.log(`mouseup: ${dragEl.dataset.name} left:${left} top:${top} correctX:${correctX} correctY:${correctY} dist:${dist}`);
    if (dist < 25) {
      dragEl.style.left = correctX + 'px';
      dragEl.style.top = correctY + 'px';
      dragEl.draggable = false;
      dragEl.style.pointerEvents = 'none';
      dragEl.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.18)' },
        { transform: 'scale(0.95)' },
        { transform: 'scale(1)' }
      ], {
        duration: 350,
        easing: 'cubic-bezier(.5,1.8,.5,1)',
      });
      correct++;
      console.log(`mouseup: ${dragEl.dataset.name} встановлено правильно! correct=${correct}`);
      if (correct === PARTS.length) {
        console.log('finishCaptcha: всі частини зібрано!');
        finishCaptcha();
      }
    }
    dragEl.classList.remove('dragging');
    dragEl = null;
    // Ховаємо підказку координат
    if (coordHint) coordHint.style.display = 'none';
    updateStats();
  });
}

function updateStats() {
  const now = Date.now();
  const time = startTime ? ((now - startTime) / 1000).toFixed(2) : '0.00';
  stats.innerHTML = `Частин зібрано: <b>${correct}/${PARTS.length}</b><br>Кількість рухів: <b>${moves}</b><br>Час: <b>${time} сек</b>`;
  console.log(`updateStats: correct=${correct} moves=${moves} time=${time}`);
}

function finishCaptcha() {
  endTime = Date.now();
  const time = ((endTime - startTime) / 1000).toFixed(2);
  const accuracy = (PARTS.length / moves * 100).toFixed(1);
  // Показую кнопку пройти капчу
  if (submitBtn) submitBtn.style.display = 'block';
  // Тимчасово показую статистику без фінального повідомлення
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

// Видалено анімований фон canyon-svg 