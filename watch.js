const KEY = "326dbfdc8731edbdf825d569a44d4ede";
const API = "https://api.themoviedb.org/3";

const id = new URLSearchParams(location.search).get("id");
const type = new URLSearchParams(location.search).get("type");

async function searchArchive(q) {
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&rows=1&output=json`;
  const r = await fetch(url);
  const d = await r.json();
  return d.response.docs[0]?.identifier;
}

async function load() {
  const r = await fetch(`${API}/${type}/${id}?api_key=${KEY}&language=ru-RU`);
  const d = await r.json();

  document.getElementById("info").innerHTML = `
    <h1>${d.title || d.name}</h1>
    <p>${d.overview}</p>
  `;

  if (type === "movie") {
    play(d.title);
  } else {
    d.seasons.forEach(s => {
      const btn = document.createElement("button");
      btn.textContent = `Сезон ${s.season_number}`;
      btn.onclick = () => loadSeason(s.season_number, d.name);
      document.getElementById("episodes").appendChild(btn);
    });
  }
}

async function loadSeason(season, name) {
  const r = await fetch(`${API}/tv/${id}/season/${season}?api_key=${KEY}&language=ru-RU`);
  const d = await r.json();

  d.episodes.forEach(e => {
    const li = document.createElement("div");
    li.textContent = `${e.episode_number}. ${e.name}`;
    li.onclick = () => play(`${name} S${season}E${e.episode_number}`);
    document.getElementById("episodes").appendChild(li);
  });
}

async function play(q) {
  const id = await searchArchive(q);
  document.getElementById("player").innerHTML = id
    ? `<iframe src="https://archive.org/embed/${id}" allowfullscreen></iframe>`
    : `<p>Видео не найдено 😢</p>`;
}

load();
