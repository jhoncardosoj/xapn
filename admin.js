import { auth, db, storage } from './firebase-config.js';
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
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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

// Função Auxiliar para Processar Imagem (Galeria ou URL)
async function getImageUrl(fileInput, urlInput, folder) {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } else if (urlInput.value.trim() !== "") {
    return urlInput.value.trim();
  } else {
    throw new Error("Por favor, selecione uma imagem da galeria ou cole uma URL.");
  }
}

// 1. Salvar Imagem Seção Sobre
document.getElementById('about-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-about');
  btn.innerText = "Enviando...";
  btn.disabled = true;

  try {
    const fileInput = document.getElementById('about-file');
    const urlInput = document.getElementById('about-img-input');
    const imgUrl = await getImageUrl(fileInput, urlInput, 'about');

    await setDoc(doc(db, "settings", "about"), { imgUrl });
    alert("Foto da seção Sobre atualizada!");
    fileInput.value = "";
  } catch (err) {
    alert("Erro: " + err.message);
  } finally {
    btn.innerText = "Atualizar Foto Sobre";
    btn.disabled = false;
  }
});

// 2. Salvar Banner
document.getElementById('banner-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-banner');
  btn.innerText = "Enviando...";
  btn.disabled = true;

  try {
    const fileInput = document.getElementById('b-file');
    const urlInput = document.getElementById('b-img');
    const imgUrl = await getImageUrl(fileInput, urlInput, 'carousel');

    await addDoc(collection(db, "carousel"), {
      badge: document.getElementById('b-badge').value,
      title: document.getElementById('b-title').value,
      desc: document.getElementById('b-desc').value,
      btnText: document.getElementById('b-btnText').value,
      imgUrl
    });

    alert("Banner cadastrado!");
    e.target.reset();
    loadAdminData();
  } catch (err) {
    alert("Erro: " + err.message);
  } finally {
    btn.innerText = "Cadastrar Banner";
    btn.disabled = false;
  }
});

// 3. Salvar Produto
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-product');
  btn.innerText = "Enviando...";
  btn.disabled = true;

  try {
    const fileInput = document.getElementById('p-file');
    const urlInput = document.getElementById('p-img');
    const imgUrl = await getImageUrl(fileInput, urlInput, 'products');

    await addDoc(collection(db, "products"), {
      name: document.getElementById('p-name').value,
      price: parseFloat(document.getElementById('p-price').value),
      imgUrl
    });

    alert("Produto cadastrado!");
    e.target.reset();
    loadAdminData();
  } catch (err) {
    alert("Erro: " + err.message);
  } finally {
    btn.innerText = "Cadastrar Produto";
    btn.disabled = false;
  }
});

// 4. Carregar Listas do Admin
async function loadAdminData() {
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