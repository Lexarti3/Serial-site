grid.innerHTML += `
  <div class="card" onclick="openMovie(${item.id})">
    <img src="${poster}" />
    <h3>${name}</h3>
  </div>
`;
function openMovie(id) {
  const content = document.getElementById("content");

  // ДЕМО-данные (позже заменим на API)
  const movies = {
    1: {
      title: "Big Buck Bunny",
      description: "Короткометражный мультфильм с открытой лицензией.",
      video: "https://archive.org/embed/BigBuckBunny"
    },
    2: {
      title: "Sintel",
      description: "Фэнтези-фильм, созданный Blender Foundation.",
      video: "https://archive.org/embed/Sintel"
    }
  };

  const movie = movies[id];

  content.innerHTML = `
    <section class="movie-page">
      <button onclick="goBack()">← Назад</button>
      <h2>${movie.title}</h2>
      <p>${movie.description}</p>

      <iframe 
        src="${movie.video}" 
        width="100%" 
        height="400" 
        frameborder="0" 
        allowfullscreen>
      </iframe>
    </section>
  `;
}
function goBack() {
  setSection('movies'); // или 'home'
}
