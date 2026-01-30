const list = document.getElementById("list");

function load() {
  list.innerHTML = "";
  (JSON.parse(localStorage.getItem("sources") || "[]")).forEach(s => {
    const li = document.createElement("li");
    li.textContent = s.name + " — " + s.url;
    list.appendChild(li);
  });
}

function add() {
  const name = document.getElementById("name").value;
  const url = document.getElementById("url").value;
  const src = JSON.parse(localStorage.getItem("sources") || "[]");
  src.push({ name, url });
  localStorage.setItem("sources", JSON.stringify(src));
  load();
}

load();
