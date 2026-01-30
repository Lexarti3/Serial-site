const content = document.getElementById("content");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// ❌ мусор
const BLOCK = [
  "news","cnn","nbc","bbc","radio","podcast",
  "preview","award","talk","interview",
  "show","daily","session","reality","question"
];

// ✅ нормальный контент
const ALLOW = [
  "film","movie","feature","full movie",
  "full film","series","season","episode 1"
];

function isClean(item) {
  const t = (item.title || "").toLowerCase();
  const d = (item.description || "").toLowerCase();

  if (BLOCK.some(w => t.includes(w) || d.includes(w))) return false;
  return ALLOW.some(w => t.includes(w) || d.includes(w));
}

// ===== ЗАГРУЗКА =====
async function fetchArchive(query) {
  content.innerHTML = "<p class='loading'>Загрузка…</p>";

  const url =
    "https://archive.org/advancedsearch.php" +
    "?q=" + encodeURIComponent(query) +
    "&fl[]=identifier&fl[]=title&fl[]=description" +
    "&rows=40&output=json";

  const res = await fetch(url);
  const data = await res.json();

  const clean = data.response.docs.filter(isClean);
  render(clean);
}

// ===== РЕНДЕР =====
function render(list) {
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
      <iframe src="https://archive.org/embed/${item.identifier}"
        allowfullscreen></iframe>
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

  render(favorites.map(id => ({
    identifier: id,
    title: id.replace(/_/g," ")
  })));
}

// ===== НАВИГАЦИЯ =====
function loadMovies() {
  fetchArchive("feature film full movie");
}

function loadSeries() {
  fetchArchive("tv series full episodes season");
}

function archiveSearch(text) {
  if (text.trim()) fetchArchive(text);
}

// ===== СТАРТ =====
loadMovies();


