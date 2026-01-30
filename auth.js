<script type="module">
import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Вход выполнен");
  } catch (e) {
    alert(e.message);
  }
};

window.register = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Аккаунт создан");
  } catch (e) {
    alert(e.message);
  }
};

window.logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, user => {
  const status = document.getElementById("auth-status");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    status.innerText = "Вы вошли: " + user.email;
    logoutBtn.style.display = "block";
  } else {
    status.innerText = "Вы не авторизованы";
    logoutBtn.style.display = "none";
  }
});
</script>

