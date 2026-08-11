import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIe0UEwyoIccj_1KiE51awo9zI7lU_Ah8",
  authDomain: "xapn-517e9.firebaseapp.com",
  projectId: "xapn-517e9",
  storageBucket: "xapn-517e9.firebasestorage.app",
  messagingSenderId: "254063330561",
  appId: "1:254063330561:web:da0b235870a8921f15c700"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };