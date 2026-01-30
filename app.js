const KEY = "326dbfdc8731edbdf825d569a44d4ede";
const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const grid = document.getElementById("movies");

// ===== STORAGE =====
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function load(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

// ===== LOADERS =====
async function loadMovies() {
  const r = await fetch(`${API}/movie/popular?api_key=${KEY}&language=ru-RU`);
  const d = await r.json();
  render(d.results, "movie");
}

async function loadTV() {
  const r = await fetch(`${API}/tv/popular?api_key=${KEY}&language=ru-RU`);
  const d = await r.json();
  render(d.results, "tv");
}

async function search() {
  const q = document.getElementById("searchInput").value;
  if (!q) return;

  const r = await fetch(`${API}/search/multi?api_key=${KEY}&query=${q}&language=ru-RU`);
  const d = await r.json();
  render(d.results.filter(x => x.media_type !== "person"), null);
}

// ===== RENDER =====
function render(items, forcedType) {
  grid.innerHTML = "";
  items.forEach(i => {
    const type = forcedType || i.media_type;
    const title = i.title || i.name;
    if (!title || !i.poster_path) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${IMG + i.poster_path}">
      <h3>${title}</h3>
    `;
    card.onclick = () => openWatch(i, type);
    grid.appendChild(card);
  });
}

// ===== WATCH =====
function openWatch(item, type) {
  let history = load("history");
  history.unshift({ id: item.id, type, date: Date.now() });
  save("history", history.slice(0, 50));
  location.href = `watch.html?id=${item.id}&type=${type}`;
}

// ===== START =====
document.addEventListener("DOMContentLoaded", loadMovies);

