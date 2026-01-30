let movies = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentQuery = "";
let currentType = "movies";
let currentPage = 1;
const perPage = 12;
let isLoading = false;

// =================== РЕНДЕР ===================
function renderMovies(list) {
  const content = document.getElementById("content");
  content.innerHTML = `<div class="grid" id="grid"></div>`;
  const grid = document.getElementById("grid");

  list.forEach(item => {
    const isFav = favorites.some(f => f.id === item.id);

    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => openMovie(item);

    card.innerHTML = `
      <img src="${item.poster}">
      <h3>${item.title}</h3>
      <button class="fav">${isFav ? "⭐" : "☆"}</button>
    `;

    card.querySelector(".fav").onclick = e => {
      e.stopPropagation();
      toggleFavorite(item);
    };

    grid.appendChild(card);
  });
}

// =================== ПРОСМОТР ===================
function openMovie(movie) {
  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="movie-page">
      <button onclick="renderMovies(movies)">← Назад</button>
      <h2>${movie.title}</h2>
      <iframe
        src="https://archive.org/embed/${movie.id}"
        allowfullscreen
      ></iframe>
    </div>
  `;
}

// =================== ИЗБРАННОЕ ===================
function toggleFavorite(movie) {
  const index = favorites.findIndex(f => f.id === movie.id);

  if (index >= 0) favorites.splice(index, 1);
  else favorites.push(movie);

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderMovies(movies);
}

function showFavorites() {
  if (!favorites.length) {
    document.getElementById("content").innerHTML =
      "<p class='loading'>Избранное пусто ⭐</p>";
    return;
  }
  renderMovies(favorites);
}

// =================== ЗАГРУЗКА С ARCHIVE ===================
async function fetchArchive(query, type, page = 1) {
  if (isLoading) return;
  isLoading = true;

  const content = document.getElementById("content");
  content.innerHTML = "<p class='loading'>Загрузка…</p>";

  const start = (page - 1) * perPage;

  // 🔥 ВАЖНО: ЖЁСТКИЙ ФИЛЬТР — ТОЛЬКО ФИЛЬМЫ / СЕРИАЛЫ
  const url =
    `https://archive.org/advancedsearch.php?` +
    `q=mediatype:(movies)` +
    ` AND (${type === "series" ? "collection:television" : "collection:(feature_films OR movies)"} )` +
    (query ? ` AND ${query}` : ``) +
    `&fl[]=identifier&fl[]=title` +
    `&rows=${perPage}&start=${start}&output=json`;

  const res = await fetch(url);
  const data = await res.json();

  movies = data.response.docs
    .filter(d => d.identifier && d.title)
    .map(d => ({
      id: d.identifier,
      title: d.title,
      poster: `https://archive.org/services/img/${d.identifier}`
    }));

  renderMovies(movies);
  isLoading = false;
}

// =================== КНОПКИ ===================
function loadMovies() {
  currentType = "movies";
  fetchArchive("", "movies");
}

function loadSeries() {
  currentType = "series";
  fetchArchive("", "series");
}

function archiveSearch(text) {
  if (!text.trim()) return;
  fetchArchive(text, currentType);
}

// =================== СТАРТ ===================
loadMovies();

