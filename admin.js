import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadAdminData();
  } else {
    loginSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
  }
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    alert("Erro ao realizar login: " + err.message);
  }
});

// Logout
document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

// Salvar Imagem Seção Sobre
document.getElementById('about-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('about-img-input').value;
  try {
    await setDoc(doc(db, "settings", "about"), { imgUrl: url });
    alert("Imagem da seção Sobre atualizada com sucesso!");
  } catch (err) {
    alert("Erro ao salvar imagem: " + err.message);
  }
});

// Salvar Banner
document.getElementById('banner-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "carousel"), {
      badge: document.getElementById('b-badge').value,
      title: document.getElementById('b-title').value,
      desc: document.getElementById('b-desc').value,
      btnText: document.getElementById('b-btnText').value,
      imgUrl: document.getElementById('b-img').value
    });
    alert("Banner cadastrado!");
    e.target.reset();
    loadAdminData();
  } catch (err) {
    alert("Erro ao salvar banner: " + err.message);
  }
});

// Salvar Produto
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "products"), {
      name: document.getElementById('p-name').value,
      price: parseFloat(document.getElementById('p-price').value),
      imgUrl: document.getElementById('p-img').value
    });
    alert("Produto cadastrado!");
    e.target.reset();
    loadAdminData();
  } catch (err) {
    alert("Erro ao salvar produto: " + err.message);
  }
});

// Carregar Dados
async function loadAdminData() {
  // Carregar URL atual do Sobre
  try {
    const aboutSnap = await getDoc(doc(db, "settings", "about"));
    if (aboutSnap.exists()) {
      document.getElementById('about-img-input').value = aboutSnap.data().imgUrl || '';
    }
  } catch (err) {
    console.error(err);
  }

  // Lista Banners
  const bannersList = document.getElementById('banners-list');
  bannersList.innerHTML = '';
  const bSnap = await getDocs(collection(db, "carousel"));
  bSnap.forEach((d) => {
    const data = d.data();
    bannersList.innerHTML += `
      <div class="item-card">
        <img src="${data.imgUrl}">
        <h4>${data.title}</h4>
        <button class="btn-danger" style="margin-top:10px; width:100%;" onclick="deleteItem('carousel', '${d.id}')">Excluir</button>
      </div>
    `;
  });

  // Lista Produtos
  const productsList = document.getElementById('products-list');
  productsList.innerHTML = '';
  const pSnap = await getDocs(collection(db, "products"));
  pSnap.forEach((d) => {
    const data = d.data();
    productsList.innerHTML += `
      <div class="item-card">
        <img src="${data.imgUrl}">
        <h4>${data.name}</h4>
        <p>R$ ${data.price.toFixed(2)}</p>
        <button class="btn-danger" style="margin-top:10px; width:100%;" onclick="deleteItem('products', '${d.id}')">Excluir</button>
      </div>
    `;
  });
}

window.deleteItem = async (coll, id) => {
  if (confirm("Tem certeza que deseja excluir?")) {
    await deleteDoc(doc(db, coll, id));
    loadAdminData();
  }
};