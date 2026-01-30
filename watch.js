const KEY = "326dbfdc8731edbdf825d569a44d4ede";
const API = "https://api.themoviedb.org/3";

const params = new URLSearchParams(location.search);
const id = params.get("id");
const type = params.get("type");

const titleEl = document.getElementById("title");
const overviewEl = document.getElementById("overview");
const player = document.getElementById("player");
const select = document.getElementById("sourceSelect");

async function loadInfo() {
  const r = await fetch(`${API}/${type}/${id}?api_key=${KEY}&language=ru-RU`);
  const d = await r.json();
  titleEl.textContent = d.title || d.name;
  overviewEl.textContent = d.overview;
}

function getSources() {
  return [
    {
      name: "Archive.org",
      url: `https://archive.org/embed/${id}`
    },
    {
      name: "YouTube (поиск)",
      url: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(titleEl.textContent + " trailer")}`
    }
  ];
}

function loadPlayer() {
  const sources = getSources();
  select.innerHTML = "";
  sources.forEach(s => {
    const o = document.createElement("option");
    o.textContent = s.name;
    o.value = s.url;
    select.appendChild(o);
  });
  player.src = sources[0].url;
}

select.onchange = () => {
  player.src = select.value;
};

loadInfo().then(loadPlayer);


