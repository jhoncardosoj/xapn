import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// =========================================================================
// CONFIGURAÇÃO DO FIREBASE (Substitua pelos dados do seu Firebase Console)
// =========================================================================
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

// Seletores de Autenticação / Interface
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginButton = document.getElementById("login-button");
const loginStatus = document.getElementById("login-status");
const logoutButton = document.getElementById("logout-button");

// Seletores de Produtos
const productForm = document.getElementById("product-form");
const productId = document.getElementById("product-id");
const productTitle = document.getElementById("product-title");
const productPrice = document.getElementById("product-price");
const productDescription = document.getElementById("product-description");
const productOrder = document.getElementById("product-order");
const productImg = document.getElementById("product-img");
const productFile = document.getElementById("product-file");
const productPreview = document.getElementById("product-preview");
const productSubmit = document.getElementById("product-submit");
const productCancel = document.getElementById("product-cancel");
const productStatus = document.getElementById("product-status");
const productList = document.getElementById("product-list");

// Seletores do Carrossel
const carouselForm = document.getElementById("carousel-form");
const carouselId = document.getElementById("carousel-id");
const carouselBadge = document.getElementById("carousel-badge");
const carouselTitle = document.getElementById("carousel-title");
const carouselDescription = document.getElementById("carousel-description");
const carouselButton = document.getElementById("carousel-button");
const carouselOrder = document.getElementById("carousel-order");
const carouselImg = document.getElementById("carousel-img");
const carouselFile = document.getElementById("carousel-file");
const carouselPreview = document.getElementById("carousel-preview");
const carouselSubmit = document.getElementById("carousel-submit");
const carouselCancel = document.getElementById("carousel-cancel");
const carouselStatus = document.getElementById("carousel-status");
const carouselList = document.getElementById("carousel-list");

// Variáveis para imagens Base64
let currentProductImgBase64 = "";
let currentCarouselImgBase64 = "";

// =========================================================================
// MODO DE SELEÇÃO DE IMAGEM (PRODUTO)
// =========================================================================
document.getElementById("product-url-mode")?.addEventListener("click", () => {
  document.getElementById("product-url-area").classList.remove("hidden");
  document.getElementById("product-file-area").classList.add("hidden");
  document.getElementById("product-url-mode").classList.add("active");
  document.getElementById("product-file-mode").classList.remove("active");
});

document.getElementById("product-file-mode")?.addEventListener("click", () => {
  document.getElementById("product-file-area").classList.remove("hidden");
  document.getElementById("product-url-area").classList.add("hidden");
  document.getElementById("product-file-mode").classList.add("active");
  document.getElementById("product-url-mode").classList.remove("active");
});

productFile?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentProductImgBase64 = event.target.result;
      productPreview.src = currentProductImgBase64;
      productPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// =========================================================================
// MODO DE SELEÇÃO DE IMAGEM (CARROSSEL)
// =========================================================================
document.getElementById("carousel-url-mode")?.addEventListener("click", () => {
  document.getElementById("carousel-url-area").classList.remove("hidden");
  document.getElementById("carousel-file-area").classList.add("hidden");
  document.getElementById("carousel-url-mode").classList.add("active");
  document.getElementById("carousel-file-mode").classList.remove("active");
});

document.getElementById("carousel-file-mode")?.addEventListener("click", () => {
  document.getElementById("carousel-file-area").classList.remove("hidden");
  document.getElementById("carousel-url-area").classList.add("hidden");
  document.getElementById("carousel-file-mode").classList.add("active");
  document.getElementById("carousel-url-mode").classList.remove("active");
});

carouselFile?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentCarouselImgBase64 = event.target.result;
      carouselPreview.src = currentCarouselImgBase64;
      carouselPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// =========================================================================
// AUTENTICAÇÃO
// =========================================================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");
    loadProducts();
    loadCarousel();
  } else {
    loginScreen.classList.remove("hidden");
    dashboard.classList.add("hidden");
  }
});

loginButton?.addEventListener("click", async () => {
  if (firebaseConfig.apiKey === "SUA_API_KEY_AQUI") {
    loginStatus.textContent = "Erro: Cole suas chaves do Firebase em admin.js";
    loginStatus.className = "status error";
    return;
  }

  loginStatus.textContent = "Autenticando...";
  loginStatus.className = "status info";
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
    loginStatus.textContent = "";
  } catch (err) {
    loginStatus.textContent = "Erro de autenticação: " + err.message;
    loginStatus.className = "status error";
  }
});

logoutButton?.addEventListener("click", () => signOut(auth));

