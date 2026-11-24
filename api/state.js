// Aggregates live AI signal from Hugging Face, GitHub, and Hacker News.
export default async function handler(req, res) {
  try {
    const [hfRes, ghRes, hnRes] = await Promise.all([
      fetch('https://huggingface.co/api/models?sort=likes7d&direction=-1&limit=6'),
      fetch('https://api.github.com/search/repositories?q=topic:artificial-intelligence+pushed:>' + daysAgo(7) + '&sort=stars&order=desc&per_page=6', {
        headers: { 'User-Agent': 'state-of-ai-app' }
      }),
      fetch('https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&numericFilters=points%3E30&hitsPerPage=6')
    ]);

    const hf = hfRes.ok ? await hfRes.json() : [];
    const gh = ghRes.ok ? await ghRes.json() : { items: [] };
    const hn = hnRes.ok ? await hnRes.json() : { hits: [] };

    const models = (hf || []).map(m => ({
      name: m.modelId || m.id,
      likes: m.likes || 0,
      downloads: m.downloads || 0,
      url: `https://huggingface.co/${m.modelId || m.id}`
    }));

    const repos = (gh.items || []).map(r => ({
      name: r.full_name,
      stars: r.stargazers_count,
      description: r.description,
      url: r.html_url
    }));

    const stories = (hn.hits || []).map(h => ({
      title: h.title,
      points: h.points,
      comments: h.num_comments,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
    }));

    // Fun computed "AI Hype Index" (0-100) from combined live signal.
    const totalLikes = models.reduce((s, m) => s + m.likes, 0);
    const totalStars = repos.reduce((s, r) => s + r.stars, 0);
    const totalPoints = stories.reduce((s, h) => s + h.points, 0);
    const raw = (totalLikes / 300) + (totalStars / 150) + (totalPoints / 40);
    const hypeIndex = Math.max(1, Math.min(100, Math.round(15 + Math.sqrt(raw) * 9)));

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.status(200).json({
      updatedAt: new Date().toISOString(),
      hypeIndex,
      models,
      repos,
      stories
    });
  } catch (err) {
    res.status(500).json({ error: 'server_error', message: String(err) });
  }
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
