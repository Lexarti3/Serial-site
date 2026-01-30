// ===== DOM =====
const content = document.getElementById("content");

// ===== ИЗБРАННОЕ =====
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// ===== КЕШ ЗАПРОСОВ =====
const cache = {};

// ===== КЛЮЧЕВЫЕ СЛОВА =====
const BLOCK = [
  "news","cnn","nbc","bbc","radio","podcast",
  "preview","award","talk","interview",
  "show","daily","session","reality","question"
];

const ALLOW = [
  "film","movie","feature","full movie",
  "full film","series","season","episode"
];

// ===== СКОРИНГ =====
function scoreItem(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  let score = 0;

  // ❌ мусор
  BLOCK.forEach(w => {
    if (text.includes(w)) score -= 5;
  });

  // ✅ релевантность
  ALLOW.forEach(w => {
    if (text.includes(w)) score += 4;
  });

  // 🎬 кино-бонусы
  if (text.match(/\b(19|20)\d{2}\b/)) score += 2;
  if (text.includes("director")) score += 2;
  if (text.includes("runtime") || text.includes("minutes")) score += 1;
  if (item.description && item.description.length > 120) score += 1;

  // ❌ пустота
  if (!item.description) score -= 1;

  return score;
}

// ===== ЗАГРУЗКА =====
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
    "&rows=60&output=json";

  const res = await fetch(url);
  const data = await res.json();

  const ranked = data.response.docs
    .map(item => ({ ...item, score: scoreItem(item) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  cache[query] = ranked;
  render(ranked);
}

// ===== РЕНДЕР =====
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
    if (item.score >= 6) card.classList.add("top-pick");

    card.innerHTML = `
      <img loading="lazy"
        src="https://archive.org/services/img/${item.identifier}">
      <h3>${item.title}</h3>
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

// ===== ПЛЕЕР =====
function openMovie(item) {
  content.innerHTML = `
    <div class="movie-page">
      <button onclick="loadMovies()">← Назад</button>
      <h2>${item.title}</h2>
      <iframe
        src="https://archive.org/embed/${item.identifier}"
        allowfullscreen
        loading="lazy">
      </iframe>
    </div>
  `;
}

// ===== ИЗБРАННОЕ =====
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

  const favItems = Object.values(cache)
    .flat()
    .filter(item => favorites.includes(item.identifier));

  render(favItems);
}

// ===== НАВИГАЦИЯ =====
function loadMovies() {
  fetchArchive("feature film");
}

function loadSeries() {
  fetchArchive("tv series full episodes");
}

// ===== ПОИСК (DEBOUNCE) =====
let searchTimer;

function archiveSearch(text) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (text.trim()) fetchArchive(text);
  }, 400);
}

// ===== СТАРТ =====
loadMovies();


