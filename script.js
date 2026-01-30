// ================== DOM ==================
const content = document.getElementById("content");

// ================== STATE ==================
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
const cache = {};

// ================== КЛЮЧЕВЫЕ СЛОВА ==================
const BLOCK = [
  "news","cnn","nbc","bbc","radio","podcast",
  "preview","award","talk","interview",
  "show","daily","session","reality","question",
  "top 10","top ten","recap","review","countdown",
  "list of","best of","episode","ep."
];

const ALLOW = [
  "film","movie","feature","full film","full movie"
];

// ================== ЖАНРЫ ==================
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

// ================== PRE-FILTER (КЛЮЧЕВОЕ) ==================
function isProbablyMovie(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();

  // ❌ явный мусор
  if (BLOCK.some(w => text.includes(w))) return false;

  // ❌ короткие / пустые описания
  if (!item.description || item.description.length < 80) return false;

  // ✅ год почти обязателен
  if (!text.match(/\b(19|20)\d{2}\b/)) return false;

  return true;
}

// ================== СКОРИНГ ==================
function scoreItem(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  let score = 0;

  ALLOW.forEach(w => text.includes(w) && (score += 4));

  if (text.match(/\b(19|20)\d{2}\b/)) score += 2;
  if (text.includes("director")) score += 2;
  if (text.includes("runtime") || text.includes("minutes")) score += 1;
  if (item.description.length > 200) score += 1;

  if (favorites.includes(item.identifier)) score += 3;

  return score;
}

// ================== FETCH ARCHIVE ==================
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
    "&rows=100&output=json";

  const res = await fetch(url);
  const data = await res.json();

  const movies = data.response.docs
    .filter(isProbablyMovie)
    .map(item => ({
      ...item,
      genre: detectGenre(item),
      score: scoreItem(item)
    }))
    .sort((a, b) => b.score - a.score);

  cache[query] = movies;
  render(movies);
}

// ================== RENDER ==================
function render(list) {
  if (!list.length) {
    content.innerHTML = "<p class='loading'>Фильмы не найдены 😕</p>";
    return;
  }

  content.innerHTML = `<div class="grid"></div>`;
  const grid = content.querySelector(".grid");

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    if (item.score >= 8) card.classList.add("top-pick");

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

// ================== BEST VIDEO ==================
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

// ================== PLAYER ==================
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
}

// ================== FAVORITES ==================
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

// ================== NAV ==================
function loadMovies() {
  fetchArchive("mediatype:movies AND (film OR movie)");
}

function loadSeries() {
  fetchArchive("mediatype:movies AND (series OR episode)");
}

// ================== SEARCH ==================
let searchTimer;
function archiveSearch(text) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (text.trim()) {
      fetchArchive(`mediatype:movies AND (${text})`);
    }
  }, 400);
}

// ================== START ==================
loadMovies();




