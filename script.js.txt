let lang = "ru";
let section = "home";

const texts = {
  ru: {
    home: "Популярные и новые",
    movies: "Фильмы",
    series: "Сериалы",
    description: "Описание"
  },
  en: {
    home: "Popular & New",
    movies: "Movies",
    series: "Series",
    description: "Description"
  }
};

const movies = [
  {
    title: { ru: "Ночь живых мертвецов", en: "Night of the Living Dead" },
    type: "movie",
    desc: {
      ru: "Классический фильм ужасов (1968), public domain.",
      en: "Classic horror movie (1968), public domain."
    },
    embed: "https://www.youtube.com/embed/8QdW6n2R4A4"
  },
  {
    title: { ru: "Шерлок Холмс", en: "Sherlock Holmes" },
    type: "series",
    desc: {
      ru: "Сериал по произведениям Артура Конан Дойля.",
      en: "Series based on Arthur Conan Doyle works."
    },
    embed: "https://www.youtube.com/embed/videoseries?list=PLj7JZr7k0YzQ7"
  }
];

function toggleLang() {
  lang = lang === "ru" ? "en" : "ru";
  render();
}

function setSection(sec) {
  section = sec;
  render();
}

function render() {
  const content = document.getElementById("content");
  content.innerHTML = `<h2>${texts[lang][section] || texts[lang].home}</h2>`;

  const list = movies.filter(m =>
    section === "home" ? true :
    section === "movies" ? m.type === "movie" :
    section === "series" ? m.type === "series" : true
  );

  const grid = document.createElement("div");
  grid.className = "grid";

  list.forEach(m => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${m.title[lang]}</h3>
      <p>${m.desc[lang]}</p>
    `;
    card.onclick = () => openMovie(m);
    grid.appendChild(card);
  });

  content.appendChild(grid);
}

function openMovie(movie) {
  const content = document.getElementById("content");
  content.innerHTML = `
    <h2>${movie.title[lang]}</h2>
    <p><strong>${texts[lang].description}:</strong> ${movie.desc[lang]}</p>
    <div class="player">
      <iframe src="${movie.embed}" frameborder="0" allowfullscreen></iframe>
    </div>
    <br>
    <button onclick="render()">← Назад</button>
  `;
}

render();
