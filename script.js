const movies = [
  {
    id: 1,
    name: "Big Buck Bunny",
    poster: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
    description: "Открытый мультфильм Blender.",
    video: "https://archive.org/embed/BigBuckBunny"
  },
  {
    id: 2,
    name: "Sintel",
    poster: "https://upload.wikimedia.org/wikipedia/commons/1/14/Sintel_poster.jpg",
    description: "Фэнтези короткометражка.",
    video: "https://archive.org/embed/Sintel"
  }
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
