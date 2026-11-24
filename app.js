async function load() {
  try {
    const res = await fetch('/api/state');
    const data = await res.json();
    renderHype(data.hypeIndex);
    renderUpdated(data.updatedAt);
    renderModels(data.models || []);
    renderRepos(data.repos || []);
    renderStories(data.stories || []);
  } catch (e) {
    document.getElementById('models').textContent = 'Failed to load data.';
  }
}

function renderHype(value) {
  document.getElementById('hypeValue').textContent = value;
  document.getElementById('hypeFill').style.width = `${value}%`;
}

function renderUpdated(iso) {
  const d = new Date(iso);
  document.getElementById('updatedAt').textContent = `Last updated ${d.toLocaleTimeString()} · ${d.toLocaleDateString()}`;
}

function renderModels(models) {
  const el = document.getElementById('models');
  if (!models.length) { el.textContent = 'No data right now.'; return; }
  el.innerHTML = models.map(m => `
    <a class="item" href="${m.url}" target="_blank" rel="noopener">
      <div class="main">
        <div class="title">${escapeHtml(m.name)}</div>
        <div class="sub">${m.downloads.toLocaleString()} downloads</div>
      </div>
      <div class="metric">❤ ${m.likes.toLocaleString()}</div>
    </a>
  `).join('');
}

function renderRepos(repos) {
  const el = document.getElementById('repos');
  if (!repos.length) { el.textContent = 'No data right now.'; return; }
  el.innerHTML = repos.map(r => `
    <a class="item" href="${r.url}" target="_blank" rel="noopener">
      <div class="main">
        <div class="title">${escapeHtml(r.name)}</div>
        <div class="sub">${escapeHtml(r.description || '')}</div>
      </div>
      <div class="metric">⭐ ${r.stars.toLocaleString()}</div>
    </a>
  `).join('');
}

function renderStories(stories) {
  const el = document.getElementById('stories');
  if (!stories.length) { el.textContent = 'No data right now.'; return; }
  el.innerHTML = stories.map(s => `
    <a class="item" href="${s.url}" target="_blank" rel="noopener">
      <div class="main">
        <div class="title">${escapeHtml(s.title)}</div>
        <div class="sub">${s.comments} comments</div>
      </div>
      <div class="metric">▲ ${s.points}</div>
    </a>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

load();
setInterval(load, 5 * 60 * 1000);
