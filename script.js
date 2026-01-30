const content = document.getElementById("content");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// сколько карточек
const PER_PAGE = 12;

// ❌ слова, которые вырезаем полностью
const BLOCK_WORDS = [
  "news", "cnn", "nbc", "bbc", "radio",
  "podcast", "episode", "preview",
  "awards", "talk", "interview",
  "questioncast", "show", "daily",
  "reality bites", "in session"
];

// ✅ слова, которые ОБЯЗАТЕЛЬНО должны быть
const ALLOW_WORDS = [
  "film", "movie", "feature",
  "full movie", "full film",
  "series", "season", "episode 1"
];

// ===== ФИЛЬТР КАЧЕСТВА =====
function isCleanMovie(item) {
  const title = (item.title || "").toLowerCase();
  const desc = (item.description || "").toLowerCase();

  // если есть запрещённые слова — сразу мимо
  if (BLOCK_WORDS.some(w => title.includes(w) || desc.includes(w))) {
    return false;
  }

  // должно быть хоть одно разрешённое
  return ALLOW_WORDS.some(w => title.includes(w) || desc.includes(w));
}

// ===== ЗАГРУЗКА =====
async function fetchArchive(query) {
  content.innerHTML = "<p class='loading'>Загрузка фильмов…</p>";

  const url =
    `https://archive.org/advancedsearch.php` +
    `?q=${encodeURIComponent(query)}` +
    `&fl[]=identifier&fl[]=title&fl[]=description` +
    `&rows=${PER_PAGE}&output=json`;

  const res = await fetch(url);
  const data = await res.json();

  const clean = data.response.docs.filter(isCleanMovie);

  renderGrid(clean);
}

// ===== РЕНДЕР =====
function renderGrid(list) {
  content.innerHTML = `<div class="grid"></div>`;
  const grid = content.querySelector(".grid");

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

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
      toggleFavorite(item.identifier);
      e.target.textContent =
        favorites.includes(item.identifier) ? "★" : "☆";
    };

    card.onclick = () => openPlayer(item);
    grid.appendChild(card);
  });
}

// ===== ПЛЕЕР =====
function openPlayer(item) {
  content.innerHTML = `
    <div class="movie-page">
      <button onclick="loadMovies()">← Назад</button>
      <h2>${item.title}</h2>
      <iframe
        src="https://archive.org/embed/${item.identifier}"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

// ===== ИЗБРАННОЕ =====
function toggleFavorite(id) {
  favorites = favorites.includes(id)
    ? favorites.filter(f => f !== id)
    : [...favorites, id];

  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// ===== НАВИГАЦИЯ =====
function loadMovies() {
  fetchArchive("feature film full movie");
}

function loadSeries() {
  fetchArchive("tv series full episodes");
}

function showFavorites() {
  if (!favorites.length) {
    content.innerHTML = "<p class='loading'>Избранное пусто ⭐</p>";
    return;
  }

  const favItems = favorites.map(id => ({
    identifier: id,
    title: id.replace(/_/g, " ")
  }));

  renderGrid(favItems);
}

function archiveSearch(text) {
  if (text.trim()) fetchArchive(text);
}

// ===== СТАРТ =====
loadMovies();

