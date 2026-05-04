/* =============================================
   ATTIX — script.js   v2.0
   ============================================= */

/* ─── Canvas particle background ─────────── */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((W * H) / 14000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        dx: (Math.random() - 0.5) * 0.22,
        dy: (Math.random() - 0.5) * 0.22,
        alpha: Math.random() * 0.5 + 0.1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Subtle connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56,189,248,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,189,248,${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  draw();
})();


/* ─── Navbar scroll shadow ─────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });


/* ─── Mobile menu toggle ───────────────── */
function toggleMenu() {
  const menu = document.getElementById('mobileNav');
  const ham  = document.getElementById('hamburger');
  menu.classList.toggle('open');
  ham.classList.toggle('open');
}

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileNav');
  const ham  = document.getElementById('hamburger');
  if (!menu.contains(e.target) && !ham.contains(e.target)) {
    menu.classList.remove('open');
    ham.classList.remove('open');
  }
});


/* ─── Scroll helper ─────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ─── Orb demo counter animation ─────────── */
(function animateOrbDemo() {
  const el = document.querySelector('.core-pct');
  if (!el) return;
  const values = ['84%', '67%', '91%', '72%', '84%'];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % values.length;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.8)';
    setTimeout(() => {
      el.textContent = values[i];
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    }, 300);
  }, 2800);
  el.style.transition = 'opacity 0.3s, transform 0.3s';
})();


/* ─── Number counter animation ─────────── */
function animateNumber(el, from, to, duration, suffix = '') {
  const start = performance.now();
  const range = to - from;

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = from + range * eased;
    el.textContent = current.toFixed(1) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = to.toFixed(1) + suffix;
  }

  requestAnimationFrame(step);
}


/* ─── Validation helper ─────────────────── */
function setError(input, msg) {
  input.classList.add('error');

  // Remove existing error
  const prev = input.parentElement.parentElement.querySelector('.err-msg');
  if (prev) prev.remove();

  const err = document.createElement('div');
  err.className = 'err-msg';
  err.textContent = msg;
  input.parentElement.parentElement.appendChild(err);

  input.addEventListener('input', () => {
    input.classList.remove('error');
    err.remove();
  }, { once: true });
}

function clearErrors() {
  document.querySelectorAll('.finput').forEach(f => {
    f.classList.remove('error');
  });
  document.querySelectorAll('.err-msg').forEach(e => e.remove());
}


/* ─── Core calculation ──────────────────── */
function calculate() {
  clearErrors();

  const totalEl     = document.getElementById('total');
  const attendedEl  = document.getElementById('attended');
  const remainingEl = document.getElementById('remaining');

  const total     = parseFloat(totalEl.value);
  const attended  = parseFloat(attendedEl.value);
  const remaining = parseFloat(remainingEl.value) || 0;

  // Validate
  let valid = true;

  if (!totalEl.value.trim() || isNaN(total) || total < 1) {
    setError(totalEl, 'Please enter total classes (min 1)');
    valid = false;
  }

  if (!attendedEl.value.trim() || isNaN(attended) || attended < 0) {
    setError(attendedEl, 'Please enter attended classes');
    valid = false;
  }

  if (valid && attended > total) {
    setError(attendedEl, 'Attended cannot exceed total');
    valid = false;
  }

  if (!valid) {
    // Shake the card
    const card = document.getElementById('gcard');
    card.style.animation = 'shake 0.4s var(--ease)';
    setTimeout(() => { card.style.animation = ''; }, 400);
    return;
  }

  // ── Calculations ──────────────────────
  const percentage = (attended / total) * 100;
  const isSafe = percentage >= 75;

  let insightHTML = '';

  if (remaining > 0) {
    const finalTotal = total + remaining;
    // How many of the remaining can we bunk?
    const maxBunks = attended + remaining - 0.75 * finalTotal;
    const bunkable = Math.floor(maxBunks);

    if (bunkable < 0) {
      // Impossible
      insightHTML = `You can't reach 75% even if you attend all <strong>${remaining}</strong> remaining classes.`;
    } else {
      const mustAttend = remaining - bunkable;
      if (bunkable === 0) {
        insightHTML = `You must attend <strong>all ${remaining}</strong> remaining classes to stay at or above 75%.`;
      } else {
        insightHTML = `Out of ${remaining} remaining classes, you must attend <strong>${mustAttend}</strong>. You can safely bunk <strong>${bunkable}</strong>.`;
      }
    }
  } else {
    // No remaining provided. Assume infinite future classes.
    if (isSafe) {
      const bunkable = Math.floor((attended / 0.75) - total);
      if (bunkable === 0) {
        insightHTML = `You're exactly at the safe line. <strong>Don't miss any more classes.</strong>`;
      } else {
        insightHTML = `You can safely bunk <strong>${bunkable} more class${bunkable === 1 ? '' : 'es'}</strong> and still stay above 75%.`;
      }
    } else {
      const mustAttend = Math.ceil((0.75 * total - attended) / 0.25);
      insightHTML = `You must attend the next <strong>${mustAttend} class${mustAttend === 1 ? '' : 'es'}</strong> consecutively to reach the 75% threshold.`;
    }
  }

  renderResult(percentage, isSafe, insightHTML);
}


/* ─── Render result ─────────────────────── */
function renderResult(percentage, isSafe, insightHTML) {
  const zone        = document.getElementById('resultZone');
  const bigPct      = document.getElementById('bigPct');
  const badge       = document.getElementById('statusBadge');
  const badgeEmoji  = document.getElementById('badgeEmoji');
  const badgeText   = document.getElementById('badgeText');
  const insightMsg  = document.getElementById('insightMsg');
  const progFill    = document.getElementById('progFill');
  const progPct     = document.getElementById('progPct');

  // Hide → re-show for animation
  zone.classList.remove('show');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {

      // Percentage color
      bigPct.style.color = isSafe ? 'var(--success)' : 'var(--danger)';

      badge.className = 'status-badge ' + (isSafe ? 'safe' : 'danger');
      badgeEmoji.textContent = isSafe ? '✓' : '✗';
      badgeText.textContent  = isSafe ? "You're safe to relax" : "Warning: Attendance dropping";

      // Insight
      insightMsg.innerHTML = insightHTML;

      // Progress bar
      const barWidth = Math.min(percentage, 100).toFixed(1);
      progFill.style.width      = barWidth + '%';
      progFill.style.background = isSafe
        ? 'linear-gradient(90deg, #15803d, var(--success), #86efac)'
        : 'linear-gradient(90deg, #991b1b, var(--danger), #fca5a5)';
      progPct.textContent = barWidth + '%';

      // Show zone
      zone.classList.add('show');

      // Animate number
      animateNumber(bigPct, 0, percentage, 900);

      // Scroll into view
      setTimeout(() => {
        zone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    });
  });
}


/* ─── Enter key support ─────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement.classList.contains('finput')) {
    calculate();
  }
});


/* ─── Input guard: no negatives ─────────── */
document.querySelectorAll('.finput').forEach(input => {
  input.addEventListener('input', () => {
    if (parseFloat(input.value) < 0) input.value = '0';
  });
});


/* ─── Inject shake keyframe ─────────────── */
(function addShake() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0) translateY(-6px); }
      20%      { transform: translateX(-6px) translateY(-6px); }
      40%      { transform: translateX(6px) translateY(-6px); }
      60%      { transform: translateX(-4px) translateY(-6px); }
      80%      { transform: translateX(4px) translateY(-6px); }
    }
  `;
  document.head.appendChild(style);
})();
