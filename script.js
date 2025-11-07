/* script.js
   Contrôle l'affichage phrase par phrase, interactions Entrée/clic, effets sonores et particules.
   Le tableau `phrases` est facile à modifier. Chaque entrée peut être soit une string simple,
   soit un objet { text: '...', typewriter: true|false, important: ['mot1','mot2'] }
*/

// --- Texte modifiable: remplacer / ajouter des phrases ici ---
const phrases = [
  `Pour ma copine d'amour, Élise.`,
  `T'es vraiment la personne la plus importante pour moi, et jsuis tellement, tellement heureux de t’avoir trouvée.`,
  `T'es la première pensée qui me traverse la tête le matin, et la dernière quand jme couche.`,
  `Quand j’ai quelque chose de nv dans ma vie, c'est toujours toi la première personne à qui j’ai envie de le dire, et quand jpense à toi, j’ai ce sourire un peu bête.`,
  `Tu me rends tellement heureux, aussi t’es tlm attentionnée, douce (dans tous les sens du terme) et mignonne.`,
  `Même quand on se prend la tête, tu restes tjrs ma princesse d’amour, et je t’aimerai pour toujours.`,
  `J’adore à quel point t’es motivée, déterminée (ou inflexible, ou tête dure comme tu veux) dans ce que tu fais, et tu veux réussir, ce qui me rend fier d’être avec toi.`,
  `Aussi parce que t’es super belle (jsp si j'lai dit), et j’adore qu’on puisse rire de tout (ou presque).`,
  `Tu essaies même les trucs que j’aime, juste pour me faire plaisir, et tu me rends tellement heureux, jveux passer le reste de ma vie avec toi.`,
  `Quand jte regarde, jressens trop d’amour dans le ventre, et j’ai juste envie de t’embrasser.`,
  `T’es la meilleure copine que je pouvais rêver d’avoir, et jsuis super reconnaissant pour ces 8 mois qu’on a passés ensemble.`,
  `J’espère qu’il y en aura encore des dizaines d’autres, toujours avec toi, et je t’aime plus que tout.`,
  `- Yasser`
];
// -----------------------------------------------------------

const app = document.getElementById('app');
const phraseEl = document.getElementById('phrase');
const hint = document.getElementById('hint');
const canvas = document.getElementById('particles');
const ctx = canvas.getContext && canvas.getContext('2d');

let idx = 0;
let busy = false; // Empêche double-advancement
let soundEnabled = true;
let autoplayEnabled = false; // si true, avance automatiquement
let autoDelay = 3000; // ms
let autoTimer = null;
let typewriterSpeed = 45; // vitesse globale (modifiable par l'UI)

