let currentPage = 1;
const perPage = 12;
let currentQuery = "movies";
];

// ===== РЕНДЕР КАРТОЧЕК =====
function renderMovies(list) {
  const content = document.getElementById("content");

  content.innerHTML = `<div class="grid" id="grid"></div>`;
  const grid = document.getElementById("grid");

  list.forEach(item => {
    grid.innerHTML += `
      <div class="card" onclick="openMovie(${item.id})">
        <img src="${item.poster}">
        <h3>${item.name}</h3>
      </div>
    `;
  });
}

// ===== ОТКРЫТИЕ ФИЛЬМА =====
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

// ===== НАВИГАЦИЯ =====
function setSection(section) {
  if (section === "movies") {
    renderMovies(movies);
  }
}

// ===== ПОИСК =====
function searchMovies(text) {
  const filtered = movies.filter(movie =>
    movie.name.toLowerCase().includes(text.toLowerCase())
  );
  renderMovies(filtered);
}
async function loadFromArchive() {
  const res = await fetch(
    "https://archive.org/advancedsearch.php?q=mediatype:(movies)+AND+licenseurl:*publicdomain*&fl[]=identifier&fl[]=title&fl[]=description&rows=20&page=1&output=json"
  );
  const data = await res.json();

  movies.length = 0; // очищаем массив

  data.response.docs.forEach((item, index) => {
    movies.push({
      id: index + 1,
      name: item.title,
      poster: "https://archive.org/services/img/" + item.identifier,
      description: item.description || "Public domain movie",
      video: "https://archive.org/embed/" + item.identifier
    });
  });

  renderMovies(movies);
}
async function loadFromArchive() {
  const content = document.getElementById("content");

  // ⬇️ ВОТ СЮДА
  content.innerHTML = "<p>Загрузка фильмов...</p>";

  const res = await fetch(
    "https://archive.org/advancedsearch.php?q=mediatype:(movies)&fl[]=identifier,title,description&rows=20&page=1&output=json"
  );

  const data = await res.json();

  movies.length = 0; // очищаем массив

  data.response.docs.forEach((item, index) => {
    movies.push({
      id: index + 1,
      name: item.title,
      poster: "https://archive.org/services/img/" + item.identifier,
      description: item.description || "Public domain movie",
      video: "https://archive.org/embed/" + item.identifier
    });
  });

  renderMovies(movies);
}

async function loadFromArchive(query = "movies", page = 1) {
  const content = document.getElementById("content");

  // 1️⃣ Показываем загрузку
  content.innerHTML = "<p>Загрузка фильмов...</p>";

  // 2️⃣ Запоминаем состояние
  currentQuery = query;
  currentPage = page;

  // 3️⃣ Считаем с какого фильма грузить
  const start = (page - 1) * perPage;

  // 4️⃣ Формируем URL запроса
  const url =
    "https://archive.org/advancedsearch.php" +
    "?q=mediatype:(movies)%20AND%20" + query +
    "&fl[]=identifier" +
    "&fl[]=title" +
    "&fl[]=description" +
    "&rows=" + perPage +
    "&start=" + start +
    "&output=json";

  // 5️⃣ Запрос к Archive
  const res = await fetch(url);
  const data = await res.json();

  // 6️⃣ Очищаем список фильмов
  movies = [];

  // 7️⃣ Заполняем новыми данными
  data.response.docs.forEach((item, index) => {
    movies.push({
      id: index + 1,
      name: item.title,
      poster: "https://archive.org/services/img/" + item.identifier,
      description: item.description || "Public domain movie",
      video: "https://archive.org/embed/" + item.identifier
    });
  });

  // 8️⃣ Рендер
  renderMovies(movies);
  renderPagination();
}


  pagination.innerHTML += `<span>Страница ${currentPage}</span>`;

  pagination.innerHTML += `
    <button onclick="loadFromArchive('${currentQuery}', ${currentPage + 1})">
      Вперёд →
    </button>
  `;

  content.appendChild(pagination);
}
function archiveSearch(text) {
  if (!text.trim()) return;   // если пусто — ничего не делаем
  loadFromArchive(text, 1);   // загружаем с Archive
}
