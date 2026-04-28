import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';
import { loadTraps } from './traps.js';

let board = null;
let game = new Chess();
let currentVariation = [];
let stepIndex = 0;

// State
let allTraps = [];
let filteredTraps = [];

const cfg = {
  draggable: false,
  position: 'start',
  pieceTheme: 'https://cdn.jsdelivr.net/npm/chessboardjs@0.0.1/www/img/chesspieces/wikipedia/{piece}.png'
};

function initBoard() {
  board = Chessboard('board', cfg);
  requestAnimationFrame(() => {
    if (board && typeof board.resize === 'function') board.resize();
  });
}

function renderVariationsList(variations) {
  const ul = document.getElementById('variationsList');
  ul.innerHTML = '';
  (variations || []).forEach((v, idx) => {
    const li = document.createElement('li');
    li.textContent = Array.isArray(v) ? v.join(' ') : String(v);
    ul.appendChild(li);
  });
}

function setActiveSequence(name, variations, sequence) {
  document.getElementById('trapName').textContent = name || '-';
  renderVariationsList(variations || []);
  currentVariation = sequence || [];
  stepIndex = 0;
  game.reset();
  board.position(game.fen());
  document.getElementById('moveNumber').textContent = stepIndex;
}

function replayToStep(targetStep) {
  const safeStep = Math.max(0, Math.min(targetStep, currentVariation.length));
  game.reset();
  for (let i = 0; i < safeStep; i++) {
    const move = game.move(currentVariation[i], { sloppy: true });
    if (!move) break;
  }
  stepIndex = safeStep;
  board.position(game.fen());
  document.getElementById('moveNumber').textContent = stepIndex;
}

function populateTrapSelect(traps) {
  const sel = document.getElementById('trapSelect');
  sel.innerHTML = '';
  traps.forEach((t, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = t.name || `Trap ${i}`;
    sel.appendChild(o);
  });
}

function populateWinnerSelect(traps) {
  const sel = document.getElementById('winnerFilter');
  if (!sel) return;
  const values = Array.from(new Set(traps.map(t => t.winner).filter(v => v !== undefined && v !== null)));
  sel.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'All';
  sel.appendChild(allOpt);
  values.forEach(v => {
    const o = document.createElement('option');
    o.value = String(v).toLowerCase();
    o.textContent = String(v);
    sel.appendChild(o);
  });
}

function populateStartSelect(traps) {
  const sel = document.getElementById('startFilter');
  if (!sel) return;
  const values = Array.from(new Set(traps.map(t => t.starts).filter(Boolean)));
  sel.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'All';
  sel.appendChild(allOpt);
  values.forEach(v => {
    const o = document.createElement('option');
    o.value = String(v).toLowerCase();
    o.textContent = String(v);
    sel.appendChild(o);
  });
}

function applyFilters() {
  const startVal = (document.getElementById('startFilter') || {}).value || 'all';
  const winnerEl = document.getElementById('winnerFilter');
  const winnerVal = winnerEl ? winnerEl.value : 'all';

  const sVal = (startVal || 'all').toString().toLowerCase();
  const wVal = (winnerVal || 'all').toString().toLowerCase();

  filteredTraps = allTraps.filter(t => {
    const tStarts = (t.starts || '').toString().toLowerCase();
    const tWinner = (t.winner || '').toString().toLowerCase();
    let ok = true;
    if (sVal !== 'all') ok = ok && (tStarts === sVal);
    if (wVal !== 'all') ok = ok && (tWinner === wVal);
    return ok;
  });
  populateTrapSelect(filteredTraps);
}

function extractSanMoves(input) {
  const text = (input || '').replace(/\r/g, ' ');
  const withoutComments = text
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*\)/g, ' ');
  const sanRegex = /(O-O-O|O-O|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[+#]?|[a-h][1-8])/g;
  return withoutComments.match(sanRegex) || [];
}

function loadManualMoves() {
  const input = document.getElementById('manualMoves');
  const moves = extractSanMoves(input ? input.value : '');
  if (!moves.length) return;
  setActiveSequence('Custom Moves', [moves], moves);
}

async function start() {
  allTraps = await loadTraps();
  filteredTraps = allTraps;
  populateStartSelect(allTraps);
  populateWinnerSelect(allTraps);
  populateTrapSelect(filteredTraps);
  initBoard();
  document.getElementById('startTrap').addEventListener('click', onStartTrap);
  document.getElementById('prevMove').addEventListener('click', onPreviousMove);
  document.getElementById('nextMove').addEventListener('click', onNextMove);
  document.getElementById('reset').addEventListener('click', onReset);
  const loadMovesButton = document.getElementById('loadMoves');
  if (loadMovesButton) loadMovesButton.addEventListener('click', loadManualMoves);
  const startSel = document.getElementById('startFilter');
  if (startSel) startSel.addEventListener('change', applyFilters);
  const winnerSel = document.getElementById('winnerFilter');
  if (winnerSel) winnerSel.addEventListener('change', applyFilters);
}

function onStartTrap() {
  const sel = document.getElementById('trapSelect');
  const idx = parseInt(sel.value, 10);
  const t = filteredTraps[idx];
  if (!t) return;
  setActiveSequence(t.name, t.variations, (t.variations && t.variations[0]) || []);
}

function animateMove(san) {
  try {
    const move = game.move(san, { sloppy: true });
    board.position(game.fen());
    return !!move;
  } catch (e) {
    console.error('move failed', e, san);
    return false;
  }
}

function onNextMove() {
  if (!currentVariation || stepIndex >= currentVariation.length) return;
  const san = currentVariation[stepIndex];
  const ok = animateMove(san);
  if (ok) stepIndex += 1;
  document.getElementById('moveNumber').textContent = stepIndex;
}

function onPreviousMove() {
  if (!currentVariation || stepIndex <= 0) return;
  replayToStep(stepIndex - 1);
}

function onReset() {
  replayToStep(0);
}

start();
