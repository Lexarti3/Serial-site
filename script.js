// ================== DOM ==================
const content = document.getElementById("content");

// ================== STATE ==================
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
const cache = {}; // кеш запросов archive.org

// ================== КЛЮЧЕВЫЕ СЛОВА ==================
const BLOCK = [
  "news","cnn","nbc","bbc","radio","podcast",
  "preview","award","talk","interview",
  "show","daily","session","reality","question"
];

const ALLOW = [
  "film","movie","feature","full movie",
  "full film","series","season","episode"
];

// ================== ЖАНРЫ (без API) ==================
const GENRES = {
  horror: ["horror","terror","ghost","night"],
  scifi: ["sci-fi","science","space","alien","future"],
  drama: ["drama","love","life","story"],
  crime: ["crime","gang","police","murder"],
  comedy: ["comedy","funny","humor"]
};

function detectGenre(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  for (const g in GENRES) {
    if (GENRES[g].some(w => text.includes(w))) return g;
  }
  return "other";
}

// ================== СКОРИНГ (Netflix-style) ==================
function scoreItem(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  let score = 0;

  BLOCK.forEach(w => text.includes(w) && (score -= 5));
  ALLOW.forEach(w => text.includes(w) && (score += 4));

  if (text.match(/\b(19|20)\d{2}\b/)) score += 2;
  if (text.includes("director")) score += 2;
  if (text.includes("runtime") || text.includes("minutes")) score += 1;
  if (item.description && item.description.length > 120) score += 1;
  if (!item.description) score -= 1;

  if (favorites.includes(item.identifier)) score += 3;

  return score;
}

// ================== ЗАГРУЗКА ARCHIVE ==================
async function fetchArchive(query) {
  content.innerHTML = "<p class='loading'>Загрузка…</p>";

  if (cache[query]) {
    render(cache[query]);
    return;
  }

  const url =
    "https://archive.org/advancedsearch.php" +
    "?q=" + encodeURIComponent(query) +
    "&fl[]=identifier&fl[]=title&fl[]=description" +
    "&rows=80&output=json";

  const res = await fetch(url);
  const data = await res.json();

  const ranked = data.response.docs
    .map(item => ({
      ...item,
      genre: detectGenre(item),
      score: scoreItem(item)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  cache[query] = ranked;
  render(ranked);
}

// ================== РЕНДЕР КАРТОЧЕК ==================
function render(list) {
  if (!list.length) {
    content.innerHTML = "<p class='loading'>Ничего не найдено 😕</p>";
    return;
  }

  content.innerHTML = `<div class="grid"></div>`;
  const grid = content.querySelector(".grid");

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    if (item.score >= 7) card.classList.add("top-pick");

    card.innerHTML = `
      <img loading="lazy"
        src="https://archive.org/services/img/${item.identifier}">
      <h3>${item.title}</h3>
      <small>${item.genre}</small>
      <button class="fav-btn">
        ${favorites.includes(item.identifier) ? "★" : "☆"}
      </button>
    `;

    card.querySelector(".fav-btn").onclick = e => {
      e.stopPropagation();
      toggleFav(item.identifier);
      e.target.textContent =
        favorites.includes(item.identifier) ? "★" : "☆";
    };

    card.onclick = () => openMovie(item);
    grid.appendChild(card);
  });
}

// ================== ЛУЧШИЙ ВИДЕОФАЙЛ ==================
async function getBestVideo(identifier) {
  const res = await fetch(`https://archive.org/metadata/${identifier}`);
  const data = await res.json();
  const files = data.files || [];

  return (
    files.find(f => f.format === "MPEG4") ||
    files.find(f => f.format === "h.264") ||
    files.find(f => f.format === "WebM") ||
    null
  );
}

// ================== ПЛЕЕР ==================
async function openMovie(item) {
  content.innerHTML = "<p class='loading'>Загрузка фильма…</p>";

  const file = await getBestVideo(item.identifier);

  if (!file) {
    content.innerHTML = `
      <p class="loading">Видео не найдено 😕</p>
      <button onclick="loadMovies()">← Назад</button>
    `;
    return;
  }

  content.innerHTML = `
    <div class="movie-page">
      <button onclick="loadMovies()">← Назад</button>
      <h2>${item.title}</h2>
      <video controls autoplay>
        <source src="https://archive.org/download/${item.identifier}/${file.name}">
      </video>
    </div>
  `;

  renderRecommendations(item);
}

// ================== ПОХОЖИЕ ФИЛЬМЫ ==================
function similarity(a, b) {
  const ta = `${a.title} ${a.description}`.toLowerCase().split(/\W+/);
  const tb = `${b.title} ${b.description}`.toLowerCase().split(/\W+/);

  const setA = new Set(ta);
  const setB = new Set(tb);

  let common = 0;
  setA.forEach(w => setB.has(w) && common++);
  return common;
}

function renderRecommendations(baseItem) {
  const all = Object.values(cache).flat();

  const similar = all
    .filter(i => i.identifier !== baseItem.identifier)
    .map(i => ({ ...i, sim: similarity(baseItem, i) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 6);

  if (!similar.length) return;

  const block = document.createElement("div");
  block.innerHTML = "<h3>Похожие фильмы</h3>";
  block.className = "grid";

  similar.forEach(item => {
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = `
      <img src="https://archive.org/services/img/${item.identifier}">
      <h4>${item.title}</h4>
    `;
    c.onclick = () => openMovie(item);
    block.appendChild(c);
  });

  content.appendChild(block);
}

// ================== ИЗБРАННОЕ ==================
function toggleFav(id) {
  favorites = favorites.includes(id)
    ? favorites.filter(f => f !== id)
    : [...favorites, id];

  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function showFavorites() {
  if (!favorites.length) {
    content.innerHTML = "<p class='loading'>Избранное пусто ⭐</p>";
    return;
  }

  const items = Object.values(cache)
    .flat()
    .filter(i => favorites.includes(i.identifier));

  render(items);
}

// ================== НАВИГАЦИЯ ==================
function loadMovies() {
  fetchArchive("feature film");
}

function loadSeries() {
  fetchArchive("tv series full episodes");
}

// ================== ПОИСК (debounce) ==================
let searchTimer;
function archiveSearch(text) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (text.trim()) fetchArchive(text);
  }, 400);
}

// ================== СТАРТ ==================
loadMovies();



