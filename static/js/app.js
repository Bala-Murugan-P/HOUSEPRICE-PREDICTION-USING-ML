// ===== GRAIN CANVAS =====
(function () {
  const canvas = document.getElementById('grain');
  const ctx = canvas.getContext('2d');
  let frame = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrain() {
    const w = canvas.width, h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 18;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function loop() {
    frame++;
    if (frame % 3 === 0) drawGrain();
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  loop();
})();

// ===== SLIDER UPDATE =====
function updateSlider(input) {
  const valEl = document.getElementById(input.id + '_val');
  if (!valEl) return;

  // Get unit from data if available
  const units = {
    OverallQual: '/10',
    GarageCars: ' cars',
    FullBath: ' baths'
  };
  const unit = units[input.id] || '';
  valEl.textContent = input.value + unit;

  // Update slider track fill
  const min = parseFloat(input.min);
  const max = parseFloat(input.max);
  const val = parseFloat(input.value);
  const pct = ((val - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(to right, #D4AF37 ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
}

// Init all sliders
document.querySelectorAll('.feature-slider').forEach(s => updateSlider(s));

// ===== RESET FORM =====
function resetForm() {
  const defaults = {
    OverallQual: 7,
    GrLivArea: 1500,
    GarageArea: 480,
    TotalBsmtSF: 1000,
    '1stFlrSF': 1100,
    YearBuilt: 2000,
    LotArea: 10000,
    GarageCars: 2,
    FullBath: 2
  };

  Object.entries(defaults).forEach(([key, val]) => {
    const el = document.getElementById(key);
    if (el) {
      el.value = val;
      if (el.type === 'range') updateSlider(el);
    }
  });

  hideResult();
}

// ===== SHOW / HIDE RESULT =====
function showResultPanel() {
  const panel = document.getElementById('resultPanel');
  panel.classList.add('visible');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResult() {
  const panel = document.getElementById('resultPanel');
  panel.classList.remove('visible');
}

function showLoading() {
  document.getElementById('resultLoading').style.display = 'flex';
  document.getElementById('resultContent').style.display = 'none';
  document.getElementById('resultError').style.display = 'none';
  showResultPanel();
}

function showResult(data) {
  document.getElementById('resultLoading').style.display = 'none';
  document.getElementById('resultError').style.display = 'none';

  const content = document.getElementById('resultContent');
  content.style.display = 'block';

  // Animate price counting
  animatePrice(data.prediction);

  // Tier badge
  const tierEl = document.getElementById('resultTier');
  tierEl.textContent = data.tier;
  tierEl.style.color = data.tier_color;
  tierEl.style.borderColor = data.tier_color + '44';
  tierEl.style.background = data.tier_color + '18';

  // Model used
  document.getElementById('resultModel').textContent = '⚙ ' + data.model_used;

  // Breakdown
  renderBreakdown();
}

function showError(msg) {
  document.getElementById('resultLoading').style.display = 'none';
  document.getElementById('resultContent').style.display = 'none';
  const errEl = document.getElementById('resultError');
  errEl.style.display = 'flex';
  document.getElementById('errorMessage').textContent = msg || 'Something went wrong. Please try again.';
}

// ===== ANIMATE PRICE =====
function animatePrice(target) {
  const el = document.getElementById('resultPrice');
  const duration = 1200;
  const startTime = performance.now();
  const startVal = 0;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = startVal + (target - startVal) * easeOut(progress);
    el.textContent = '$' + Math.round(current).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ===== BREAKDOWN =====
function renderBreakdown() {
  const fields = [
    { id: 'OverallQual', label: 'Overall Quality', format: v => v + '/10' },
    { id: 'GrLivArea', label: 'Living Area', format: v => parseInt(v).toLocaleString() + ' sq ft' },
    { id: 'GarageArea', label: 'Garage Area', format: v => parseInt(v).toLocaleString() + ' sq ft' },
    { id: 'TotalBsmtSF', label: 'Basement', format: v => parseInt(v).toLocaleString() + ' sq ft' },
    { id: '1stFlrSF', label: '1st Floor', format: v => parseInt(v).toLocaleString() + ' sq ft' },
    { id: 'YearBuilt', label: 'Year Built', format: v => v },
    { id: 'LotArea', label: 'Lot Area', format: v => parseInt(v).toLocaleString() + ' sq ft' },
    { id: 'GarageCars', label: 'Garage Capacity', format: v => v + ' cars' },
    { id: 'FullBath', label: 'Bathrooms', format: v => v + ' full baths' }
  ];

  const container = document.getElementById('resultBreakdown');
  container.innerHTML = '';

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el) return;
    const val = el.value;
    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.innerHTML = `
      <span class="breakdown-key">${f.label}</span>
      <span class="breakdown-val">${f.format(val)}</span>
    `;
    container.appendChild(div);
  });
}

// ===== FORM SUBMIT =====
document.getElementById('predictionForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Predicting…';

  showLoading();

  // Collect form data
  const formData = {};
  const fields = ['OverallQual', 'GrLivArea', 'GarageArea', 'TotalBsmtSF', '1stFlrSF', 'YearBuilt', 'LotArea', 'GarageCars', 'FullBath'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) formData[f] = parseFloat(el.value);
  });

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      showResult(data);
    } else {
      showError(data.error);
    }
  } catch (err) {
    showError('Network error. Please check your connection.');
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-text').textContent = 'Predict Value';
  }
});

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-item, .model-info-card').forEach(el => {
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
