const API_KEY = "326dbfdc8731edbdf825d569a44d4ede";
const IMG = "https://image.tmdb.org/t/p/w500";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const type = params.get("type"); // movie | tv

const titleEl = document.getElementById("title");
const overviewEl = document.getElementById("overview");
const player = document.getElementById("player");

const tvControls = document.getElementById("tvControls");
const seasonsEl = document.getElementById("seasons");
const episodesEl = document.getElementById("episodes");

/* =============================
   ARCHIVE PLAYER (SAFE DEMO)
============================= */
function loadArchivePlayer(query) {
  player.src = `https://archive.org/embed/${encodeURIComponent(query)}`;
}

/* =============================
   MOVIE
============================= */
async function loadMovie() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=ru-RU`
  );
  const movie = await res.json();

  titleEl.textContent = movie.title;
  overviewEl.textContent = movie.overview || "Описание отсутствует";

  // ⚠️ archive.org не гарантирует совпадение
  loadArchivePlayer(movie.title);
}

/* =============================
   TV SHOW
============================= */
async function loadTV() {
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=ru-RU`
  );
  const tv = await res.json();

  titleEl.textContent = tv.name;
  overviewEl.textContent = tv.overview || "Описание отсутствует";

  tvControls.style.display = "block";

  renderSeasons(tv.seasons, tv.name);
}

function renderSeasons(seasons, showName) {
  seasonsEl.innerHTML = "";
  episodesEl.innerHTML = "";

  seasons.forEach((season) => {
    if (season.season_number === 0) return;

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = `Сезон ${season.season_number}`;

    btn.onclick = () =>
      loadSeason(showName, season.season_number, btn);

    seasonsEl.appendChild(btn);
  });
}

async function loadSeason(showName, seasonNumber, activeBtn) {
  document
    .querySelectorAll(".seasons .btn")
    .forEach((b) => b.classList.remove("active"));

  activeBtn.classList.add("active");

  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=ru-RU`
  );
  const season = await res.json();

  episodesEl.innerHTML = "";

  season.episodes.forEach((ep) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = `Серия ${ep.episode_number}`;

    btn.onclick = () => {
      loadArchivePlayer(
        `${showName} season ${seasonNumber} episode ${ep.episode_number}`
      );
    };

    episodesEl.appendChild(btn);
  });
}

/* =============================
   INIT
============================= */
if (type === "movie") {
  loadMovie();
}

if (type === "tv") {
  loadTV();
}

