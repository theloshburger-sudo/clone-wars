window.CLONE_WARS_GAME = true;

(function () {
  const DEFAULTS = {
    title: 'Flap Clone', fix: 'none', canvasWidth: 360, canvasHeight: 640,
    gravity: 1400, flapStrength: 420, birdSize: 34, pipeWidth: 64,
    pipeGap: 150, pipeSpacing: 260, pipeSpeed: 150, groundHeight: 80,
    modes: { easy: { pipeGap: 190, pipeSpeed: 110 }, normal: { pipeGap: 150, pipeSpeed: 150 } }
  };
  const CONFIG = Object.assign({}, DEFAULTS, window.GAME_CONFIG || {});
  const ART_NAMES = ['drawBackground', 'drawGround', 'drawBird', 'drawPipe'];
  const SOUND_NAMES = ['flap', 'score', 'crash'];
  const missing = [];
  if (!window.GAME_CONFIG) missing.push('settings');
  else for (const key of Object.keys(DEFAULTS)) { if (!(key in window.GAME_CONFIG)) missing.push(key); }
  if (!window.SPRITES) missing.push('art');
  else for (const name of ART_NAMES) { if (typeof window.SPRITES[name] !== 'function') missing.push(name); }
  if (!window.SOUNDS) missing.push('sound');
  else for (const name of SOUND_NAMES) { if (typeof window.SOUNDS[name] !== 'function') missing.push(name); }
  document.getElementById('missing-label').textContent = missing.length ? 'placeholder: ' + missing.join(', ') + ' missing' : '';

  function placeholderBackground(ctx, width, height) { ctx.save(); ctx.fillStyle = '#8bd3ff'; ctx.fillRect(0, 0, width, height); ctx.restore(); }
  function placeholderGround(ctx, width, height, groundHeight) { ctx.save(); ctx.fillStyle = '#5b4636'; ctx.fillRect(0, height - groundHeight, width, groundHeight); ctx.restore(); }
  function placeholderBird(ctx, x, y, size) { ctx.save(); ctx.fillStyle = '#ffd166'; ctx.fillRect(x - size / 2, y - size / 2, size, size); ctx.restore(); }
  function placeholderPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) { ctx.save(); ctx.fillStyle = '#5a9e45'; ctx.fillRect(x, 0, pipeWidth, gapTop); ctx.fillRect(x, gapBottom, pipeWidth, height - gapBottom); ctx.restore(); }
  const drawBackground = (window.SPRITES && typeof window.SPRITES.drawBackground === 'function') ? window.SPRITES.drawBackground : placeholderBackground;
  const drawGround = (window.SPRITES && typeof window.SPRITES.drawGround === 'function') ? window.SPRITES.drawGround : placeholderGround;
  const drawBird = (window.SPRITES && typeof window.SPRITES.drawBird === 'function') ? window.SPRITES.drawBird : placeholderBird;
  const drawPipe = (window.SPRITES && typeof window.SPRITES.drawPipe === 'function') ? window.SPRITES.drawPipe : placeholderPipe;
  let muted = false;
  function play(name) {
    if (muted) return;
    const sound = window.SOUNDS && window.SOUNDS[name];
    if (typeof sound === 'function') { try { sound(); } catch (error) {} }
  }

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayText = document.getElementById('overlay-text');
  const fixButtons = document.getElementById('fix-buttons');
  const sr = document.getElementById('sr');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state = 'ready', y = CONFIG.canvasHeight / 2, velocity = 0, pipes = [], pipesMade = 0;
  let groundOffset = 0, lastGapTop = CONFIG.canvasHeight / 2, score = 0, checkpoint = 0, secondsSinceCrash = 0, currentMode = 'normal', bestScore = 0;
  let customDifficulty = 'easy', shieldSeconds = 0, nextCheckpoint = 10;
  try { bestScore = parseInt(localStorage.getItem('cloneWarsBest'), 10) || 0; } catch (error) {}

  function soundLine() { return 'Press M to turn sound ' + (muted ? 'on.' : 'off.'); }
  function showReady() { overlayTitle.textContent = CONFIG.title; overlayText.textContent = 'Press Space, click or tap to start.\n' + soundLine(); overlay.hidden = false; }
  function showGameOver() { overlayTitle.textContent = 'Game over'; const lines = ['Score ' + score + '   ·   Best ' + bestScore, 'Press Space, click or tap to play again.', soundLine()]; if (checkpoint > 0) lines.push('Next game starts at checkpoint ' + checkpoint + '.'); overlayText.textContent = lines.join('\n'); overlay.hidden = false; }
  if (CONFIG.fix === 'easy-mode') {
    for (const mode of ['easy', 'normal']) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = mode === 'easy' ? 'Easy' : 'Normal';
      button.setAttribute('aria-pressed', String(mode === currentMode));
      button.addEventListener('click', (event) => {
        currentMode = mode;
        for (const other of fixButtons.querySelectorAll('button')) {
          other.setAttribute('aria-pressed', String(other === event.currentTarget));
        }
        event.currentTarget.blur();
      });
      fixButtons.appendChild(button);
    }
  }
  if (CONFIG.fix === 'custom') {
    for (const mode of ['easy', 'hard']) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = mode === 'easy' ? 'Easy' : 'Hard';
      button.setAttribute('aria-pressed', String(mode === customDifficulty));
      button.addEventListener('click', (event) => {
        customDifficulty = mode;
        for (const other of fixButtons.querySelectorAll('button')) other.setAttribute('aria-pressed', String(other === event.currentTarget));
        event.currentTarget.blur();
      });
      fixButtons.appendChild(button);
    }
  }
  function startGame() { state = 'playing'; y = (CONFIG.canvasHeight - CONFIG.groundHeight) / 2; velocity = -CONFIG.flapStrength; pipes = []; pipesMade = 0; groundOffset = 0; lastGapTop = (CONFIG.canvasHeight - CONFIG.groundHeight) / 2 - CONFIG.pipeGap / 2; score = checkpoint; nextCheckpoint = Math.floor(score / 10 + 1) * 10; shieldSeconds = 0; secondsSinceCrash = 0; overlay.hidden = true; play('flap'); }
  function press() { if (state === 'ready') startGame(); else if (state === 'playing') { velocity = -CONFIG.flapStrength; play('flap'); } else if (state === 'gameover' && secondsSinceCrash >= 0.4) startGame(); }
  window.addEventListener('keydown', (event) => {
    if (event.target && event.target.closest && event.target.closest('button')) return;
    if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); press(); }
    else if (event.code === 'KeyM') { muted = !muted; if (state === 'ready') showReady(); if (state === 'gameover') showGameOver(); }
  });
  window.addEventListener('pointerdown', (event) => { if (event.target && event.target.closest && event.target.closest('button')) return; press(); });
  function addPipe(pipeGap) { const gap = pipeGap + (CONFIG.fix === 'gentle-start' && pipesMade < 3 ? 70 : 0); const lowest = CONFIG.canvasHeight - CONFIG.groundHeight - 60 - gap; const gapTop = Math.max(60, Math.min(lowest, lastGapTop + (Math.random() * 360 - 180))); const gapBottom = gapTop + gap; lastGapTop = gapTop; pipes.push({ x: CONFIG.canvasWidth, gapTop: gapTop, gapBottom: gapBottom, scored: false }); pipesMade += 1; }
  function crash() { state = 'gameover'; secondsSinceCrash = 0; play('crash'); if (score > bestScore) bestScore = score; try { localStorage.setItem('cloneWarsBest', String(bestScore)); } catch (error) {} checkpoint = CONFIG.fix === 'checkpoints' ? Math.floor(score / 10) * 10 : 0; sr.textContent = 'Game over. Score ' + score + '. Best ' + bestScore + '.'; showGameOver(); }
  function frame(now) {
    const seconds = Math.min(0.05, (now - (frame.last || now)) / 1000); frame.last = now;
    const mode = CONFIG.fix === 'easy-mode' ? CONFIG.modes[currentMode] : (CONFIG.fix === 'custom' ? (customDifficulty === 'easy' ? { pipeGap: 180, pipeSpeed: 125 } : { pipeGap: 135, pipeSpeed: 175 }) : CONFIG); const pipeGap = mode.pipeGap; const pipeSpeed = mode.pipeSpeed * (CONFIG.fix === 'gentle-start' && score < 3 ? 0.75 : 1);
    if (state === 'playing') { velocity += (CONFIG.fix === 'custom' && customDifficulty === 'easy' ? CONFIG.gravity * 0.82 : CONFIG.gravity) * seconds; y += velocity * seconds; groundOffset += pipeSpeed * seconds; shieldSeconds = Math.max(0, shieldSeconds - seconds); if (pipes.length === 0) addPipe(pipeGap); else if (pipes[pipes.length - 1].x <= CONFIG.canvasWidth - (CONFIG.fix === 'custom' && customDifficulty === 'easy' ? 285 : CONFIG.pipeSpacing)) addPipe(pipeGap); for (const pipe of pipes) { pipe.x -= pipeSpeed * seconds; if (!pipe.scored && pipe.x + CONFIG.pipeWidth < CONFIG.canvasWidth / 4) { pipe.scored = true; score += 1; play('score'); if (CONFIG.fix === 'custom' && score >= nextCheckpoint) { shieldSeconds = 1.2; nextCheckpoint += 10; } } } pipes = pipes.filter((pipe) => pipe.x + CONFIG.pipeWidth > 0); const birdX = CONFIG.canvasWidth / 4; const half = CONFIG.birdSize / 2; if (shieldSeconds <= 0 && (y + half >= CONFIG.canvasHeight - CONFIG.groundHeight || y - half <= 0 || pipes.some((pipe) => birdX + half > pipe.x && birdX - half < pipe.x + CONFIG.pipeWidth && (y - half < pipe.gapTop || y + half > pipe.gapBottom)))) crash(); }
    else if (state === 'gameover') secondsSinceCrash += seconds;
    drawBackground(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, reduceMotion ? 0 : now / 1000); for (const pipe of pipes) drawPipe(ctx, pipe.x, pipe.gapTop, pipe.gapBottom, CONFIG.pipeWidth, CONFIG.canvasHeight - CONFIG.groundHeight); drawGround(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, CONFIG.groundHeight, groundOffset); drawBird(ctx, CONFIG.canvasWidth / 4, y, CONFIG.birdSize, velocity); if (shieldSeconds > 0) { ctx.save(); ctx.strokeStyle = '#6ee7ff'; ctx.lineWidth = 5; ctx.globalAlpha = Math.min(1, shieldSeconds); ctx.beginPath(); ctx.arc(CONFIG.canvasWidth / 4, y, CONFIG.birdSize * 0.9, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); } if (state === 'playing') { ctx.save(); ctx.font = 'bold 42px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#172033'; ctx.fillStyle = '#fff'; ctx.strokeText(String(score), CONFIG.canvasWidth / 2, 58); ctx.fillText(String(score), CONFIG.canvasWidth / 2, 58); ctx.restore(); } requestAnimationFrame(frame);
  }
  showReady();
  requestAnimationFrame(frame);
})();
