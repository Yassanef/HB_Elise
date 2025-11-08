/* script.js
   Version retravaillée : machine à écrire, bouton Suivant volant, turbo, auto-play, fond "je t'aime".
   Toutes les fonctionnalités audio ont été supprimées comme demandé.
*/

// --- Texte modifiable: remplacer / ajouter des phrases ici ---
let phrases = [
  { text: "Pour ma copine d'amour, Elise", typewriter: true },
  { text: "T'es vraiment la personne la plus importante pour moi, et jsuis tellement, tellement heureux de t'avoir trouvee", typewriter: true },
  { text: "T'es la premiere pensee qui me traverse la tete le matin, et la derniere quand jme couche", typewriter: true },
  { text: "Quand j'ai quelque chose de nv dans ma vie, c'est toujours toi la premiere personne a qui j'ai envie de le dire, et quand jpense a toi, j'ai ce sourire un peu bete", typewriter: true },
  { text: "Tu me rends tellement heureux, aussi t'es tlm attentionnee, douce (dans tous les sens du terme) et mignonne", typewriter: true },
  { text: "Meme quand on se prend la tete, tu restes tjrs ma princesse d'amour, et je t'aimerai pour toujours", typewriter: true },
  { text: "J'adore a quel point t'es motivee, determinee (ou inflexible, ou tete dure comme tu veux) dans ce que tu fais, et tu veux reussir, ce qui me rend fier d'etre avec toi", typewriter: true },
  { text: "Aussi parce que t'es super belle (jsp si jlai dit), et j'adore qu'on puisse rire de tout (ou presque)", typewriter: true },
  { text: "Tu essaies meme les trucs que j'aime, juste pour me faire plaisir, et tu me rends tellement heureux, jveux passer le reste de ma vie avec toi", typewriter: true },
  { text: "Quand jte regarde, jressens trop d'amour dans le ventre, et j'ai juste envie de t'embrasser", typewriter: true },
  { text: "T'es la meilleure copine que je pouvais rever d'avoir, et jsuis super reconnaissant pour ces 8 mois qu'on a passes ensemble", typewriter: true },
  { text: "J'espere qu'il y en aura encore des dizaines d'autres, toujours avec toi, et je t'aime plus que tout", typewriter: true },
  { text: "- Yasser", typewriter: true }
];
// -----------------------------------------------------------

const phraseEl = document.getElementById('phrase');
const canvas = document.getElementById('particles');
const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

let idx = 0;
let busy = false;
let autoplayEnabled = false;
let autoDelay = 2800;
let autoTimer = null;
let typewriterSpeed = 45;
let turboMultiplier = 1;
let typingRunId = 0;

let prevBtn, bigNextBtn, restartBtn, autoBtn, speedRange, progressBar, progressText, turboBtn;

