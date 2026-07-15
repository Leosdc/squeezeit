const canvas = document.getElementById('stressBall');
const ctx = canvas.getContext('2d');
const canvasFrame = document.getElementById('canvasFrame');

let currentMode = 'classic';
let soundEnabled = true;
let audioCtx = null;
let bubbleGridSize = 6;
let knifeMode = false;
let currentLang = localStorage.getItem('sq_lang') || 'pt';

const stats = {
  pressCount: parseInt(localStorage.getItem('sq_pressCount') || '0'),
  maxForce: parseInt(localStorage.getItem('sq_maxForce') || '0'),
  satisfaction: 0,
  maxSatisfactionTime: 0,
  bubblesPopped: parseInt(localStorage.getItem('sq_bubblesPopped') || '0'),
  achievements: JSON.parse(localStorage.getItem('sq_achievements') || '[]')
};

const KNIFE_UNLOCKED_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.8 3a3.8 3.8 0 0 0-5.4 0L4.1 12.3a2 2 0 0 0-.5 1l-.5 4.6a1 1 0 0 0 1.1 1.1l4.6-.5a2 2 0 0 0 1-.5L18.8 8.4a3.8 3.8 0 0 0 0-5.4Z"/><path d="M14.5 7.3 16.7 9.5"/><path d="M8.8 13.0 11.0 15.2"/></svg>`;