// Resize canvas to cover viewport
function resizeCanvas(){
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  if (ctx) ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
addEventListener('resize', resizeCanvas, {passive:true});
resizeCanvas();

// --- Son doux (ding) sans fichier : WebAudio ---
function playDing(){
  if (!soundEnabled) return;
  try{
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.value = 880; // fréquence aiguë douce
    g.gain.value = 0;
    o.connect(g);
    g.connect(ac.destination);

    const now = ac.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.08, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    o.start(now);
    o.stop(now + 0.7);

    // Fermer le context après un court délai
    setTimeout(()=>{ if (ac.close) ac.close(); }, 900);
  }catch(e){ /* fallback silencieux */ }
}

// --- Helper: mettre en évidence mots importants en enveloppant des <span class="important"> ---
function highlightImportant(text, importantWords){
  if (!importantWords || importantWords.length===0) return text;
  // Échapper regex
  importantWords.forEach(w=>{
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${esc})`, 'gi');
    text = text.replace(re, '<span class="important">$1</span>');
  });
  return text;
}

// --- Affiche la phrase indexée
function showPhrase(i){
  if (i < 0 || i >= phrases.length) return;
  busy = true;
  phraseEl.classList.remove('show-phrase');
  phraseEl.classList.remove('shaky');
  phraseEl.innerHTML = '';

  // Supporter string ou objet
  const entry = (typeof phrases[i] === 'string') ? { text: phrases[i], typewriter:false } : phrases[i];
  let html = entry.text;
  html = highlightImportant(html, entry.important || []);

  // Si machine à écrire demandée, écrire lettre par lettre
  if (entry.typewriter){
    // On efface puis on tape
    const text = entry.text;
    phraseEl.innerHTML = '';
    const words = text.split(' ');
    // We'll reveal letter by letter for the whole string
    let pos = 0;
    const total = text.length;
    const caret = document.createElement('span');
    caret.className = 'typewriter-caret';
    phraseEl.appendChild(caret);

  // Typing speed (ms per char). Controlled by global `typewriterSpeed` (UI modifiable)
  const speed = typeof typewriterSpeed === 'number' ? typewriterSpeed : 45;
    function step(){
      if (pos > total){
        // finished
        phraseEl.removeChild(caret);
        // replace text with highlighted HTML to keep important spans
        phraseEl.innerHTML = highlightImportant(text, entry.important || []);
        finishShow();
        return;
      }
      // Show substring
      const sub = text.slice(0,pos);
      phraseEl.innerHTML = sub.replace(/\n/g,'<br>');
      phraseEl.appendChild(caret);
      pos++;
      setTimeout(step, speed + Math.floor(Math.random()*18));
    }
    // Appliquer animation d'apparition sur le container (même si on tape)
    requestAnimationFrame(()=>{ phraseEl.classList.add('show-phrase'); });
    playDing();
    setTimeout(step, 120);
  } else {
    // Pas de typewriter: afficher tout de suite avec HTML (important words wrapped)
    phraseEl.innerHTML = html;
    // Petite variation: appliquer shaky aléatoire pour un effet mignon
    if (Math.random() < 0.45) phraseEl.classList.add('shaky');
    requestAnimationFrame(()=>{ phraseEl.classList.add('show-phrase'); });
    // Donner un petit ding et finir
    playDing();

    // Optionnel: faire pulser certains mots (déjà géré par .important animation)
    setTimeout(finishShow, 550);
  }

  function finishShow(){
    busy = false;
    // Si dernière phrase, lancer les effets finaux
    if (i === phrases.length - 1){
      setTimeout(triggerFinalEffects, 600);
    }
    // Si autoplay activé, lancer la prochaine phrase après autoDelay
    if (autoplayEnabled && i < phrases.length - 1){
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = setTimeout(()=>{
        next();
      }, autoDelay);
    }
  }
}

// Avancer à la phrase suivante (ou redémarrer si terminé)
function next(){
  if (busy) return;
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  idx++;
  if (idx < phrases.length){
    showPhrase(idx);
  } else {
    // Afficher le message final spécial
    showFinal();
  }
}

// Previous
function prev(){
  if (busy) return;
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  if (idx > 0){
    idx--;
    showPhrase(idx);
  }
}

// Replay current
function replay(){
  if (busy) return;
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  showPhrase(idx);
}

// Restart from beginning
function restart(){
  if (busy) return;
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  idx = 0;
  showPhrase(idx);
}

// Afficher le message final avec particules
function showFinal(){
  // Ensure idx points to last phrase
  idx = Math.max(0, phrases.length - 1);
  phraseEl.classList.remove('show-phrase');
  phraseEl.classList.add('final-message');
  phraseEl.innerHTML = 'Joyeux anniversaire Élise ! 💖';
  playDing();
  playFinalMelody();
  // Lancer particules coeurs + confettis
  startParticles();
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
}

// Déclenché après la dernière phrase (petit délai)
function triggerFinalEffects(){
  // mettre un petit effet de pulse sur le texte final
  // (lancement est fait par showFinal)
}

// Gérer interactions: Entrée et clic
addEventListener('keydown', (e)=>{
  if (e.key === 'Enter'){
    e.preventDefault();
    if (idx === -1) { idx = 0; showPhrase(0); return; }
    if (idx < phrases.length - 1) next();
    else if (idx === phrases.length - 1) next();
  }
  // flèches pour navigation
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

// Clic sur le document pour avancer
document.addEventListener('click', (e)=>{
  // Ignore clicks on controls (works in browsers without composedPath)
  const target = e.target;
  if (target.closest && target.closest('#controls')) return;
  if (idx < phrases.length - 1) next();
  else if (idx === phrases.length - 1) next();
});

// Initialisation: afficher la première phrase en attente d'action (ou afficher la première automatiquement)
// Par défaut on affiche la première phrase dès le chargement
idx = 0;
showPhrase(idx);

// Setup UI controls bindings
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const replayBtn = document.getElementById('replayBtn');
const soundBtn = document.getElementById('soundBtn');
const restartBtn = document.getElementById('restartBtn');
const autoToggle = document.getElementById('autoToggle');
const speedRange = document.getElementById('speedRange');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

function updateProgress(){
  // clamp to last index for display (idx may briefly exceed last during transition)
  const cur = Math.min(Math.max(0, idx), Math.max(0, phrases.length - 1));
  const pct = ((cur + 1) / phrases.length) * 100;
  if (progressBar) progressBar.style.width = Math.min(100, pct) + '%';
  if (progressText) progressText.textContent = `${cur + 1} / ${phrases.length}`;
}
updateProgress();

if (prevBtn) prevBtn.addEventListener('click', (e)=>{ e.stopPropagation(); prev(); updateProgress(); });
if (nextBtn) nextBtn.addEventListener('click', (e)=>{ e.stopPropagation(); next(); updateProgress(); });
if (replayBtn) replayBtn.addEventListener('click', (e)=>{ e.stopPropagation(); replay(); updateProgress(); });
if (restartBtn) restartBtn.addEventListener('click', (e)=>{ e.stopPropagation(); restart(); updateProgress(); });
if (soundBtn) soundBtn.addEventListener('click', (e)=>{
  e.stopPropagation(); soundEnabled = !soundEnabled;
  soundBtn.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
  soundBtn.textContent = soundEnabled ? '🔔' : '🔕';
});
if (autoToggle) autoToggle.addEventListener('change', (e)=>{ autoplayEnabled = !!autoToggle.checked; if (autoTimer) clearTimeout(autoTimer); if (autoplayEnabled){ /* schedule next if idle */ }});
if (speedRange) speedRange.addEventListener('input', (e)=>{ typewriterSpeed = Number(speedRange.value); });

// Update progress after each shown phrase (hook into finishShow by wrapping showPhrase)
const originalShowPhrase = showPhrase;
showPhrase = function(i){
  originalShowPhrase(i);
  setTimeout(updateProgress, 50);
};

// Final melody for celebration
function playFinalMelody(){
  if (!soundEnabled) return;
  try{
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const now = ac.currentTime;
    const notes = [880, 988, 1047, 988, 880];
    const dur = 0.22;
    notes.forEach((f, i)=>{
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      o.connect(g);
      g.connect(ac.destination);
      const t = now + i * (dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
    setTimeout(()=>{ if (ac.close) ac.close(); }, (notes.length*dur + 300));
  }catch(e){ }
}

// ---------------- Particules: coeurs + confettis pastel ----------------
// Simple moteur de particules canvas: on crée deux types: hearts (float up) et confetti (falling)

const particles = [];
let running = false;

function rand(min,max){ return Math.random()*(max-min)+min }

function createHeart(x, y){
  const s = rand(10,26);
  particles.push({ type:'heart', x, y, vx:rand(-0.3,0.3), vy:rand(-1.2,-0.4), life:rand(2200,4200), size:s, t:0, rot:rand(-0.4,0.4) });
}
function createConfetti(x, y){
  const s = rand(6,12);
  const colors = ['#ffd6e0','#f6e7ff','#ffe9d6','#fef3c7','#f7d5f0'];
  particles.push({ type:'conf', x, y, vx:rand(-0.6,0.6), vy:rand(0.4,1.2), life:rand(4200,7200), size:s, t:0, color: colors[Math.floor(Math.random()*colors.length)], rot:rand(-1,1) });
}

let lastTime = 0;
function tick(ts){
  if (!lastTime) lastTime = ts;
  const dt = ts - lastTime;
  lastTime = ts;
  ctx.clearRect(0,0, innerWidth, innerHeight);
  const now = performance.now();
  for (let i = particles.length-1; i>=0; i--){
    const p = particles[i];
    p.t += dt;
    const lifeRatio = p.t / p.life;
    if (lifeRatio >= 1){ particles.splice(i,1); continue; }
    if (p.type === 'heart'){
      // Heart floats up, fades
      p.x += p.vx * (dt/16);
      p.y += p.vy * (dt/16);
      p.vy -= 0.002 * (dt/16); // slight acceleration up
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + Math.sin(p.t/200)*0.08);
      const scale = 1 - lifeRatio*0.3;
      ctx.scale(scale, scale);
      // draw simple heart path
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, 0);
      ctx.fillStyle = `rgba(255, 150, 185, ${1-lifeRatio})`;
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 6;
      ctx.moveTo(0, -s/6);
      ctx.bezierCurveTo(-s/2, -s/2, -s, s/6, 0, s);
      ctx.bezierCurveTo(s, s/6, s/2, -s/2, 0, -s/6);
      ctx.fill();
      ctx.restore();
    } else {
      // confetti falling
      p.x += p.vx * (dt/16);
      p.y += p.vy * (dt/16);
      p.vy += 0.002 * (dt/16);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + p.t/600);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 1 - lifeRatio*0.6;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    }
  }
  if (running) requestAnimationFrame(tick);
}

function startParticles(){
  if (!ctx) return;
  running = true;
  // burst of hearts and confetti from center top
  const cx = innerWidth/2, cy = innerHeight/2;
  for (let i=0;i<26;i++){
    setTimeout(()=> createHeart(cx + rand(-140,140), cy + rand(-40,120)), i*40);
  }
  for (let i=0;i<40;i++){
    setTimeout(()=> createConfetti(rand(0,innerWidth), -10 + rand(-60,20)), i*60);
  }
  requestAnimationFrame(tick);
}

// Optionnel: un petit effet continu léger (quelques coeurs qui montent doucement)
setInterval(()=>{
  if (Math.random() < 0.35) createHeart(rand(40, innerWidth-40), innerHeight + 20);
}, 1200);

// Accessibility: mettre le focus sur le document pour capter Entrée
window.onload = ()=>{ document.body.tabIndex = -1; document.body.focus(); };

/*
  Commentaires pour maintenance:
  - Pour ajouter/retirer la machine à écrire, modifiez la propriété "typewriter" pour la phrase cible dans le tableau `phrases`.
  - Pour changer les mots qui pulsent, ajoutez-les au tableau "important" pour chaque phrase. Les mots sont comparés en insensible à la casse.
  - Pour changer la vitesse du ding, modifiez la configuration dans playDing() (freq & envelope).
  - Pour ajuster les particules: jouer avec createHeart/createConfetti et les timings dans startParticles().
*/