// Resize canvas to cover viewport
function resizeCanvas(){
  if (!canvas || !ctx) return;
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
addEventListener('resize', resizeCanvas, {passive:true});
resizeCanvas();

// --- Helper: mettre en évidence mots importants en enveloppant des <span class="important"> ---
function highlightImportant(text, importantWords){
  if (!importantWords || importantWords.length===0) return text;
  importantWords.forEach(w=>{
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${esc})`, 'gi');
    text = text.replace(re, '<span class="important">$1</span>');
  });
  return text;
}

function showPhrase(i){
  if (!phraseEl || i < 0 || i >= phrases.length) return;
  busy = true;
  phraseEl.classList.remove('final-message','show-phrase','shaky');
  phraseEl.innerHTML = '';

  if (bigNextBtn){
    bigNextBtn.style.opacity = '0';
    bigNextBtn.style.pointerEvents = 'none';
  }

  const entry = (typeof phrases[i] === 'string') ? { text: phrases[i], typewriter:false } : phrases[i];
  const text = entry.text;
  const myRun = ++typingRunId;

  if (entry.typewriter){
    const caret = document.createElement('span');
    caret.className = 'typewriter-caret';
    phraseEl.appendChild(caret);
    let pos = 0;
    const total = text.length;

    function step(){
      if (myRun !== typingRunId) return;
      if (pos > total){
        phraseEl.removeChild(caret);
        phraseEl.innerHTML = highlightImportant(text, entry.important || []);
        finishShow();
        return;
      }
      const sub = text.slice(0,pos).replace(/\n/g,'<br>');
      phraseEl.innerHTML = sub;
      phraseEl.appendChild(caret);
      pos++;
      const base = typeof typewriterSpeed === 'number' ? typewriterSpeed : 45;
      const delay = Math.max(1, Math.round(base * turboMultiplier));
      setTimeout(step, delay + Math.floor(Math.random()*18));
    }

    requestAnimationFrame(()=>{ phraseEl.classList.add('show-phrase'); });
    setTimeout(step, 100);
  } else {
    phraseEl.innerHTML = highlightImportant(text, entry.important || []);
    if (Math.random() < 0.45) phraseEl.classList.add('shaky');
    requestAnimationFrame(()=>{ phraseEl.classList.add('show-phrase'); });
    setTimeout(finishShow, 500);
  }

  function finishShow(){
    busy = false;
    if (bigNextBtn){
      if (i < phrases.length - 1){
        prepareNextButton(false);
      } else {
        prepareNextButton(true);
      }
    }
    if (autoplayEnabled && i < phrases.length - 1){
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = setTimeout(()=>{ next(); }, autoDelay);
    }
    // small liveliness: occasionally emit a tiny heart burst after a phrase
    if (Math.random() < 0.32){
      // emit a few small hearts near the center
      const cx = window.innerWidth/2 + (Math.random()*160 - 80);
      const cy = window.innerHeight/2 + (Math.random()*80 - 40);
      for (let k=0;k<3;k++) setTimeout(()=> createHeart(cx + (Math.random()*60-30), cy + (Math.random()*40-20)), k*80);
    }
  }
}

function prepareNextButton(isFinal){
  if (!bigNextBtn) return;
  if (isFinal){
    bigNextBtn.dataset.final = 'true';
    bigNextBtn.textContent = 'Fêter 🎉';
    bigNextBtn.classList.add('final-mode');
  } else {
    delete bigNextBtn.dataset.final;
    bigNextBtn.textContent = 'Suivant 💖';
    bigNextBtn.classList.remove('final-mode');
  }
  moveButton();
  requestAnimationFrame(()=>{
    bigNextBtn.style.transition = 'opacity 0.4s ease-in-out';
    bigNextBtn.style.opacity = '1';
    bigNextBtn.style.pointerEvents = 'auto';
  });
}

function next(){
  if (busy) return;
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  idx++;
  if (idx < phrases.length){
    showPhrase(idx);
  } else {
    showFinal();
  }
  updateProgress();
}

function prev(){
  if (busy) return;
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  if (idx > 0){
    idx--;
    showPhrase(idx);
    updateProgress();
  }
}

function restart(){
  if (busy) return;
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  idx = 0;
  typingRunId++;
  showPhrase(idx);
  updateProgress();
}

function showFinal(){
  idx = Math.max(0, phrases.length - 1);
  phraseEl.classList.add('final-message');
  phraseEl.innerHTML = 'Joyeux anniversaire Elise !<br><div class="final-hearts" aria-hidden="true">💖💖💖</div>';
  if (bigNextBtn){
    bigNextBtn.dataset.final = 'true';
    bigNextBtn.textContent = 'Fêter 🎉';
    bigNextBtn.classList.add('final-mode');
    bigNextBtn.style.opacity = '1';
    bigNextBtn.style.pointerEvents = 'auto';
  }
  startParticles();
}

function initUI(){
  prevBtn = document.getElementById('prevBtn');
  bigNextBtn = document.getElementById('bigNextBtn');
  restartBtn = document.getElementById('restartBtn');
  autoBtn = document.getElementById('autoBtn');
  speedRange = document.getElementById('speedRange');
  progressBar = document.getElementById('progressBar');
  progressText = document.getElementById('progressText');

  if (bigNextBtn && bigNextBtn.parentElement && bigNextBtn.parentElement.id === 'card'){
    document.body.appendChild(bigNextBtn);
  }

  if (prevBtn) prevBtn.addEventListener('click', e=>{ e.stopPropagation(); prev(); });
  if (restartBtn) restartBtn.addEventListener('click', e=>{ e.stopPropagation(); restart(); });
  if (autoBtn){
    autoBtn.addEventListener('click', e=>{
      e.stopPropagation();
      autoplayEnabled = !autoplayEnabled;
      autoBtn.setAttribute('aria-pressed', autoplayEnabled ? 'true' : 'false');
      autoBtn.classList.toggle('active', autoplayEnabled);
      if (!autoplayEnabled && autoTimer){
        clearTimeout(autoTimer); autoTimer = null;
      } else if (autoplayEnabled && !busy){
        autoTimer = setTimeout(()=> next(), autoDelay);
      }
    });
  }
  if (speedRange){
    const applySpeed = ()=>{
      const min = Number(speedRange.min) || 10;
      const max = Number(speedRange.max) || 150;
      const value = Number(speedRange.value);
      typewriterSpeed = Math.max(5, (max + min) - value);
    };
    speedRange.addEventListener('input', applySpeed);
    applySpeed();
  }
  turboBtn = document.getElementById('turboBtn');
  if (turboBtn){
    turboBtn.addEventListener('click', e=>{
      e.stopPropagation();
      if (turboMultiplier === 1){
        turboMultiplier = 0.01;
        turboBtn.classList.add('active');
      } else {
        turboMultiplier = 1;
        turboBtn.classList.remove('active');
      }
    });
  }

  if (bigNextBtn){
    bigNextBtn.addEventListener('click', e=>{
      e.stopPropagation();
      if (bigNextBtn.dataset && bigNextBtn.dataset.final === 'true'){
        // final action goes to the actual final page
        window.location.href = 'final.html';
        return;
      }
      next();
    });
  }

  showPhrase(idx);
  moveButton();
  renderLoveBackground();
  updateProgress();
}

function updateProgress(){
  if (!progressBar || !progressText) return;
  const cur = Math.min(Math.max(0, idx), Math.max(0, phrases.length - 1));
  const pct = ((cur + 1) / phrases.length) * 100;
  progressBar.style.width = Math.min(100, pct) + '%';
  progressText.textContent = `${cur + 1} / ${phrases.length}`;
}

function moveButton(){
  if (!bigNextBtn) return;
  const rect = bigNextBtn.getBoundingClientRect();
  const btnWidth = Math.max(rect.width, 220);
  const btnHeight = Math.max(rect.height, 80);
  const margin = 60;

  const safeWidth = window.innerWidth - btnWidth - margin * 2;
  const safeHeight = window.innerHeight - btnHeight - margin * 2;

  if (safeWidth <= 0 || safeHeight <= 0){
    bigNextBtn.style.left = '50%';
    bigNextBtn.style.bottom = '24px';
    bigNextBtn.style.top = 'auto';
    bigNextBtn.style.transform = 'translateX(-50%)';
    return;
  }

  let x = margin + Math.random() * safeWidth;
  let y = margin + Math.random() * safeHeight;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const avoidRadius = 280;
  const dx = x + btnWidth/2 - centerX;
  const dy = y + btnHeight/2 - centerY;
  const distance = Math.sqrt(dx*dx + dy*dy);
  if (distance < avoidRadius){
    if (y < centerY){
      y = Math.max(margin, centerY - avoidRadius - btnHeight);
    } else {
      y = Math.min(window.innerHeight - btnHeight - margin, centerY + avoidRadius);
    }
  }
  const rotation = (Math.random()*12 - 6).toFixed(2) + 'deg';
  bigNextBtn.style.left = `${x}px`;
  bigNextBtn.style.top = `${y}px`;
  bigNextBtn.style.bottom = 'auto';
  bigNextBtn.style.setProperty('--rot', rotation);
}

// Fond "je t'aime"
function renderLoveBackground(){
  const existing = document.querySelector('.love-bg');
  if (existing) return;
  const container = document.createElement('div');
  container.className = 'love-bg';
  const frag = document.createDocumentFragment();
  const count = 30;
  for (let i=0;i<count;i++){
    const span = document.createElement('span');
    span.className = 'love-word';
    span.textContent = "je t'aime";
    const xPct = Math.random()*100;
    const yPct = Math.random()*100;
    span.style.left = `${xPct}%`;
    span.style.top = `${yPct}%`;
  span.style.fontSize = (0.85 + Math.random()*1.35)+'rem';
  span.style.opacity = (0.16 + Math.random()*0.24).toFixed(2);
    span.style.animationDelay = (Math.random()*18).toFixed(2)+'s';
    span.style.transform = `rotate(${(Math.random()*18-9).toFixed(2)}deg) scale(${(0.86 + Math.random()*0.24).toFixed(2)})`;
    frag.appendChild(span);
  }
  container.appendChild(frag);
  document.body.appendChild(container);
}

// Particules
const particles = [];
let running = false;

function rand(min,max){ return Math.random()*(max-min)+min; }

function createHeart(x, y){
  particles.push({ type:'heart', x, y, vx:rand(-0.3,0.3), vy:rand(-1.1,-0.4), life:rand(2200,4200), size:rand(10,24), t:0, rot:rand(-0.4,0.4) });
}

function createConfetti(x, y){
  const colors = ['#ffd6e0','#f6e7ff','#ffe9d6','#fef3c7','#f7d5f0'];
  particles.push({ type:'conf', x, y, vx:rand(-0.6,0.6), vy:rand(0.4,1.2), life:rand(4200,7200), size:rand(6,11), t:0, color: colors[Math.floor(Math.random()*colors.length)], rot:rand(-1,1) });
}

let lastTime = 0;
function tick(ts){
  if (!ctx) return;
  if (!lastTime) lastTime = ts;
  const dt = ts - lastTime;
  lastTime = ts;
  ctx.clearRect(0,0, innerWidth, innerHeight);
  for (let i = particles.length-1; i>=0; i--){
    const p = particles[i];
    p.t += dt;
    const lifeRatio = p.t / p.life;
    if (lifeRatio >= 1){ particles.splice(i,1); continue; }
    if (p.type === 'heart'){
      p.x += p.vx * (dt/16);
      p.y += p.vy * (dt/16);
      p.vy -= 0.002 * (dt/16);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + Math.sin(p.t/200)*0.08);
      const scale = 1 - lifeRatio*0.3;
      ctx.scale(scale, scale);
      const s = p.size;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 150, 185, ${1-lifeRatio})`;
      ctx.moveTo(0, -s/6);
      ctx.bezierCurveTo(-s/2, -s/2, -s, s/6, 0, s);
      ctx.bezierCurveTo(s, s/6, s/2, -s/2, 0, -s/6);
      ctx.fill();
      ctx.restore();
    } else {
      p.x += p.vx * (dt/16);
      p.y += p.vy * (dt/16);
      p.vy += 0.002 * (dt/16);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + p.t/600);
      ctx.globalAlpha = 1 - lifeRatio*0.6;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    }
  }
  if (running) requestAnimationFrame(tick);
}

