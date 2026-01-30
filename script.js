const API_KEY = "YOUR_TMDB_API_KEY"; // позже вставим
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const content = document.getElementById("content");

// ---------- ГЛАВНАЯ ----------
function setSection(section) {
  if (section === "home") {
    content.innerHTML = `
      <h2>Добро пожаловать 🎬</h2>
      <p>Фильмы и сериалы онлайн</p>
      <input type="text" id="search" placeholder="Поиск..." />
      <button onclick="search()">Найти</button>
    `;
  }

  if (section === "movies") loadMovies();
  if (section === "series") loadSeries();
}

// ---------- ЗАГРУЗКА ФИЛЬМОВ ----------
async function loadMovies() {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ru-RU`
  );
  const data = await res.json();
  showItems(data.results, "Фильмы");
}

// ---------- ЗАГРУЗКА СЕРИАЛОВ ----------
async function loadSeries() {
  const res = await fetch(
    `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ru-RU`
  );
  const data = await res.json();
  showItems(data.results, "Сериалы");
}

// ---------- ПОИСК ----------
async function search() {
  const query = document.getElementById("search").value;
  if (!query) return;

  const res = await fetch(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}&language=ru-RU`
  );
  const data = await res.json();
  showItems(data.results, "Результаты поиска");
}

// ---------- ОТРИСОВКА ----------
function showItems(items, title) {
  content.innerHTML = `<h2>${title}</h2><div class="grid"></div>`;
  const grid = document.querySelector(".grid");

  items.forEach(item => {
    const name = item.title || item.name;
    const poster = item.poster_path
      ? IMG_URL + item.poster_path
      : "";

    if (!name) return;

    grid.innerHTML += `
      <div class="card">
        <img src="${poster}" />
        <h3>${name}</h3>
      </div>
    `;
  });
}

// ---------- СТАРТ ----------
document.addEventListener("DOMContentLoaded", () => {
  setSection("home");
});