// =========================================================================
// GERENCIAMENTO DE PRODUTOS
// =========================================================================
productForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  productStatus.textContent = "Salvando...";
  productStatus.className = "status info";

  const imageVal = currentProductImgBase64 || productImg.value;

  const data = {
    title: productTitle.value,
    price: parseFloat(productPrice.value),
    description: productDescription.value || "",
    order: parseInt(productOrder.value) || 0,
    image: imageVal || ""
  };

  try {
    if (productId.value) {
      await updateDoc(doc(db, "products", productId.value), data);
      productStatus.textContent = "Produto atualizado!";
    } else {
      await addDoc(collection(db, "products"), data);
      productStatus.textContent = "Produto adicionado!";
    }
    productStatus.className = "status success";
    resetProductForm();
  } catch (err) {
    productStatus.textContent = "Erro ao salvar: " + err.message;
    productStatus.className = "status error";
  }
});

function resetProductForm() {
  productForm.reset();
  productId.value = "";
  currentProductImgBase64 = "";
  productPreview.style.display = "none";
  productSubmit.textContent = "Adicionar produto";
  productCancel.classList.add("hidden");
}

productCancel?.addEventListener("click", resetProductForm);

function loadProducts() {
  const q = query(collection(db, "products"), orderBy("order", "asc"));
  onSnapshot(q, (snapshot) => {
    productList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.title}">
        <div class="item-info">
          <div class="item-title">${item.title}</div>
          <div class="item-price">R$ ${item.price.toFixed(2)}</div>
        </div>
        <div class="item-actions">
          <button class="edit" data-id="${id}">Editar</button>
          <button class="delete" data-id="${id}">Excluir</button>
        </div>
      `;

      div.querySelector(".edit").addEventListener("click", () => {
        productId.value = id;
        productTitle.value = item.title;
        productPrice.value = item.price;
        productDescription.value = item.description || "";
        productOrder.value = item.order || 0;
        productImg.value = item.image || "";
        productSubmit.textContent = "Atualizar produto";
        productCancel.classList.remove("hidden");
      });

      div.querySelector(".delete").addEventListener("click", async () => {
        if (confirm("Excluir este produto?")) {
          await deleteDoc(doc(db, "products", id));
        }
      });

      productList.appendChild(div);
    });
  });
}

// =========================================================================
// GERENCIAMENTO DO CARROSSEL
// =========================================================================
carouselForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  carouselStatus.textContent = "Salvando...";
  carouselStatus.className = "status info";

  const imageVal = currentCarouselImgBase64 || carouselImg.value;

  const data = {
    badge: carouselBadge.value || "",
    title: carouselTitle.value,
    description: carouselDescription.value || "",
    buttonText: carouselButton.value || "Ver coleção",
    order: parseInt(carouselOrder.value) || 0,
    image: imageVal || ""
  };

  try {
    if (carouselId.value) {
      await updateDoc(doc(db, "carousel", carouselId.value), data);
      carouselStatus.textContent = "Slide atualizado!";
    } else {
      await addDoc(collection(db, "carousel"), data);
      carouselStatus.textContent = "Slide adicionado!";
    }
    carouselStatus.className = "status success";
    resetCarouselForm();
  } catch (err) {
    carouselStatus.textContent = "Erro ao salvar: " + err.message;
    carouselStatus.className = "status error";
  }
});

function resetCarouselForm() {
  carouselForm.reset();
  carouselId.value = "";
  currentCarouselImgBase64 = "";
  carouselPreview.style.display = "none";
  carouselSubmit.textContent = "Adicionar slide";
  carouselCancel.classList.add("hidden");
}

carouselCancel?.addEventListener("click", resetCarouselForm);

function loadCarousel() {
  const q = query(collection(db, "carousel"), orderBy("order", "asc"));
  onSnapshot(q, (snapshot) => {
    carouselList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.title}">
        <div class="item-info">
          <div class="item-title">${item.title}</div>
          <div class="item-price">${item.badge || 'Slide'}</div>
        </div>
        <div class="item-actions">
          <button class="edit" data-id="${id}">Editar</button>
          <button class="delete" data-id="${id}">Excluir</button>
        </div>
      `;

      div.querySelector(".edit").addEventListener("click", () => {
        carouselId.value = id;
        carouselBadge.value = item.badge || "";
        carouselTitle.value = item.title;
        carouselDescription.value = item.description || "";
        carouselButton.value = item.buttonText || "";
        carouselOrder.value = item.order || 0;
        carouselImg.value = item.image || "";
        carouselSubmit.textContent = "Atualizar slide";
        carouselCancel.classList.remove("hidden");
      });

      div.querySelector(".delete").addEventListener("click", async () => {
        if (confirm("Excluir este slide?")) {
          await deleteDoc(doc(db, "carousel", id));
        }
      });

      carouselList.appendChild(div);
    });
  });
}