function startParticles(){
  if (!ctx) return;
  running = true;
  const cx = innerWidth/2;
  const cy = innerHeight/2;
  for (let i=0;i<60;i++) setTimeout(()=> createHeart(rand(0, innerWidth), -rand(0,200)), i*24);
  for (let i=0;i<36;i++) setTimeout(()=> createHeart(cx + rand(-200,200), cy + rand(-60,140)), 800 + i*40);
  for (let i=0;i<70;i++) setTimeout(()=> createConfetti(rand(0,innerWidth), -10 + rand(-80,30)), i*60);
  requestAnimationFrame(tick);
}

setInterval(()=>{
  if (Math.random() < 0.35) createHeart(rand(40, innerWidth-40), innerHeight + 20);
}, 1300);

window.addEventListener('keydown', e=>{
  if (e.key === 'Enter'){
    e.preventDefault();
    if (bigNextBtn && bigNextBtn.dataset && bigNextBtn.dataset.final === 'true'){
      // final: follow the big button link
      window.location.href = 'final.html';
      return;
    }
    next();
  }
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

document.addEventListener('click', e=>{
  // Disable click-to-advance on the document level. Only allow clicks on controls or bigNextBtn.
  const target = e.target;
  if (target.closest && (target.closest('#controls') || target.closest('#bigNextBtn') || target.closest('.ctrl-btn'))) return;
  // otherwise ignore global clicks
  e.stopPropagation();
  e.preventDefault();
});

window.addEventListener('load', ()=>{
  initUI();
  document.body.tabIndex = -1;
  document.body.focus();
});

