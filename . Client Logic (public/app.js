let currentUserId = localStorage.getItem('userId');
let trackingInterval = null;
let allResources = [];

document.addEventListener('DOMContentLoaded', () => {
  if (currentUserId) {
    showDashboard();
    startUsageTracker();
  }
});

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    currentUserId = data.userId;
    showDashboard();
    startUsageTracker();
  } else {
    alert(data.error);
  }
}

function showDashboard() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'block';
  document.getElementById('logout-btn').style.display = 'inline-block';
  loadResources();
}

async function loadResources() {
  const res = await fetch('/api/resources');
  allResources = await res.json();
  renderResources(allResources);
}

function renderResources(resources) {
  const container = document.getElementById('video-container');
  container.innerHTML = '';

  resources.forEach(item => {
    const card = document.createElement('div');
    card.className = 'video-card';

    let videoEmbed = '';
    if (item.videoType === 'youtube') {
      videoEmbed = `<iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      videoEmbed = `<video controls><source src="${item.url}" type="video/mp4"></video>`;
    }

    card.innerHTML = `
      ${videoEmbed}
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    `;
    container.appendChild(card);
  });
}

function filterVideos(category) {
  if (category === 'all') {
    renderResources(allResources);
  } else {
    const filtered = allResources.filter(r => r.category === category);
    renderResources(filtered);
  }
}

function startUsageTracker() {
  // Update time spent every minute (1 minute interval)
  trackingInterval = setInterval(async () => {
    const res = await fetch('/api/usage/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, minutesElapsed: 1 })
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById('timer-badge').innerText = 
        `Daily Usage: ${data.minutesSpent} / ${data.dailyLimit} mins`;

      if (data.limitReached) {
        document.getElementById('limit-modal').style.display = 'flex';
        clearInterval(trackingInterval);
      }
    }
  }, 60000); // 60,000ms = 1 minute
}

function logout() {
  localStorage.clear();
  clearInterval(trackingInterval);
  window.location.reload();
}
