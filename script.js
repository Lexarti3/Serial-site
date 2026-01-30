// ===== СОСТОЯНИЕ =====
let movies = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentPage = 1;
let currentQuery = "movies";
const perPage = 12;
let isLoading = false;

// ===== РЕНДЕР КАРТОЧЕК =====
function renderMovies(list, append = false) {
  const content = document.getElementById("content");

  if (!append) {
    content.innerHTML = `<div class="grid" id="grid"></div>`;
  }

  const grid = document.getElementById("grid");

  list.forEach(item => {
    const isFav = favorites.some(f => f.video === item.video);

    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => openMovie(item.id);

    card.innerHTML = `
      <img src="${item.poster}">
      <h3>${item.name}</h3>
      <button class="fav-btn">${isFav ? "⭐" : "☆"}</button>
    `;

    card.querySelector(".fav-btn").onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(item.id);
    };

    grid.appendChild(card);
  });
}

// ===== СТРАНИЦА ФИЛЬМА / СЕРИАЛА =====
function openMovie(id) {
  const movie = movies.find(m => m.id === id);
  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="movie-page">
      <button onclick="renderMovies(movies)">← Назад</button>
      <h2>${movie.name}</h2>
      <p>${movie.description}</p>

      <iframe
        src="${movie.video}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

// ===== ЗАГРУЗКА С ARCHIVE.ORG =====
async function loadFromArchive(type = "movies", page = 1) {
  if (isLoading) return;
  isLoading = true;

  const content = document.getElementById("content");

  if (page === 1) {
    content.innerHTML = "<p class='loading'>Загрузка...</p>";
    movies = [];
  }

  currentQuery = type;
  currentPage = page;

  const start = (page - 1) * perPage;

  // 🔥 РАЗЛИЧИЕ ФИЛЬМЫ / СЕРИАЛЫ
  let searchQuery;
  if (type === "tv") {
    searchQuery = "collection:(television)";
  } else {
    searchQuery = "mediatype:(movies)";
  }

  const url =
    "https://archive.org/advancedsearch.php" +
    "?q=" + searchQuery +
    "&fl[]=identifier&fl[]=title&fl[]=description" +
    "&rows=" + perPage +
    "&start=" + start +
    "&output=json";

  const res = await fetch(url);
  const data = await res.json();

  data.response.docs.forEach((item) => {
    movies.push({
      id: movies.length + 1,
      name: item.title,
      poster: "https://archive.org/services/img/" + item.identifier,
      description: item.description || "Public domain content",
      video: "https://archive.org/embed/" + item.identifier
    });
  });

  renderMovies(movies, page !== 1);
  isLoading = false;
}

// ===== ИЗБРАННОЕ =====
function toggleFavorite(id) {
  const movie = movies.find(m => m.id === id);
  const index = favorites.findIndex(f => f.video === movie.video);

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(movie);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderMovies(movies, true);
}

function showFavorites() {
  if (favorites.length === 0) {
    document.getElementById("content").innerHTML =
      "<p class='loading'>Избранное пусто ⭐</p>";
    return;
  }

  renderMovies(favorites);
}

// ===== ПОИСК =====
function archiveSearch(text) {
  if (!text.trim()) return;
  loadFromArchive(currentQuery, 1);
}

// ===== INFINITE SCROLL =====
window.addEventListener("scroll", () => {
  if (isLoading) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadFromArchive(currentQuery, currentPage + 1);
  }
});

// ===== СТАРТ =====
loadFromArchive("movies");
