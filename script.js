const content = document.getElementById("content");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

const ALLOWED_KEYWORDS = [
  "movie",
  "film",
  "cinema",
  "feature",
  "episode",
  "series",
  "season"
];

// ===== ФИЛЬТР — УБИРАЕТ НОВОСТИ И МУСОР =====
function isValidItem(item) {
  const title = (item.title || "").toLowerCase();
  const desc = (item.description || "").toLowerCase();

  if (title.includes("news")) return false;
  if (title.includes("cnn")) return false;
  if (title.includes("nbc")) return false;
  if (title.includes("broadcast")) return false;
  if (title.includes("report")) return false;

  return ALLOWED_KEYWORDS.some(k =>
    title.includes(k) || desc.includes(k)
  );
}

// ===== ЗАГРУЗКА =====
async function fetchArchive(query) {
  content.innerHTML = "Загрузка...";
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
    query
  )}&fl[]=identifier&fl[]=title&fl[]=description&rows=50&page=1&output=json`;

  const res = await fetch(url);
  const data = await res.json();

  const items = data.response.docs.filter(isValidItem);
  renderGrid(items);
}

// ===== РЕНДЕР КАРТОЧЕК =====
function renderGrid(items) {
  content.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = `https://archive.org/services/img/${item.identifier}`;

    const title = document.createElement("h3");
    title.textContent = item.title;

    const fav = document.createElement("button");
    fav.className = "fav-btn";
    fav.innerHTML = favorites.includes(item.identifier) ? "★" : "☆";

    fav.onclick = e => {
      e.stopPropagation();
      toggleFavorite(item.identifier);
      fav.innerHTML = favorites.includes(item.identifier) ? "★" : "☆";
    };

    card.onclick = () => openPlayer(item);

    card.append(img, title, fav);
    content.appendChild(card);
  });
}

// ===== ПЛЕЕР =====
function openPlayer(item) {
  content.innerHTML = `
    <div class="movie-page">
      <button class="back-btn" onclick="loadMovies()">← Назад</button>
      <h2>${item.title}</h2>
      <iframe
        src="https://archive.org/embed/${item.identifier}"
        frameborder="0"
        allowfullscreen
      ></iframe>
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

function showFavorites() {
  if (!favorites.length) {
    content.innerHTML = "Избранное пусто ⭐";
    return;
  }

  const items = favorites.map(id => ({
    identifier: id,
    title: id
  }));

  renderGrid(items);
}

// ===== КНОПКИ =====
function loadMovies() {
  fetchArchive("feature film");
}

function loadSeries() {
  fetchArchive("tv series");
}

function search(q) {
  fetchArchive(q);
}

// ===== СТАРТ =====
loadMovies();
