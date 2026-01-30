<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyB6Z-zkxFnOKYvfA6efLHLHkOQ6TdmPD5U",
  authDomain: "moxse-3b0be.firebaseapp.com",
  projectId: "moxse-3b0be",
  storageBucket: "moxse-3b0be.appspot.com",
  messagingSenderId: "33139757396",
  appId: "1:33139757396:web:431a112d4e82ab044878c1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
</script>