const ACHIEVEMENTS = {
  'first-press': { 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` 
  },
  'force-100': { 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>` 
  },
  'satisfaction-100': { 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9Zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6a5.978 5.978 0 0 1 4.14 1.66A9.03 9.03 0 0 0 12 17Z"/><path d="M16 4h4v2l-3.3 4h3.3v2h-6v-2l3.3-4h-3.3Z"/></svg>` 
  },
  'slime-unlocked': { 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` 
  },
  'bubbles-cleared': { 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="2"/><circle cx="15" cy="14" r="3"/><circle cx="15" cy="8" r="1"/></svg>` 
  },
  'knife-kill': { 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` 
  }
};

const TRANSLATIONS = {
  pt: {
    modes: {
      classic: 'Borracha',
      slime: 'Slime',
      bubble: 'Plástico'
    },
    gridSize: 'Tamanho da Grade',
    relaxationLevel: 'Nível de Relaxamento',
    squeezes: 'Apertos',
    maxForce: 'Força Máx',
    mood: 'Foco',
    achievements: 'Conquistas',
    soundOn: 'Som: On',
    soundOff: 'Som: Off',
    reset: 'Resetar',
    
    achList: {
      'first-press': { title: '1º Aperto', desc: 'Iniciou sua jornada anti-estresse!' },
      'force-100': { title: 'Super Força', desc: 'Apertou com força máxima!' },
      'satisfaction-100': { title: 'Soneca', desc: 'Deixou a bolinha tirar um cochilo por 10s!' },
      'slime-unlocked': { title: 'Alquimia', desc: 'Desbloqueou o modo Slime!' },
      'bubbles-cleared': { title: 'Estourador', desc: 'Estourou todas as bolhas da grade!' },
      'knife-kill': { title: '???', desc: '???' },
      'knife-kill-unlocked': { title: 'Estressado', desc: 'Você furou a bolinha com a faca secreta!' }
    },
    toasts: {
      ready: 'Pronto para relaxar',
      regenerating: 'Regenerando bolhas...',
      regenerated: 'Bolinha regenerada!',
      stab: 'Acho que você deveria ir relaxar...',
      peace: 'A paz foi restaurada!',
      soundOn: 'Sons ativados',
      soundOff: 'Sons desativados',
      policeLeft: 'A viatura foi embora.',
      knifeAway: 'Faca guardada',
      huntStart: '🔪 Caça iniciada! Pegue a bolinha!',
      detained: '🚨 O estressado foi detido!',
      sleep: '💤 Shhh... A bolinha dormiu!',
      wake: 'Bolinha acordou!',
      resetSuccess: 'Progresso reiniciado!'
    },
    moods: {
      satisfied: 'Satisfeito',
      focused: 'Focado',
      panic: 'Pânico',
      deflated: 'Murcho',
      reporting: 'Denunciando',
      cornered: 'Encurralado',
      scared: 'Assustado',
      superZen: 'Super Zen',
      zen: 'Zen',
      relaxed: 'Relaxado',
      calm: 'Calmo',
      sleeping: 'Dormindo'
    },
    policeFail: 'É, a gente tentou...'
  },
  en: {
    modes: {
      classic: 'Rubber',
      slime: 'Slime',
      bubble: 'Plastic'
    },
    gridSize: 'Grid Size',
    relaxationLevel: 'Relaxation Level',
    squeezes: 'Squeezes',
    maxForce: 'Max Force',
    mood: 'Mood',
    achievements: 'Achievements',
    soundOn: 'Sound: On',
    soundOff: 'Sound: Off',
    reset: 'Reset',
    
    achList: {
      'first-press': { title: '1st Squeeze', desc: 'Began your stress-free journey!' },
      'force-100': { title: 'Super Strength', desc: 'Squeezed with maximum force!' },
      'satisfaction-100': { title: 'Nap Time', desc: 'Let the ball take a nap for 10s!' },
      'slime-unlocked': { title: 'Alchemy', desc: 'Unlocked Slime mode!' },
      'bubbles-cleared': { title: 'Popper', desc: 'Popped all bubbles in the grid!' },
      'knife-kill': { title: '???', desc: '???' },
      'knife-kill-unlocked': { title: 'Stressed', desc: 'You stabbed the ball with the secret knife!' }
    },
    toasts: {
      ready: 'Ready to relax',
      regenerating: 'Regenerating bubbles...',
      regenerated: 'Ball regenerated!',
      stab: 'I think you should go relax...',
      peace: 'Peace has been restored!',
      soundOn: 'Sound enabled',
      soundOff: 'Sound disabled',
      policeLeft: 'The police vehicle left.',
      knifeAway: 'Knife put away',
      huntStart: '🔪 Hunt started! Catch the ball!',
      detained: '🚨 The stressed one has been detained!',
      sleep: '💤 Shhh... The ball fell asleep!',
      wake: 'Ball woke up!',
      resetSuccess: 'Progress reset!'
    },
    moods: {
      satisfied: 'Satisfied',
      focused: 'Focused',
      panic: 'Panic',
      deflated: 'Deflated',
      reporting: 'Reporting',
      cornered: 'Cornered',
      scared: 'Scared',
      superZen: 'Super Zen',
      zen: 'Zen',
      relaxed: 'Relaxed',
      calm: 'Calm',
      sleeping: 'Sleeping'
    },
    policeFail: 'Well, we tried...'
  }
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  baseRadius: 75,
  radius: 75,
  points: [],
  numPoints: 24,
  kSpring: 0.15,
  kDamping: 0.78,
  hue: 200,
  glitters: [],
  eyeBlinkTimer: 0,
  eyeScaleY: 1,
  pressStrength: 0,
  peakPressStrength: 0,
  
  // Estado Easter Egg
  isPunctured: false,
  isScared: false,
  isCornered: false,
  panicFactor: 0,
  vx: 0,
  vy: 0,
  respawnTimer: 0,
  
  isCallingPolice: false,
  lastKnifeMoveTime: 0,
  isSleeping: false,
  sleepDuration: 0,
  lastUserInteractionTime: Date.now()
};

let particles = [];

const policeState = {
  active: false,
  carX: -200,
  carY: 0,
  carTargetX: 70,
  officers: [],
  capturing: false,
  capturedPointerX: 0,
  capturedPointerY: 0,
  exitTimer: 0,
  sireneTicks: 0,
  sireneColor: '#ef4444',
  failed: false,
  failTimer: 0
};

let pointer = {
  x: ball.x,
  y: ball.y,
  isDown: false
};

const bubbleWrap = {
  bubbles: [],
  spacing: 42,
  radius: 14
};

function initBallPoints() {
  ball.points = [];
  for (let i = 0; i < ball.numPoints; i++) {
    const angle = (i / ball.numPoints) * Math.PI * 2;
    ball.points.push({
      angle: angle,
      targetX: Math.cos(angle) * ball.baseRadius,
      targetY: Math.sin(angle) * ball.baseRadius,
      x: Math.cos(angle) * ball.baseRadius,
      y: Math.sin(angle) * ball.baseRadius,
      vx: 0,
      vy: 0
    });
  }

  ball.glitters = [];
  for (let i = 0; i < 25; i++) {
    ball.glitters.push({
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 0.7,
      size: Math.random() * 2.5 + 1,
      color: `hsl(${200 + Math.random() * 60}, 90%, 75%)`,
      offsetAngle: Math.random() * Math.PI * 2
    });
  }
}

function initBubbleWrap() {
  bubbleWrap.bubbles = [];
  const N = bubbleGridSize;
  
  const usableWidth = canvas.width - 50; 
  const spacing = N > 1 ? (usableWidth / (N - 1)) : 0;
  bubbleWrap.spacing = spacing;
  
  const calcRadius = N > 1 ? (spacing * 0.40) : 40;
  bubbleWrap.radius = Math.max(8, Math.min(22, calcRadius));

  const startX = N > 1 ? (canvas.width - (N - 1) * spacing) / 2 : canvas.width / 2;
  const startY = N > 1 ? (canvas.height - (N - 1) * spacing) / 2 : canvas.height / 2;

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = startX + c * spacing;
      const y = startY + r * spacing;
      const dx = x - canvas.width / 2;
      const dy = y - canvas.height / 2;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const delay = Math.round(dist * 0.16);

      bubbleWrap.bubbles.push({
        x: x,
        y: y,
        popped: false,
        scale: 0,
        vScale: 0,
        delay: delay
      });
    }
  }
}

function changeGridSize(size) {
  bubbleGridSize = size;
  document.querySelectorAll('.grid-opt-btn').forEach(btn => btn.classList.remove('active'));
  
  const optButtons = document.querySelectorAll('.grid-opt-btn');
  if (size === 4) optButtons[0].classList.add('active');
  else if (size === 6) optButtons[1].classList.add('active');
  else if (size === 8) optButtons[2].classList.add('active');
  else if (size === 10) optButtons[3].classList.add('active');

  initBubbleWrap();
  showToast(`Grade ${size}x${size}`);
}

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSoundEffect(type, param = 1) {
  if (!soundEnabled) return;
  initAudio();
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const dest = audioCtx.destination;
  const now = audioCtx.currentTime;

  if (type === 'press') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    
    const startFreq = 200 + param * 30;
    const endFreq = 380 + param * 50;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gainNode);
    gainNode.connect(dest);
    
    osc.start(now);
    osc.stop(now + 0.12);

  } else if (type === 'release') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

    gainNode.gain.setValueAtTime(0.02, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gainNode);
    gainNode.connect(dest);
    
    osc.start(now);
    osc.stop(now + 0.08);

  } else if (type === 'slime-squish') {
    const bufferSize = audioCtx.sampleRate * 0.12;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700 + param * 100, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    filter.Q.value = 5;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    noise.start(now);

  } else if (type === 'pop') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.03);

    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    const highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(250, now);

    osc.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(dest);

    osc.start(now);
    osc.stop(now + 0.03);
  } else if (type === 'shwing') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle';
    
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(1300, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.32);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.10, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gainNode);
    gainNode.connect(dest);
    
    osc.start(now);
    osc.stop(now + 0.32);
  } else if (type === 'stab') {
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1300, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.15);
    filter.Q.value = 5;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.16, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);
    noise.start(now);

    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
    oscGain.gain.setValueAtTime(0.12, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

function createParticles(x, y, color, count = 8, speedFactor = 1) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = (Math.random() * 3 + 1.5) * speedFactor;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 0.5,
      size: Math.random() * 3.5 + 1.5,
      color: color,
      alpha: 0.9,
      decay: Math.random() * 0.03 + 0.02,
      gravity: 0.1
    });
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
}

function unlockAchievement(id) {
  if (stats.achievements.includes(id)) return;

  stats.achievements.push(id);
  localStorage.setItem('sq_achievements', JSON.stringify(stats.achievements));
  updateAchievementsUI();

  if (navigator.vibrate) {
    navigator.vibrate(60);
  }

  if (soundEnabled) {
    playSoundEffect('achievement');
  }

  const achievement = ACHIEVEMENTS[id];
  const lang = TRANSLATIONS[currentLang];
  const popup = document.getElementById('achievementPopup');
  const popupIcon = document.getElementById('popupIcon');
  
  if (id === 'knife-kill') {
    popupIcon.innerHTML = KNIFE_UNLOCKED_ICON;
    document.getElementById('popupTitle').textContent = lang.achList['knife-kill-unlocked'].title;
    document.getElementById('popupDesc').textContent = lang.achList['knife-kill-unlocked'].desc;
  } else {
    popupIcon.innerHTML = achievement.icon;
    document.getElementById('popupTitle').textContent = lang.achList[id].title;
    document.getElementById('popupDesc').textContent = lang.achList[id].desc;
  }

  popup.classList.add('show');
  setTimeout(() => {
    popup.classList.remove('show');
  }, 3500);
}

function updateAchievementsUI() {
  const keys = Object.keys(ACHIEVEMENTS);
  let count = 0;
  const lang = TRANSLATIONS[currentLang];
  
  keys.forEach(key => {
    const badge = document.getElementById(`badge-${key}`);
    const iconDiv = document.getElementById(`icon-${key}`);
    const titleSpan = document.getElementById(`title-${key}`);
    if (!badge || !iconDiv || !titleSpan) return;
    
    let info = ACHIEVEMENTS[key];
    let txt = lang.achList[key];
    
    if (stats.achievements.includes(key)) {
      badge.classList.add('unlocked');
      count++;
      
      if (key === 'knife-kill') {
        titleSpan.textContent = lang.achList['knife-kill-unlocked'].title;
        iconDiv.innerHTML = KNIFE_UNLOCKED_ICON;
      } else {
        titleSpan.textContent = txt.title;
        iconDiv.innerHTML = info.icon;
      }
    } else {
      badge.classList.remove('unlocked');
      titleSpan.textContent = txt.title;
      iconDiv.innerHTML = info.icon;
    }
  });

  document.getElementById('unlockedRatio').textContent = `${count}/6`;
}

function getMoodText() {
  const moods = TRANSLATIONS[currentLang].moods;
  if (currentMode === 'bubble') {
    const unpopped = bubbleWrap.bubbles.filter(b => !b.popped).length;
    if (unpopped === 0) return moods.satisfied;
    return moods.focused;
  }

  if (ball.isPunctured) return moods.panic;
  if (ball.respawnTimer > 0) return moods.deflated;
  if (ball.isSleeping) return moods.sleeping;
  if (ball.isCallingPolice) return moods.reporting;
  if (ball.isCornered) return moods.cornered;
  if (ball.isScared) return moods.scared;

  if (stats.satisfaction >= 90) return moods.superZen;
  if (stats.satisfaction >= 60) return moods.zen;
  if (stats.satisfaction >= 30) return moods.relaxed;
  return moods.calm;
}

function toggleAudio() {
  soundEnabled = !soundEnabled;
  const audioBtn = document.getElementById('audioBtn');
  const dict = TRANSLATIONS[currentLang];
  
  const onIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  const offIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
  
  audioBtn.innerHTML = (soundEnabled ? onIcon : offIcon) + ' ' + (soundEnabled ? dict.soundOn : dict.soundOff);
  showToast(soundEnabled ? dict.toasts.soundOn : dict.toasts.soundOff);
}

let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('infoToast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function resetStats() {
  const confirmMsg = currentLang === 'pt' ? 'Deseja reiniciar suas estatísticas e conquistas?' : 'Do you want to reset your statistics and achievements?';
  if (confirm(confirmMsg)) {
    stats.pressCount = 0;
    stats.maxForce = 0;
    stats.satisfaction = 0;
    stats.bubblesPopped = 0;
    stats.achievements = [];
    
    localStorage.removeItem('sq_pressCount');
    localStorage.removeItem('sq_maxForce');
    localStorage.removeItem('sq_bubblesPopped');
    localStorage.removeItem('sq_achievements');
    
    updateAchievementsUI();
    initBubbleWrap();
    showToast(TRANSLATIONS[currentLang].toasts.resetSuccess);
  }
}

function expandCanvasToFullScreen() {
  const rect = canvas.getBoundingClientRect();
  
  ball.x = rect.left + rect.width / 2;
  ball.y = rect.top + rect.height / 2;

  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'auto';
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function shrinkCanvasToNormal() {
  canvas.style.position = '';
  canvas.style.left = '';
  canvas.style.top = '';
  canvas.style.width = '';
  canvas.style.height = '';
  canvas.style.zIndex = '';
  canvas.style.pointerEvents = '';
  
  canvas.width = 280;
  canvas.height = 280;

  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = 0;
  ball.vy = 0;
}

function toggleKnifeMode() {
  if (ball.isPunctured || ball.respawnTimer > 0 || currentMode === 'bubble') return;

  knifeMode = !knifeMode;
  const dict = TRANSLATIONS[currentLang];
  
  if (knifeMode) {
    playSoundEffect('shwing');
    canvas.style.cursor = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' style='font-size:24px'><text y='24'>🔪</text></svg>\") 0 24, pointer";
    
    expandCanvasToFullScreen();
    ball.lastKnifeMoveTime = Date.now();
    ball.isCallingPolice = false;
    
    showToast(dict.toasts.huntStart);
  } else {
    shrinkCanvasToNormal();
    showToast(dict.toasts.knifeAway);
  }
}

function switchMode(mode) {
  if (currentMode === mode) return;

  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  
  const bubbleSettings = document.getElementById('bubbleSettings');
  const dict = TRANSLATIONS[currentLang];
  let modeName = '';
  
  if (knifeMode) {
    knifeMode = false;
    shrinkCanvasToNormal();
    showToast(dict.toasts.knifeAway);
  }
  
  if (mode === 'classic') {
    document.querySelectorAll('.mode-btn')[0].classList.add('active');
    bubbleSettings.style.display = 'none';
    ball.kSpring = 0.15;
    ball.kDamping = 0.78;
    ball.baseRadius = 75;
    canvas.style.cursor = 'grab';
    modeName = dict.modes.classic;

    canvasFrame.style.borderRadius = '50%';
    canvasFrame.style.background = 'radial-gradient(circle at center, #ffffff 0%, #f9fafb 70%)';
    canvasFrame.style.border = '1px solid rgba(0, 0, 0, 0.02)';

  } else if (mode === 'slime') {
    document.querySelectorAll('.mode-btn')[1].classList.add('active');
    bubbleSettings.style.display = 'none';
    ball.kSpring = 0.05;
    ball.kDamping = 0.92;
    ball.baseRadius = 70;
    canvas.style.cursor = 'grab';
    modeName = dict.modes.slime;
    unlockAchievement('slime-unlocked');

    canvasFrame.style.borderRadius = '50%';
    canvasFrame.style.background = 'radial-gradient(circle at center, #ffffff 0%, #f9fafb 70%)';
    canvasFrame.style.border = '1px solid rgba(0, 0, 0, 0.02)';

  } else if (mode === 'bubble') {
    document.querySelectorAll('.mode-btn')[2].classList.add('active');
    bubbleSettings.style.display = 'flex';
    canvas.style.cursor = 'pointer';
    initBubbleWrap();
    modeName = dict.modes.bubble;

    canvasFrame.style.borderRadius = 'var(--radius-lg)';
    canvasFrame.style.background = '#f9f9fb';
    canvasFrame.style.border = '1px solid rgba(0, 0, 0, 0.05)';
  }

  showToast(modeName);
  particles = [];
  pointer.isDown = false;
}

function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function punctureBall(clickX, clickY) {
  if (ball.isPunctured || ball.respawnTimer > 0) return;
  
  if (canvas.style.position !== 'fixed') {
    expandCanvasToFullScreen();
  }
  
  ball.isPunctured = true;
  ball.vx = (Math.random() - 0.5) * 12;
  ball.vy = -8;
  playSoundEffect('stab');
  unlockAchievement('knife-kill');
  createParticles(clickX, clickY, 'rgba(255, 100, 100, 0.8)', 20, 1.3);
  pointer.isDown = false;
  
  if (policeState.active) {
    policeState.failed = true;
    policeState.failTimer = 0;
  } else {
    showToast(TRANSLATIONS[currentLang].toasts.stab);
  }
}

function wakeBall() {
  ball.lastUserInteractionTime = Date.now();
  if (ball.isSleeping) {
    ball.isSleeping = false;
    ball.sleepDuration = 0;
    
    // Partículas de travesseiro
    createParticles(ball.x, ball.y, 'rgba(243, 244, 246, 0.95)', 15, 0.7);
    playSoundEffect('release');
    showToast(TRANSLATIONS[currentLang].toasts.wake);
  }
}

function handlePointerDown(e) {
  wakeBall();
  const pos = getPointerPos(e);
  pointer.x = pos.x;
  pointer.y = pos.y;
  pointer.isDown = true;

  if (currentMode === 'bubble') {
    let poppedAny = false;
    bubbleWrap.bubbles.forEach(b => {
      if (!b.popped && b.scale >= 0.8) {
        const dx = pos.x - b.x;
        const dy = pos.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < bubbleWrap.radius + 2) {
          b.popped = true;
          b.scale = 1.25;
          poppedAny = true;
          stats.bubblesPopped++;
          localStorage.setItem('sq_bubblesPopped', stats.bubblesPopped);
          
          playSoundEffect('pop');
          createParticles(b.x, b.y, 'rgba(0, 0, 0, 0.08)', 6, 0.6);
          
          if (navigator.vibrate) {
            navigator.vibrate(6);
          }
        }
      }
    });

    if (poppedAny) {
      const unpopped = bubbleWrap.bubbles.filter(b => !b.popped).length;
      if (unpopped === 0) {
        unlockAchievement('bubbles-cleared');
        showToast(TRANSLATIONS[currentLang].toasts.regenerating);
        setTimeout(initBubbleWrap, 800);
      }
    }
    return;
  }

  const dx = pos.x - ball.x;
  const dy = pos.y - ball.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (ball.isPunctured || ball.respawnTimer > 0) return;

  if (dist < ball.radius + 15) {
    if (knifeMode) {
      punctureBall(pos.x, pos.y);
      return;
    }

    const initialStrength = Math.max(0.22, 1.0 - (dist / (ball.baseRadius * 1.3)));
    ball.pressStrength = initialStrength * 0.45;
    ball.peakPressStrength = ball.pressStrength;

    if (currentMode === 'classic') {
      playSoundEffect('press', 0.2);
    } else {
      playSoundEffect('slime-squish', 0.2);
    }

    ball.points.forEach(p => {
      const ptWorldX = ball.x + p.x;
      const ptWorldY = ball.y + p.y;
      const pDist = Math.sqrt((pos.x - ptWorldX)**2 + (pos.y - ptWorldY)**2);
      if (pDist < 50) {
        p.vx -= Math.cos(p.angle) * 12;
        p.vy -= Math.sin(p.angle) * 12;
      }
    });
  }
}

function handlePointerMove(e) {
  const pos = getPointerPos(e);

  if (policeState.active && policeState.capturing) {
    return;
  }

  const dxMove = pos.x - pointer.x;
  const dyMove = pos.y - pointer.y;
  const moveDist = Math.sqrt(dxMove*dxMove + dyMove*dyMove);

  // Só acorda se houver movimento físico maior que 1.2px (evita disparos contínuos fantasmas de mousemove)
  if (moveDist > 1.2) {
    wakeBall();
  }

  pointer.x = pos.x;
  pointer.y = pos.y;

  if (knifeMode) {
    if (!policeState.active) {
      ball.lastKnifeMoveTime = Date.now();
      if (ball.isCallingPolice) {
        ball.isCallingPolice = false;
      }
    }
  }

  if (!pointer.isDown || currentMode === 'bubble' || ball.isPunctured || ball.respawnTimer > 0) return;

  const dx = pos.x - ball.x;
  const dy = pos.y - ball.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist < ball.radius + 40) {
    ball.points.forEach(p => {
      const ptWorldX = ball.x + p.x;
      const ptWorldY = ball.y + p.y;
      const mouseToPtX = ptWorldX - pos.x;
      const mouseToPtY = ptWorldY - pos.y;
      const mouseToPtDist = Math.sqrt(mouseToPtX*mouseToPtX + mouseToPtY*mouseToPtY);

      if (mouseToPtDist < 45) {
        const pushFactor = (1 - mouseToPtDist / 45) * 7.5;
        p.vx += Math.cos(p.angle) * -pushFactor;
        p.vy += Math.sin(p.angle) * -pushFactor;

        const oppIdx = (ball.points.indexOf(p) + Math.round(ball.numPoints / 2)) % ball.numPoints;
        const oppPt = ball.points[oppIdx];
        oppPt.vx += Math.cos(oppPt.angle) * (pushFactor * 0.45);
        oppPt.vy += Math.sin(oppPt.angle) * (pushFactor * 0.45);
      }
    });

    if (Math.random() < 0.1) {
      if (currentMode === 'classic') {
        playSoundEffect('press', Math.min(1.0, dist / ball.radius));
      } else {
        playSoundEffect('slime-squish', Math.min(1.0, dist / ball.radius));
      }
    }
  }
}

function handlePointerUp() {
  wakeBall();
  if (!pointer.isDown || ball.isPunctured || ball.respawnTimer > 0) {
    pointer.isDown = false;
    return;
  }
  pointer.isDown = false;

  if (currentMode === 'bubble') return;

  let totalDeformation = 0;
  ball.points.forEach(p => {
    const idealX = Math.cos(p.angle) * ball.baseRadius;
    const idealY = Math.sin(p.angle) * ball.baseRadius;
    const def = Math.sqrt((p.x - idealX)**2 + (p.y - idealY)**2);
    totalDeformation += def;
  });

  const avgDeformation = totalDeformation / ball.numPoints;
  
  const geometricForce = avgDeformation * 5.5;
  const peakForce = (ball.peakPressStrength || 0) * 100;
  const forcePct = Math.min(100, Math.round(Math.max(geometricForce, peakForce)));

  if (forcePct > 10) {
    stats.pressCount++;
    localStorage.setItem('sq_pressCount', stats.pressCount);
    
    stats.satisfaction = Math.min(100, stats.satisfaction + forcePct * 0.5);
    
    if (forcePct > stats.maxForce) {
      stats.maxForce = forcePct;
      localStorage.setItem('sq_maxForce', stats.maxForce);
    }

    if (currentMode === 'classic') {
      playSoundEffect('release');
    } else {
      playSoundEffect('slime-squish', 0.6);
    }

    const color = currentMode === 'classic' 
      ? `hsl(${ball.hue}, 95%, 85%)` 
      : `rgba(167, 139, 250, 0.4)`;
    createParticles(ball.x, ball.y, color, Math.round(forcePct / 10), forcePct / 100);

    unlockAchievement('first-press');
    if (forcePct >= 100) {
      unlockAchievement('force-100');
    }

    const returnImpulse = Math.max(avgDeformation * 0.45, (ball.peakPressStrength || 0) * 6.5);
    ball.points.forEach(p => {
      p.vx += Math.cos(p.angle) * returnImpulse;
      p.vy += Math.sin(p.angle) * returnImpulse;
    });
  }

  ball.peakPressStrength = 0;
}

let currentPressAngle = 0;
let currentPressDist = 0;

function updatePhysics() {
  // Controle de Inatividade e Sono no modo clássico/slime
  if (!knifeMode && !pointer.isDown && !ball.isPunctured && ball.respawnTimer === 0) {
    const idleTime = Date.now() - ball.lastUserInteractionTime;
    if (idleTime > 10000) { // 10 segundos inativo
      if (!ball.isSleeping) {
        ball.isSleeping = true;
        ball.sleepDuration = 0;
        showToast(TRANSLATIONS[currentLang].toasts.sleep);
      }
      ball.sleepDuration += 16.67;
      
      // Se dormir por 10s contínuos, ganha a conquista!
      if (ball.sleepDuration >= 10000) {
        unlockAchievement('satisfaction-100');
      }
    } else {
      if (ball.isSleeping) {
        ball.isSleeping = false;
        ball.sleepDuration = 0;
        createParticles(ball.x, ball.y, 'rgba(243, 244, 246, 0.95)', 15, 0.7);
        playSoundEffect('release');
        showToast(TRANSLATIONS[currentLang].toasts.wake);
      }
    }

    if (ball.isSleeping) {
      // Atrai suavemente para o centro do Canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ball.x += (centerX - ball.x) * 0.08;
      ball.y += (centerY - ball.y) * 0.08;
      ball.vx *= 0.8;
      ball.vy *= 0.8;
    }
  } else {
    if (ball.isSleeping) {
      ball.isSleeping = false;
      ball.sleepDuration = 0;
      createParticles(ball.x, ball.y, 'rgba(243, 244, 246, 0.95)', 15, 0.7);
      showToast(TRANSLATIONS[currentLang].toasts.wake);
    }
    ball.lastUserInteractionTime = Date.now();
  }

  // Decaimento clássico de satisfação
  stats.satisfaction = Math.max(0, stats.satisfaction - 0.15);

  const targetHue = 200 + (stats.satisfaction / 100) * 80;
  ball.hue += (targetHue - ball.hue) * 0.1;

  if (ball.respawnTimer > 0) {
    ball.respawnTimer--;
    if (ball.respawnTimer === 0) {
      shrinkCanvasToNormal();
      ball.baseRadius = 5;
      ball.pressStrength = 0;
      initBallPoints();
      showToast(TRANSLATIONS[currentLang].toasts.regenerated);
      
      if (knifeMode) {
        knifeMode = false;
        canvas.style.cursor = 'grab';
      }
    }
    return;
  }

  if (!ball.isPunctured && ball.baseRadius < 75) {
    const targetRadius = currentMode === 'slime' ? 70 : 75;
    ball.baseRadius += (targetRadius - ball.baseRadius) * 0.12;
  }

  if (!pointer.isDown && !ball.isPunctured && !knifeMode && ball.respawnTimer === 0) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ball.x += (centerX - ball.x) * 0.1;
    ball.y += (centerY - ball.y) * 0.1;
  }

  ball.isScared = false;
  ball.isCornered = false;
  ball.panicFactor = 0;

  if (knifeMode && !ball.isPunctured && ball.respawnTimer === 0 && currentMode !== 'bubble') {
    const dx = ball.x - pointer.x;
    const dy = ball.y - pointer.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    const timeSinceLastMove = Date.now() - (ball.lastKnifeMoveTime || 0);
    if (policeState.active) {
      ball.isCallingPolice = true;
    } else if (timeSinceLastMove > 3000) {
      if (!ball.isCallingPolice) {
        ball.isCallingPolice = true;
        ball.policeDialogueTimer = Date.now();
        ball.policeDialogueStep = 0;
      }
      ball.panicFactor = 0;
    } else {
      ball.isCallingPolice = false;
      ball.policeDialogueTimer = 0;
      ball.policeDialogueStep = 0;
    }

    if (ball.isCallingPolice) {
      ball.vx *= 0.82;
      ball.vy *= 0.82;
      
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (!policeState.active) {
        const elapsed = Date.now() - (ball.policeDialogueTimer || Date.now());
        ball.policeDialogueStep = Math.floor(elapsed / 3000);

        if (ball.policeDialogueStep >= 9) {
          ball.policeDialogueStep = 9; 
          policeState.active = true;
          policeState.carX = -200;
          policeState.carTargetX = 70;
          policeState.officers = [];
          policeState.capturing = false;
          policeState.exitTimer = 0;
          policeState.sireneTicks = 0;
        }
      }

      if (dist < ball.radius && !policeState.active) {
        punctureBall(pointer.x, pointer.y);
      }
    } else {
      ball.isScared = true;

      if (dist < 280) {
        ball.panicFactor = Math.min(1.0, 1.0 - (dist - 70) / 210);
      }

      const wallDist = 45;
      const isNearWall = ball.x - ball.baseRadius < wallDist || 
                         ball.x + ball.baseRadius > canvas.width - wallDist || 
                         ball.y - ball.baseRadius < wallDist || 
                         ball.y + ball.baseRadius > canvas.height - wallDist;

      if (ball.panicFactor > 0.65 && isNearWall) {
        ball.isCornered = true;
        ball.panicFactor = 1.0;
      }
      
      const shakeMult = 1.0 + ball.panicFactor * 2.8;
      ball.vx += (Math.random() - 0.5) * 1.6 * shakeMult;
      ball.vy += (Math.random() - 0.5) * 1.6 * shakeMult;

      if (dist < 250) {
        const pTremble = 1.8 * ball.panicFactor;
        ball.points.forEach(p => {
          p.vx += (Math.random() - 0.5) * pTremble;
          p.vy += (Math.random() - 0.5) * pTremble;
        });
        
        const force = (1.0 - dist / 250) * (ball.isCornered ? 0.8 : 5.2);
        ball.vx += (dx / Math.max(1, dist)) * force;
        ball.vy += (dy / Math.max(1, dist)) * force;
      }

      const drag = ball.isCornered ? 0.80 : 0.95;
      ball.vx *= drag; 
      ball.vy *= drag;
      
      const speed = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
      const maxSp = ball.isCornered ? 2.2 : (dist < 250 ? 8.2 : 4.5);
      if (speed > maxSp) {
        ball.vx = (ball.vx / speed) * maxSp;
        ball.vy = (ball.vy / speed) * maxSp;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;

      const rCol = ball.baseRadius;
      if (ball.x - rCol < 0) { ball.x = rCol; ball.vx = -ball.vx * 0.9; }
      else if (ball.x + rCol > canvas.width) { ball.x = canvas.width - rCol; ball.vx = -ball.vx * 0.9; }
      
      if (ball.y - rCol < 0) { ball.y = rCol; ball.vy = -ball.vy * 0.9; }
      else if (ball.y + rCol > canvas.height) { ball.y = canvas.height - rCol; ball.vy = -ball.vy * 0.9; }

      if (dist < ball.radius) {
        punctureBall(pointer.x, pointer.y);
      }
    }
  }

  if (ball.isPunctured) {
    ball.vx += (Math.random() - 0.5) * 3.8;
    ball.vy += (Math.random() - 0.5) * 3.8;
    
    const fdx = ball.x - pointer.x;
    const fdy = ball.y - pointer.y;
    const fdist = Math.sqrt(fdx*fdx + fdy*fdy);
    if (fdist < ball.baseRadius + 60) {
      const force = (1.0 - fdist / (ball.baseRadius + 60)) * 3.5;
      ball.vx += (fdx / Math.max(1, fdist)) * force;
      ball.vy += (fdy / Math.max(1, fdist)) * force;
    }

    const speed = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
    const maxSp = 13;
    if (speed > maxSp) {
      ball.vx = (ball.vx / speed) * maxSp;
      ball.vy = (ball.vy / speed) * maxSp;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    const rCol = Math.max(12, ball.baseRadius);
    if (ball.x - rCol < 0) { ball.x = rCol; ball.vx = -ball.vx * 0.95; }
    else if (ball.x + rCol > canvas.width) { ball.x = canvas.width - rCol; ball.vx = -ball.vx * 0.95; }
    
    if (ball.y - rCol < 0) { ball.y = rCol; ball.vy = -ball.vy * 0.95; }
    else if (ball.y + rCol > canvas.height) { ball.y = canvas.height - rCol; ball.vy = -ball.vy * 0.95; }

    ball.baseRadius = Math.max(0, ball.baseRadius - 0.32);

    const pColor = currentMode === 'slime' ? 'rgba(167, 139, 250, 0.45)' : 'rgba(96, 165, 250, 0.5)';
    if (Math.random() < 0.7 && ball.baseRadius > 10) {
      createParticles(ball.x - ball.vx, ball.y - ball.vy, pColor, 2, 0.5);
    }

    if (ball.baseRadius < 10) {
      ball.isPunctured = false;
      ball.respawnTimer = 90;
      createParticles(ball.x, ball.y, pColor, 12, 0.5);
    }
  }

  let targetPressStrength = 0;
  if (pointer.isDown && currentMode !== 'bubble' && !ball.isPunctured) {
    const dx = pointer.x - ball.x;
    const dy = pointer.y - ball.y;
    currentPressDist = Math.sqrt(dx*dx + dy*dy);
    currentPressAngle = Math.atan2(dy, dx);

    if (currentPressDist < ball.baseRadius * 1.5) {
      targetPressStrength = Math.max(0.2, 1.0 - (currentPressDist / (ball.baseRadius * 1.3)));
    }
  }

  ball.pressStrength += (targetPressStrength - ball.pressStrength) * 0.18;
  
  if (pointer.isDown) {
    ball.peakPressStrength = Math.max(ball.peakPressStrength || 0, ball.pressStrength);
  }

  ball.eyeBlinkTimer -= 1;
  if (ball.eyeBlinkTimer <= 0) {
    if (ball.eyeScaleY === 1) {
      ball.eyeScaleY = 0;
      ball.eyeBlinkTimer = 10;
    } else {
      ball.eyeScaleY = 1;
      ball.eyeBlinkTimer = Math.random() * 250 + 150;
    }
  }

  for (let i = 0; i < ball.numPoints; i++) {
    const p = ball.points[i];
    let currentTargetRadius = ball.baseRadius;
    
    if (ball.pressStrength > 0.02 && !ball.isPunctured) {
      const isCentered = currentPressDist < 14;
      
      if (isCentered) {
        currentTargetRadius = ball.baseRadius * (1.0 - 0.22 * ball.pressStrength);
      } else {
        const diff = p.angle - currentPressAngle;
        const compress = Math.cos(diff) * 0.35 * ball.pressStrength;
        const expand = Math.sin(diff) * Math.sin(diff) * 0.18 * ball.pressStrength;
        
        currentTargetRadius = ball.baseRadius * (1.0 - compress + expand);
      }
    }

    const targetX = Math.cos(p.angle) * currentTargetRadius;
    const targetY = Math.sin(p.angle) * currentTargetRadius;

    const ax = (targetX - p.x) * ball.kSpring;
    const ay = (targetY - p.y) * ball.kSpring;

    p.vx = (p.vx + ax) * ball.kDamping;
    p.vy = (p.vy + ay) * ball.kDamping;

    p.x += p.vx;
    p.y += p.vy;

    const prevP = ball.points[(i - 1 + ball.numPoints) % ball.numPoints];
    const nextP = ball.points[(i + 1) % ball.numPoints];
    
    p.x += (prevP.x + nextP.x - p.x * 2) * 0.08;
    p.y += (prevP.y + nextP.y - p.y * 2) * 0.08;
  }

  if (policeState.active) {
    policeState.sireneTicks++;
    policeState.sireneColor = (Math.floor(policeState.sireneTicks / 10) % 2 === 0) ? '#ef4444' : '#3b82f6';

    if (policeState.failed) {
      // Mover viatura para a tela se ainda não chegou
      if (policeState.carTargetX > 0) {
        policeState.carX += (policeState.carTargetX - policeState.carX) * 0.06;
      }

      if (policeState.officers.length > 0) {
        policeState.failTimer += 16.67;

        policeState.officers.forEach((off, idx) => {
          if (policeState.failTimer < 2500) {
            // Oficiais se reúnem frente a frente
            const meetX = canvas.width / 2;
            const targetX = (idx === 0) ? meetX + 22 : meetX - 22;
            const targetY = canvas.height - 70;
            off.vx += (targetX - off.x) * 0.05;
            off.vy += (targetY - off.y) * 0.05;
          } else {
            // Oficiais voltam para a viatura
            const targetX = (idx === 0) ? policeState.carX + 110 : policeState.carX + 50;
            const targetY = canvas.height - 70;
            off.vx += (targetX - off.x) * 0.06;
            off.vy += (targetY - off.y) * 0.06;
          }

          off.vx *= 0.82;
          off.vy *= 0.82;
          off.x += off.vx;
          off.y += off.vy;
        });

        // Quando chegam no carro para entrar
        if (policeState.failTimer >= 2500) {
          const distToCar = Math.abs(policeState.officers[0].x - (policeState.carX + 110));
          if (distToCar < 12) {
            policeState.officers = [];
            policeState.carTargetX = -320; // Engata a ré
          }
        }
      } else {
        // Viatura vai embora de ré
        policeState.carX += (policeState.carTargetX - policeState.carX) * 0.06;

        if (policeState.carX < -280) {
          // Reset completo
          policeState.active = false;
          policeState.failed = false;
          knifeMode = false;
          ball.isCallingPolice = false;
          ball.policeDialogueTimer = 0;
          ball.policeDialogueStep = 0;
          
          shrinkCanvasToNormal();
          canvas.style.cursor = 'grab';
          showToast(TRANSLATIONS[currentLang].toasts.policeLeft);
        }
      }
    } else {
      // 1. Mover viatura para a tela
      if (!policeState.capturing) {
        policeState.carX += (policeState.carTargetX - policeState.carX) * 0.06;

        // Spawnar policiais gigantes (raio 35)
        if (Math.abs(policeState.carX - policeState.carTargetX) < 8 && policeState.officers.length === 0) {
          policeState.officers = [
            { x: policeState.carX + 110, y: canvas.height - 70, vx: 0, vy: 0, radius: 35 },
            { x: policeState.carX + 50, y: canvas.height - 70, vx: 0, vy: 0, radius: 35 }
          ];
        }
      }

      // 2. Oficiais perseguem a faca
      if (policeState.officers.length > 0) {
        const targetX = policeState.capturing ? policeState.carX + 90 : pointer.x;
        const targetY = policeState.capturing ? canvas.height - 70 : pointer.y;

        policeState.officers.forEach((off, idx) => {
          const odx = targetX - off.x;
          const ody = targetY - off.y;
          const odist = Math.sqrt(odx*odx + ody*ody);

          if (odist > 4) {
            const force = policeState.capturing ? 0.35 : 0.65;
            off.vx += (odx / odist) * force;
            off.vy += (ody / odist) * force;
          }

          off.vx *= 0.88;
          off.vy *= 0.88;
          off.x += off.vx;
          off.y += off.vy;

          // Captura da faca (limiar de colisão aumentado devido ao tamanho gigante de raio 35)
          if (!policeState.capturing && idx === 0 && odist < 40) {
            policeState.capturing = true;
            policeState.capturedPointerX = pointer.x;
            policeState.capturedPointerY = pointer.y;
            canvas.style.cursor = 'none'; // Confisca o cursor físico do usuário
            showToast(TRANSLATIONS[currentLang].toasts.detained);
          }
        });

        if (policeState.capturing) {
          pointer.x = policeState.officers[0].x;
          pointer.y = policeState.officers[0].y;

          // Quando retornam à viatura
          const leadDistToCar = Math.abs(policeState.officers[0].x - (policeState.carX + 90));
          if (leadDistToCar < 25) {
            policeState.exitTimer++;
            if (policeState.exitTimer > 30) {
              policeState.carTargetX = -300; // Desloca para fora da tela
              policeState.officers = [];
            }
          }
        }
      }

      // Se estiver fugindo e a viatura sair da tela
      if (policeState.capturing && policeState.officers.length === 0) {
        policeState.carX += (policeState.carTargetX - policeState.carX) * 0.08;
        
        if (policeState.carX < -280) {
          // Reset completo!
          policeState.active = false;
          knifeMode = false;
          ball.isCallingPolice = false;
          ball.policeDialogueTimer = 0;
          ball.policeDialogueStep = 0;
          
          shrinkCanvasToNormal();
          canvas.style.cursor = 'grab'; // Restaura o cursor
          showToast(TRANSLATIONS[currentLang].toasts.peace);
        }
      }
    }
  }
}

function drawBall() {
  if (ball.respawnTimer > 0) return;

  const shouldDrawArms = ball.isPunctured || (knifeMode && ball.panicFactor <= 0.7 && !ball.isCornered && !ball.isCallingPolice);
  if (shouldDrawArms) {
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 3.8;
    ctx.lineCap = 'round';
    
    const tFactor = ball.isPunctured ? 0.055 : (0.025 + ball.panicFactor * 0.025);
    const t = Date.now() * tFactor;
    const armL_Angle = Math.PI - 0.35 + Math.sin(t) * 0.75;
    const armR_Angle = 0.35 + Math.cos(t) * 0.75;
    
    const armLength = ball.baseRadius * 0.7;

    ctx.beginPath();
    ctx.moveTo(ball.x - ball.baseRadius * 0.7, ball.y + 4);
    const targetLX = ball.x - ball.baseRadius * 0.7 + Math.cos(armL_Angle) * armLength;
    const targetLY = ball.y + 4 + Math.sin(armL_Angle) * armLength;
    ctx.quadraticCurveTo(
      ball.x - ball.baseRadius * 1.05, ball.y - 12 + Math.sin(t) * 5,
      targetLX, targetLY
    );
    ctx.stroke();

    ctx.fillStyle = '#4b5563';
    ctx.beginPath();
    ctx.arc(targetLX, targetLY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ball.x + ball.baseRadius * 0.7, ball.y + 4);
    const targetRX = ball.x + ball.baseRadius * 0.7 + Math.cos(armR_Angle) * armLength;
    const targetRY = ball.y + 4 + Math.sin(armR_Angle) * armLength;
    ctx.quadraticCurveTo(
      ball.x + ball.baseRadius * 1.05, ball.y - 12 + Math.cos(t) * 5,
      targetRX, targetRY
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(targetRX, targetRY, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const gradient = ctx.createRadialGradient(
    ball.x - 15, ball.y - 15, 5,
    ball.x, ball.y, ball.baseRadius * 1.2
  );

  if (currentMode === 'classic') {
    gradient.addColorStop(0, `hsl(${ball.hue}, 95%, 88%)`);
    gradient.addColorStop(0.6, `hsl(${ball.hue}, 90%, 75%)`);
    gradient.addColorStop(1, `hsl(${ball.hue - 10}, 85%, 65%)`);
  } else {
    gradient.addColorStop(0, 'rgba(238, 242, 255, 0.7)');
    gradient.addColorStop(0.5, 'rgba(196, 181, 253, 0.45)');
    gradient.addColorStop(1, 'rgba(167, 139, 250, 0.3)');
  }

  if (ball.isSleeping) {
    ctx.save();
    ctx.fillStyle = '#f3f4f6';
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(ball.x - 52, ball.y + 12, 104, 38, 10);
    ctx.fill();
    ctx.stroke();
    
    // Detalhe de costura do travesseiro
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(ball.x - 44, ball.y + 20);
    ctx.lineTo(ball.x - 44, ball.y + 42);
    ctx.moveTo(ball.x + 44, ball.y + 20);
    ctx.lineTo(ball.x + 44, ball.y + 42);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = gradient;
  ctx.beginPath();
  
  const firstPt = ball.points[0];
  const lastPt = ball.points[ball.numPoints - 1];
  let startX = ball.x + (firstPt.x + lastPt.x) / 2;
  let startY = ball.y + (firstPt.y + lastPt.y) / 2;
  
  ctx.moveTo(startX, startY);

  for (let i = 0; i < ball.numPoints; i++) {
    const p = ball.points[i];
    const nextP = ball.points[(i + 1) % ball.numPoints];
    const midX = ball.x + (p.x + nextP.x) / 2;
    const midY = ball.y + (p.y + nextP.y) / 2;
    ctx.quadraticCurveTo(ball.x + p.x, ball.y + p.y, midX, midY);
  }

  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (currentMode === 'slime') {
    ball.glitters.forEach(g => {
      const gAngle = g.angle;
      const slice = Math.round((gAngle / (Math.PI * 2)) * ball.numPoints) % ball.numPoints;
      const borderPt = ball.points[slice];
      const borderDist = Math.sqrt(borderPt.x**2 + borderPt.y**2);

      const r = borderDist * g.distance;
      g.offsetAngle += 0.015;
      const floatX = Math.cos(g.offsetAngle) * 1.5;
      const floatY = Math.sin(g.offsetAngle) * 1.5;

      const gx = ball.x + Math.cos(gAngle) * r + floatX;
      const gy = ball.y + Math.sin(gAngle) * r + floatY;

      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(gx, gy, g.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  let faceOffsetX = 0;
  let faceOffsetY = 0;
  let isHighPressure = ball.pressStrength > 0.38;

  if (pointer.isDown && ball.pressStrength > 0.02 && !ball.isPunctured) {
    const moveDist = Math.min(currentPressDist, ball.baseRadius) * 0.15 * ball.pressStrength;
    faceOffsetX = Math.cos(currentPressAngle) * moveDist;
    faceOffsetY = Math.sin(currentPressAngle) * moveDist;
  }

  let currentEyeScale = 1.0;
  let currentPupilScale = 1.0;
  
  if (knifeMode && !ball.isPunctured) {
    currentEyeScale = 1.0 + ball.panicFactor * 0.45;
    currentPupilScale = 1.0 - ball.panicFactor * 0.45;
  }

  const eyeSpacing = 16 * (ball.baseRadius / 75);
  const eyeYOffset = 10 * (ball.baseRadius / 75);
  const eyeSize = 4.5 * (ball.baseRadius / 75) * currentEyeScale;
  const pupilSize = 2.0 * (ball.baseRadius / 75) * currentPupilScale;

  const eyeLX = ball.x - eyeSpacing + faceOffsetX;
  const eyeRX = ball.x + eyeSpacing + faceOffsetX;
  const eyeY = ball.y - eyeYOffset + faceOffsetY;

  if (ball.isSleeping) {
    ctx.save();
    // Olhos fechados dormindo
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3.0;
    ctx.lineCap = 'round';
    
    // Olho esquerdo
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, 4.5, 0, Math.PI, true);
    ctx.stroke();
    
    // Olho direito
    ctx.beginPath();
    ctx.arc(eyeRX, eyeY, 4.5, 0, Math.PI, true);
    ctx.stroke();

    // Boquinha roncando
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Cobertorzinho de sono
    ctx.fillStyle = '#60a5fa'; // Azul coberta
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(ball.x - 58, ball.y + 10, 116, 52, [14, 14, 6, 6]);
    ctx.fill();
    ctx.stroke();
    
    // Listras no cobertor
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let offset = -40; offset <= 40; offset += 20) {
      ctx.moveTo(ball.x + offset - 8, ball.y + 11);
      ctx.lineTo(ball.x + offset + 8, ball.y + 61);
    }
    ctx.stroke();

    // Letrinhas Zzz subindo
    const t = Date.now() * 0.002;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Z maior
    const y1 = ball.y - ball.baseRadius - 10 - (t * 22 % 28);
    const opacity1 = Math.max(0, 1.0 - (t * 22 % 28) / 28);
    ctx.fillStyle = `rgba(139, 92, 246, ${opacity1})`;
    ctx.font = 'bold 15px Outfit, sans-serif';
    ctx.fillText('Z', ball.x + 22 + Math.sin(t * 3.5) * 4, y1);
    
    // z médio
    const y2 = ball.y - ball.baseRadius - 10 - ((t * 22 + 10) % 28);
    const opacity2 = Math.max(0, 1.0 - ((t * 22 + 10) % 28) / 28);
    ctx.fillStyle = `rgba(139, 92, 246, ${opacity2})`;
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillText('z', ball.x + 32 + Math.cos(t * 3.5) * 3, y2);
    
    // z pequeno
    const y3 = ball.y - ball.baseRadius - 10 - ((t * 22 + 20) % 28);
    const opacity3 = Math.max(0, 1.0 - ((t * 22 + 20) % 28) / 28);
    ctx.fillStyle = `rgba(139, 92, 246, ${opacity3})`;
    ctx.font = 'bold 8px Outfit, sans-serif';
    ctx.fillText('z', ball.x + 12 + Math.sin(t * 2.5) * 2, y3);

    ctx.restore();
  } else if (knifeMode && ball.isCallingPolice && !ball.isPunctured) {
    const eyeLX_calm = ball.x - eyeSpacing + faceOffsetX;
    const eyeRX_calm = ball.x + eyeSpacing + faceOffsetX;
    const eyeY_calm = ball.y - eyeYOffset + faceOffsetY;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.arc(eyeLX_calm, eyeY_calm, eyeSize / currentEyeScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(eyeRX_calm, eyeY_calm, eyeSize / currentEyeScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const dx = pointer.x - ball.x;
    const dy = pointer.y - ball.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxOffset = (eyeSize / currentEyeScale) * 0.45;
    
    let ox = 0;
    let oy = 0;
    if (dist > 0) {
      ox = (dx / dist) * Math.min(dist, maxOffset);
      oy = (dy / dist) * Math.min(dist, maxOffset);
    }

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(eyeLX_calm + ox, eyeY_calm + oy, pupilSize / currentPupilScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeRX_calm + ox, eyeY_calm + oy, pupilSize / currentPupilScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeLX_calm + ox + 0.8, eyeY_calm + oy - 0.8, 1.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeRX_calm + ox + 0.8, eyeY_calm + oy - 0.8, 1.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const mouthY = ball.y + 4 + Math.sin(Date.now() * 0.05) * 0.5;
    const mouthW = 5.5;
    ctx.moveTo(ball.x - mouthW, mouthY);
    ctx.quadraticCurveTo(ball.x - mouthW/2, mouthY + 2.0, ball.x, mouthY);
    ctx.quadraticCurveTo(ball.x + mouthW/2, mouthY + 2.0, ball.x + mouthW, mouthY);
    ctx.stroke();

    const phoneX = ball.x + ball.baseRadius * 0.45;
    const phoneY = ball.y - 5;
    
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ball.x + ball.baseRadius * 0.5, ball.y + 4);
    ctx.lineTo(phoneX, phoneY + 4);
    ctx.stroke();

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.roundRect(phoneX - 4, phoneY - 8, 8, 15, 2);
    ctx.fill();
    
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(phoneX - 3, phoneY - 6, 6, 10, 1);
    ctx.fill();

    // SCRIPT DE DIÁLOGOS DO 190 (tamanho dinâmico do canvas e bilíngue)
    const rect = canvas.getBoundingClientRect();
    const canvasSizeStr = `${Math.round(rect.width)}x${Math.round(rect.height)}`;

    const POLICE_DIALOGUE = currentLang === 'pt' ? [
      { sender: 'ball', text: 'Alô, é do 190?!' },
      { sender: 'police', text: 'PM. Qual a emergência?' },
      { sender: 'ball', text: 'Tem um maluco com uma faca!' },
      { sender: 'police', text: 'Mantenha a calma. Local?' },
      { sender: 'ball', text: `Num canvas de ${canvasSizeStr}!` },
      { sender: 'police', text: 'A viatura está a caminho.' },
      { sender: 'ball', text: 'Rápido, ele tá me encarando!' },
      { sender: 'police', text: 'Não faça movimentos bruscos.' },
      { sender: 'ball', text: 'Socorrooo!' },
      { sender: 'police', text: 'Chegamos. Fique frio!' }
    ] : [
      { sender: 'ball', text: 'Hello, is this 911?!' },
      { sender: 'police', text: 'Police. What is your emergency?' },
      { sender: 'ball', text: 'There is a maniac with a knife!' },
      { sender: 'police', text: 'Stay calm. Your location?' },
      { sender: 'ball', text: `In a ${canvasSizeStr} canvas!` },
      { sender: 'police', text: 'The squad car is on its way.' },
      { sender: 'ball', text: 'Quick, he is staring at me!' },
      { sender: 'police', text: 'Do not make sudden moves.' },
      { sender: 'ball', text: 'Help meee!' },
      { sender: 'police', text: 'We are here. Stay cool!' }
    ];

    const currentStep = (ball.policeDialogueStep || 0) % POLICE_DIALOGUE.length;
    const msg = POLICE_DIALOGUE[currentStep];

    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(msg.text).width;
    const bWidth = textWidth + 20;
    const bHeight = 26;

    if (msg.sender === 'ball') {
      const bubbleX = ball.x - 32;
      const bubbleY = ball.y - ball.baseRadius - 34;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.roundRect(bubbleX - bWidth/2, bubbleY - bHeight/2, bWidth, bHeight, 6);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bubbleX + 4, bubbleY + bHeight/2);
      ctx.lineTo(bubbleX + 10, bubbleY + bHeight/2 + 6);
      ctx.lineTo(bubbleX - 2, bubbleY + bHeight/2);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1d1d1f';
      ctx.fillText(msg.text, bubbleX, bubbleY + 1);

    } else {
      const bubbleX = phoneX + 46;
      const bubbleY = phoneY - 32;

      ctx.fillStyle = '#0071e3'; 
      ctx.strokeStyle = '#005bb5';
      ctx.lineWidth = 1.2;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.roundRect(bubbleX - bWidth/2, bubbleY - bHeight/2, bWidth, bHeight, 6);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bubbleX - 8, bubbleY + bHeight/2);
      ctx.lineTo(bubbleX - 16, bubbleY + bHeight/2 + 6);
      ctx.lineTo(bubbleX - 2, bubbleY + bHeight/2);
      ctx.closePath();
      ctx.fillStyle = '#0071e3';
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(msg.text, bubbleX, bubbleY + 1);
    }
  } else if (ball.isPunctured) {
    const shakeX = (Math.random() - 0.5) * 1.5;
    const shakeY = (Math.random() - 0.5) * 1.5;
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.arc(eyeLX + shakeX, eyeY + shakeY, eyeSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(eyeRX + shakeX, eyeY + shakeY, eyeSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(eyeLX + shakeX + (Math.random()-0.5), eyeY + shakeY + (Math.random()-0.5), pupilSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeRX + shakeX + (Math.random()-0.5), eyeY + shakeY + (Math.random()-0.5), pupilSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.save();
    ctx.translate(ball.x + shakeX, ball.y + 4 + shakeY);
    ctx.scale(0.65, 1);
    ctx.arc(0, 0, 7 * (ball.baseRadius / 75), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  } else if (ball.isScared && ball.panicFactor > 0.7) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, eyeSize * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(eyeRX, eyeY, eyeSize * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, eyeSize * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeRX, eyeY, eyeSize * 1.05, 0, Math.PI * 2);
    ctx.fill();

    const drawGatoBrilhos = (ex, ey) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - eyeSize * 0.35, ey - eyeSize * 0.35, eyeSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(ex + eyeSize * 0.35, ey + eyeSize * 0.25, eyeSize * 0.20, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ex - eyeSize * 0.25, ey + eyeSize * 0.40, eyeSize * 0.10, 0, Math.PI * 2);
      ctx.fill();
    };

    drawGatoBrilhos(eyeLX, eyeY);
    drawGatoBrilhos(eyeRX, eyeY);

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const mouthY = ball.y + 4 + Math.sin(Date.now() * 0.08) * 0.8;
    const mouthW = 5.5;
    ctx.moveTo(ball.x - mouthW, mouthY);
    ctx.quadraticCurveTo(ball.x - mouthW/2, mouthY + 2.5, ball.x, mouthY);
    ctx.quadraticCurveTo(ball.x + mouthW/2, mouthY + 2.5, ball.x + mouthW, mouthY);
    ctx.stroke();

  } else if (ball.isScared) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(eyeRX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeRX, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1f2937';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const mouthY = ball.y + 3;
    const mouthW = 8;
    ctx.moveTo(ball.x - mouthW/2, mouthY);
    ctx.quadraticCurveTo(ball.x - mouthW/4, mouthY + 2.5 * ball.panicFactor, ball.x, mouthY);
    ctx.quadraticCurveTo(ball.x + mouthW/4, mouthY - 2.5 * ball.panicFactor, ball.x + mouthW/2, mouthY);
    ctx.stroke();

  } else if (isHighPressure) {
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(eyeLX - 3, eyeY - 2);
    ctx.lineTo(eyeLX + 1, eyeY);
    ctx.lineTo(eyeLX - 3, eyeY + 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(eyeRX + 3, eyeY - 2);
    ctx.lineTo(eyeRX - 1, eyeY);
    ctx.lineTo(eyeRX + 3, eyeY + 2);
    ctx.stroke();

    ctx.fillStyle = '#4b5563';
    ctx.beginPath();
    ctx.arc(ball.x + faceOffsetX, ball.y + 4 + faceOffsetY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#1f2937';
    
    ctx.save();
    ctx.translate(eyeLX, eyeY);
    ctx.scale(1, ball.eyeScaleY);
    ctx.beginPath();
    ctx.arc(0, 0, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(eyeRX, eyeY);
    ctx.scale(1, ball.eyeScaleY);
    ctx.beginPath();
    ctx.arc(0, 0, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (ball.eyeScaleY > 0.1) {
      const drawPupil = (ex, ey) => {
        const dx = pointer.x - ex;
        const dy = pointer.y - ey;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxOffset = eyeSize * 0.35;
        
        let ox = 0;
        let oy = 0;
        if (dist > 0) {
          ox = (dx / dist) * Math.min(dist, maxOffset);
          oy = (dy / dist) * Math.min(dist, maxOffset);
        }

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + ox + 0.8, ey + oy - 0.8, 1.2, 0, Math.PI * 2);
        ctx.fill();
      };

      drawPupil(eyeLX, eyeY);
      drawPupil(eyeRX, eyeY);
    }

    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    
    const mouthWidth = 8 * (ball.baseRadius / 75);
    const mouthY = ball.y + 3 + faceOffsetY;
    const smileDepth = 1 + (stats.satisfaction / 100) * 4.5;

    ctx.moveTo(ball.x - mouthWidth / 2 + faceOffsetX, mouthY);
    ctx.quadraticCurveTo(ball.x + faceOffsetX, mouthY + smileDepth, ball.x + mouthWidth / 2 + faceOffsetX, mouthY);
    ctx.stroke();
  }
}

function drawBubbleWrap() {
  bubbleWrap.bubbles.forEach(b => {
    if (b.popped) {
      if (b.scale > 1.0) {
        b.scale -= 0.04;
      }
    } else {
      if (b.delay > 0) {
        b.delay--;
        b.scale = 0;
        b.vScale = 0;
      } else {
        const targetScale = 1.0;
        const kSpring = 0.16;
        const kDamping = 0.70;
        
        const force = (targetScale - b.scale) * kSpring;
        b.vScale = (b.vScale + force) * kDamping;
        b.scale += b.vScale;
      }
    }

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(b.scale, b.scale);

    if (!b.popped) {
      const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, bubbleWrap.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#f3f4f6');
      grad.addColorStop(1, '#e5e7eb');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, bubbleWrap.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(-bubbleWrap.radius * 0.28, -bubbleWrap.radius * 0.28, bubbleWrap.radius * 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.strokeRect(-bubbleWrap.spacing/2, -bubbleWrap.spacing/2, bubbleWrap.spacing, bubbleWrap.spacing);
    } else {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.035)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, bubbleWrap.radius - 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
      ctx.beginPath();
      ctx.arc(0, 0, bubbleWrap.radius - 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawPolice() {
  const cy = canvas.height - 105;
  const cx = policeState.carX;
  const cWidth = 190;
  const cHeight = 90;

  ctx.save();
  // Corpo do carro (Azul escuro e branco)
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.roundRect(cx, cy, cWidth, cHeight - 15, [12, 12, 0, 0]);
  ctx.fill();

  // Cabine branca
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cx + 40, cy - 30, 95, 32, [20, 20, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Janelas (Cinza claro)
  ctx.fillStyle = '#9ca3af';
  ctx.beginPath();
  ctx.roundRect(cx + 48, cy - 22, 35, 20, [8, 0, 0, 0]);
  ctx.roundRect(cx + 88, cy - 22, 35, 20, [0, 8, 0, 0]);
  ctx.fill();

  // Sirene piscando no topo
  ctx.fillStyle = policeState.sireneColor;
  ctx.beginPath();
  ctx.arc(cx + 85, cy - 34, 8, 0, Math.PI * 2);
  ctx.fill();

  // Detalhe de luz da sirene (aura brilhando)
  ctx.fillStyle = policeState.sireneColor === '#ef4444' ? 'rgba(239, 68, 68, 0.22)' : 'rgba(59, 130, 246, 0.22)';
  ctx.beginPath();
  ctx.arc(cx + 85, cy - 34, 25, 0, Math.PI * 2);
  ctx.fill();

  // Rodas do carro
  ctx.fillStyle = '#1f2937'; // Preto pneus
  ctx.beginPath();
  ctx.arc(cx + 40, cy + cHeight - 15, 22, 0, Math.PI * 2);
  ctx.arc(cx + cWidth - 40, cy + cHeight - 15, 22, 0, Math.PI * 2);
  ctx.fill();

  // Calotas das rodas (Cinza)
  ctx.fillStyle = '#d1d5db';
  ctx.beginPath();
  ctx.arc(cx + 40, cy + cHeight - 15, 8, 0, Math.PI * 2);
  ctx.arc(cx + cWidth - 40, cy + cHeight - 15, 8, 0, Math.PI * 2);
  ctx.fill();

  // Inscrição "190" na lateral
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('190', cx + cWidth/2 + 2, cy + 30);

  ctx.restore();

  // Oficiais gigantes (raio 35)
  policeState.officers.forEach(off => {
    ctx.save();
    
    // Corpo
    ctx.fillStyle = '#1d4ed8'; // Azul PM
    ctx.beginPath();
    ctx.arc(off.x, off.y, off.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Quepe gigante
    const capW = off.radius * 1.4;
    const capH = 8;
    const capX = off.x - capW/2;
    const capY = off.y - off.radius - 3;

    // Aba preta
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(capX, capY, capW, capH, 3);
    ctx.fill();

    // Copa do quepe
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(capX + 4, capY);
    ctx.quadraticCurveTo(off.x, capY - 14, capX + capW - 4, capY);
    ctx.closePath();
    ctx.fill();

    // Estrela dourada
    ctx.fillStyle = '#fbbf24'; 
    ctx.beginPath();
    ctx.arc(off.x, capY + 1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Olhos gigantes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(off.x - 10, off.y - 4, 8, 0, Math.PI * 2);
    ctx.arc(off.x + 10, off.y - 4, 8, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas direcionadas com base no estado da polícia (se falhou, olham entre si ou pro carro)
    let lookX = pointer.x > off.x ? 2.5 : -2.5;
    let lookY = pointer.y > off.y ? 2.5 : -2.5;

    if (policeState.failed) {
      if (policeState.failTimer < 2500) {
        // Olhar um para o outro (o da esquerda olha para a direita, e vice-versa)
        const isLeftOfficer = off.x < canvas.width / 2;
        lookX = isLeftOfficer ? 2.5 : -2.5;
        lookY = 0;
      } else {
        // Olhar de volta para a viatura (esquerda)
        lookX = -2.5;
        lookY = 0.5;
      }
    }

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(off.x - 10 + lookX, off.y - 4 + lookY, 3.5, 0, Math.PI * 2);
    ctx.arc(off.x + 10 + lookX, off.y - 4 + lookY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Desenhar balão de diálogo de falha da polícia
  if (policeState.failed && policeState.failTimer < 2500 && policeState.officers.length > 0) {
    const msgText = TRANSLATIONS[currentLang].policeFail;
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(msgText).width;
    const bWidth = textWidth + 20;
    const bHeight = 26;

    // Acima do policial líder (primeiro no array)
    const bubbleX = policeState.officers[0].x;
    const bubbleY = policeState.officers[0].y - 52;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.roundRect(bubbleX - bWidth/2, bubbleY - bHeight/2, bWidth, bHeight, 6);
    ctx.fill();
    ctx.stroke();

    // Setinha do balão
    ctx.beginPath();
    ctx.moveTo(bubbleX - 4, bubbleY + bHeight/2);
    ctx.lineTo(bubbleX, bubbleY + bHeight/2 + 6);
    ctx.lineTo(bubbleX + 4, bubbleY + bHeight/2);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1d1d1f';
    ctx.fillText(msgText, bubbleX, bubbleY + 1);
    ctx.restore();
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentMode === 'classic' || currentMode === 'slime') {
    updatePhysics();
    drawBall();
  } else if (currentMode === 'bubble') {
    drawBubbleWrap();
  }

  if (policeState.active) {
    drawPolice();
  }

  updateAndDrawParticles();

  document.getElementById('statPressCount').textContent = stats.pressCount;
  document.getElementById('statMaxForce').textContent = stats.maxForce + '%';
  document.getElementById('statMood').textContent = getMoodText();
  
  const satisfPct = Math.round(stats.satisfaction);
  document.getElementById('satisfactionPct').textContent = satisfPct + '%';
  document.getElementById('satisfactionFill').style.width = satisfPct + '%';

  requestAnimationFrame(loop);
}

function setupInputEvents() {
  canvas.addEventListener('mousedown', handlePointerDown);
  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('mouseup', handlePointerUp);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handlePointerDown(e);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handlePointerMove(e);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handlePointerUp();
  }, { passive: false });

  let titleClicks = 0;
  let titleClickTimeout = null;
  document.getElementById('titleHeader').addEventListener('click', () => {
    titleClicks++;
    clearTimeout(titleClickTimeout);
    titleClickTimeout = setTimeout(() => { titleClicks = 0; }, 1200);

    if (titleClicks >= 5) {
      toggleKnifeMode();
      titleClicks = 0;
    }
  });
}

function switchLanguage(lang) {
  if (lang !== 'pt' && lang !== 'en') return;
  currentLang = lang;
  localStorage.setItem('sq_lang', lang);

  // Atualiza botões ativos do alternador
  document.getElementById('lang-pt').classList.toggle('active', lang === 'pt');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');

  const dict = TRANSLATIONS[lang];

  // Traduz botões do seletor de modo mantendo ícones SVGs
  const btnClassic = document.getElementById('btn-mode-classic');
  const btnSlime = document.getElementById('btn-mode-slime');
  const btnBubble = document.getElementById('btn-mode-bubble');

  if (btnClassic) {
    btnClassic.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><circle cx="12" cy="10" r="8"/><path d="M12 18v4"/></svg> ${dict.modes.classic}`;
  }
  if (btnSlime) {
    btnSlime.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> ${dict.modes.slime}`;
  }
  if (btnBubble) {
    btnBubble.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/></svg> ${dict.modes.bubble}`;
  }

  // Elementos do Grid de Configurações
  const labelGridSize = document.getElementById('label-grid-size');
  if (labelGridSize) labelGridSize.textContent = dict.gridSize;

  const labelSatisfaction = document.getElementById('label-satisfaction');
  if (labelSatisfaction) labelSatisfaction.textContent = dict.relaxationLevel;

  // Estatísticas
  const labelStatPress = document.getElementById('label-stat-press');
  if (labelStatPress) labelStatPress.textContent = dict.squeezes;

  const labelStatForce = document.getElementById('label-stat-force');
  if (labelStatForce) labelStatForce.textContent = dict.maxForce;

  const labelStatMood = document.getElementById('label-stat-mood');
  if (labelStatMood) labelStatMood.textContent = dict.mood;

  // Conquistas
  const labelAchievements = document.getElementById('label-achievements');
  if (labelAchievements) labelAchievements.textContent = dict.achievements;

  // Rodapé
  const audioBtn = document.getElementById('audioBtn');
  if (audioBtn) {
    audioBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg> ${soundEnabled ? dict.soundOn : dict.soundOff}`;
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> ${dict.reset}`;
  }

  // Atualiza conquistas
  updateAchievementsUI();
  
  // Exibe toast informativo do idioma carregado
  showToast(dict.toasts.ready);
}

function init() {
  initBallPoints();
  switchLanguage(currentLang);
  setupInputEvents();
  loop();
}

window.onload = init;
