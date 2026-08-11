import {
  auth,
  db
} from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const ADMIN_UID =
  "mpBZ0ta8CJcyuQf10gS70BVBGcC2";


// =====================================================
// ELEMENTOS
// =====================================================

const loginScreen =
  document.getElementById("login-screen");

const dashboard =
  document.getElementById("dashboard");

const loginEmail =
  document.getElementById("login-email");

const loginPassword =
  document.getElementById("login-password");

const loginButton =
  document.getElementById("login-button");

const loginStatus =
  document.getElementById("login-status");

const logoutButton =
  document.getElementById("logout-button");


// =====================================================
// LOGIN
// =====================================================

loginButton.addEventListener(
  "click",
  async () => {

    const email =
      loginEmail.value.trim();

    const password =
      loginPassword.value;

    if (!email || !password) {

      showStatus(
        loginStatus,
        "Digite e-mail e senha.",
        true
      );

      return;
    }

    loginButton.disabled = true;

    loginButton.innerText =
      "Entrando...";

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    } catch (error) {

      console.error(error);

      showStatus(
        loginStatus,
        getAuthError(error),
        true
      );

      loginButton.disabled = false;

      loginButton.innerText =
        "Entrar";
    }

  }
);


// =====================================================
// VERIFICAR AUTENTICAÇÃO
// =====================================================

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {

      loginScreen.classList.remove(
        "hidden"
      );

      dashboard.classList.add(
        "hidden"
      );

      return;
    }


    // Segurança adicional no frontend
    if (user.uid !== ADMIN_UID) {

      await signOut(auth);

      showStatus(
        loginStatus,
        "Este usuário não possui acesso ao painel.",
        true
      );

      return;
    }


    loginScreen.classList.add(
      "hidden"
    );

    dashboard.classList.remove(
      "hidden"
    );

    await loadProducts();

    await loadCarousel();

  }
);


// =====================================================
// LOGOUT
// =====================================================

logoutButton.addEventListener(
  "click",
  async () => {

    await signOut(auth);

  }
);


// =====================================================
// PRODUTOS
// =====================================================

const productForm =
  document.getElementById("product-form");

const productId =
  document.getElementById("product-id");

const productTitle =
  document.getElementById("product-title");

const productPrice =
  document.getElementById("product-price");

const productDescription =
  document.getElementById(
    "product-description"
  );

const productImg =
  document.getElementById("product-img");

const productPreview =
  document.getElementById(
    "product-preview"
  );

const productSubmit =
  document.getElementById(
    "product-submit"
  );

const productCancel =
  document.getElementById(
    "product-cancel"
  );

const productStatus =
  document.getElementById(
    "product-status"
  );

const productList =
  document.getElementById(
    "product-list"
  );

let products = [];


// =====================================================
// CARREGAR PRODUTOS
// =====================================================

async function loadProducts() {

  try {

    const q = query(
      collection(db, "produtos"),
      orderBy("createdAt", "desc")
    );

    const snapshot =
      await getDocs(q);

    products =
      snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

  } catch (error) {

    console.warn(
      "Fallback produtos:",
      error
    );

    const snapshot =
      await getDocs(
        collection(db, "produtos")
      );

    products =
      snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));
  }

  renderProducts();
}


// =====================================================
// RENDER PRODUTOS
// =====================================================

function renderProducts() {

  if (!products.length) {

    productList.innerHTML = `
      <div
        style="
          color:rgba(255,255,255,.5);
          font-size:.8rem;
        "
      >
        Nenhum produto cadastrado.
      </div>
    `;

    return;
  }


  productList.innerHTML =
    products.map(product => `

      <div class="item">

        <img
          src="${escapeAttribute(product.img || "")}"
          alt=""
        >

        <div class="item-info">

          <div class="item-title">
            ${escapeHTML(product.title || "")}
          </div>

          <div class="item-price">
            ${formatPrice(product.price)}
          </div>

        </div>

        <div class="item-actions">

          <button
            class="edit"
            data-edit-product="${product.id}"
          >
            Editar
          </button>

          <button
            class="delete"
            data-delete-product="${product.id}"
          >
            Excluir
          </button>

        </div>

      </div>

    `).join("");
}


// =====================================================
// ADICIONAR / EDITAR PRODUTO
// =====================================================

productForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const title =
      productTitle.value.trim();

    const price =
      Number(productPrice.value);

    const description =
      productDescription.value.trim();

    const img =
      productImg.value.trim();

    if (!title || !img || Number.isNaN(price)) {

      showStatus(
        productStatus,
        "Preencha os campos obrigatórios.",
        true
      );

      return;
    }

    productSubmit.disabled = true;

    try {

      const data = {
        title,
        price,
        description,
        img,
        updatedAt:
          serverTimestamp()
      };


      if (productId.value) {

        await updateDoc(
          doc(
            db,
            "produtos",
            productId.value
          ),
          data
        );

        showStatus(
          productStatus,
          "Produto atualizado!",
          false
        );

      } else {

        await addDoc(
          collection(
            db,
            "produtos"
          ),
          {
            ...data,
            createdAt:
              serverTimestamp()
          }
        );

        showStatus(
          productStatus,
          "Produto adicionado!",
          false
        );
      }


      resetProductForm();

      await loadProducts();

    } catch (error) {

      console.error(error);

      showStatus(
        productStatus,
        "Erro ao salvar produto.",
        true
      );

    } finally {

      productSubmit.disabled = false;

    }

  }
);


// =====================================================
// EDITAR PRODUTO
// =====================================================

productList.addEventListener(
  "click",
  event => {

    const editButton =
      event.target.closest(
        "[data-edit-product]"
      );

    const deleteButton =
      event.target.closest(
        "[data-delete-product]"
      );


    if (editButton) {

      const id =
        editButton.dataset.editProduct;

      const product =
        products.find(
          item => item.id === id
        );

      if (!product) return;

      productId.value =
        product.id;

      productTitle.value =
        product.title || "";

      productPrice.value =
        product.price || "";

      productDescription.value =
        product.description || "";

      productImg.value =
        product.img || "";

      showPreview(
        productPreview,
        product.img
      );

      productSubmit.innerText =
        "Salvar alterações";

      productCancel.classList.remove(
        "hidden"
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }


    if (deleteButton) {

      deleteProduct(
        deleteButton.dataset.deleteProduct
      );

    }

  }
);


// =====================================================
// EXCLUIR PRODUTO
// =====================================================

async function deleteProduct(id) {

  const product =
    products.find(
      item => item.id === id
    );

  if (!product) return;

  const confirmed =
    confirm(
      `Excluir "${product.title}"?`
    );

  if (!confirmed) return;

  try {

    await deleteDoc(
      doc(
        db,
        "produtos",
        id
      )
    );

    await loadProducts();

    showStatus(
      productStatus,
      "Produto excluído.",
      false
    );

  } catch (error) {

    console.error(error);

    showStatus(
      productStatus,
      "Erro ao excluir produto.",
      true
    );

  }
}


// =====================================================
// CANCELAR EDIÇÃO
// =====================================================

productCancel.addEventListener(
  "click",
  resetProductForm
);


function resetProductForm() {

  productForm.reset();

  productId.value = "";

  productSubmit.innerText =
    "Adicionar produto";

  productCancel.classList.add(
    "hidden"
  );

  productPreview.style.display =
    "none";
}


// =====================================================
// PREVIEW PRODUTO
// =====================================================

productImg.addEventListener(
  "input",
  () => {

    showPreview(
      productPreview,
      productImg.value.trim()
    );

  }
);


// =====================================================
// CARROSSEL
// =====================================================

const carouselForm =
  document.getElementById(
    "carousel-form"
  );

const carouselId =
  document.getElementById(
    "carousel-id"
  );

const carouselTitle =
  document.getElementById(
    "carousel-title"
  );

const carouselImg =
  document.getElementById(
    "carousel-img"
  );

const carouselPreview =
  document.getElementById(
    "carousel-preview"
  );

const carouselSubmit =
  document.getElementById(
    "carousel-submit"
  );

const carouselCancel =
  document.getElementById(
    "carousel-cancel"
  );

const carouselStatus =
  document.getElementById(
    "carousel-status"
  );

const carouselList =
  document.getElementById(
    "carousel-list"
  );

let slides = [];


// =====================================================
// CARREGAR CARROSSEL
// =====================================================

async function loadCarousel() {

  try {

    const q = query(
      collection(db, "carrossel"),
      orderBy("createdAt", "asc")
    );

    const snapshot =
      await getDocs(q);

    slides =
      snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

  } catch (error) {

    console.warn(
      "Fallback carrossel:",
      error
    );

    const snapshot =
      await getDocs(
        collection(
          db,
          "carrossel"
        )
      );

    slides =
      snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));
  }

  renderCarouselAdmin();
}


// =====================================================
// RENDER CARROSSEL
// =====================================================

function renderCarouselAdmin() {

  if (!slides.length) {

    carouselList.innerHTML = `
      <div
        style="
          color:rgba(255,255,255,.5);
          font-size:.8rem;
        "
      >
        Nenhum slide cadastrado.
      </div>
    `;

    return;
  }


  carouselList.innerHTML =
    slides.map(slide => `

      <div class="item">

        <img
          src="${escapeAttribute(slide.img || "")}"
          alt=""
        >

        <div class="item-info">

          <div class="item-title">
            ${escapeHTML(slide.title || "")}
          </div>

        </div>

        <div class="item-actions">

          <button
            class="edit"
            data-edit-slide="${slide.id}"
          >
            Editar
          </button>

          <button
            class="delete"
            data-delete-slide="${slide.id}"
          >
            Excluir
          </button>

        </div>

      </div>

    `).join("");
}


// =====================================================
// ADICIONAR / EDITAR SLIDE
// =====================================================

carouselForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const title =
      carouselTitle.value.trim();

    const img =
      carouselImg.value.trim();

    if (!title || !img) {

      showStatus(
        carouselStatus,
        "Preencha os campos.",
        true
      );

      return;
    }

    carouselSubmit.disabled = true;

    try {

      const data = {
        title,
        img,
        updatedAt:
          serverTimestamp()
      };


      if (carouselId.value) {

        await updateDoc(
          doc(
            db,
            "carrossel",
            carouselId.value
          ),
          data
        );

        showStatus(
          carouselStatus,
          "Slide atualizado!",
          false
        );

      } else {

        await addDoc(
          collection(
            db,
            "carrossel"
          ),
          {
            ...data,
            createdAt:
              serverTimestamp()
          }
        );

        showStatus(
          carouselStatus,
          "Slide adicionado!",
          false
        );

      }


      resetCarouselForm();

      await loadCarousel();

    } catch (error) {

      console.error(error);

      showStatus(
        carouselStatus,
        "Erro ao salvar slide.",
        true
      );

    } finally {

      carouselSubmit.disabled = false;

    }

  }
);


// =====================================================
// EDITAR / EXCLUIR SLIDE
// =====================================================

carouselList.addEventListener(
  "click",
  event => {

    const edit =
      event.target.closest(
        "[data-edit-slide]"
      );

    const del =
      event.target.closest(
        "[data-delete-slide]"
      );


    if (edit) {

      const id =
        edit.dataset.editSlide;

      const slide =
        slides.find(
          item => item.id === id
        );

      if (!slide) return;

      carouselId.value =
        slide.id;

      carouselTitle.value =
        slide.title || "";

      carouselImg.value =
        slide.img || "";

      showPreview(
        carouselPreview,
        slide.img
      );

      carouselSubmit.innerText =
        "Salvar alterações";

      carouselCancel.classList.remove(
        "hidden"
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }


    if (del) {

      deleteSlide(
        del.dataset.deleteSlide
      );

    }

  }
);


// =====================================================
// EXCLUIR SLIDE
// =====================================================

async function deleteSlide(id) {

  const slide =
    slides.find(
      item => item.id === id
    );

  if (!slide) return;

  const confirmed =
    confirm(
      `Excluir "${slide.title}"?`
    );

  if (!confirmed) return;

  try {

    await deleteDoc(
      doc(
        db,
        "carrossel",
        id
      )
    );

    await loadCarousel();

    showStatus(
      carouselStatus,
      "Slide excluído.",
      false
    );

  } catch (error) {

    console.error(error);

    showStatus(
      carouselStatus,
      "Erro ao excluir slide.",
      true
    );

  }
}


// =====================================================
// CANCELAR CARROSSEL
// =====================================================

carouselCancel.addEventListener(
  "click",
  resetCarouselForm
);


function resetCarouselForm() {

  carouselForm.reset();

  carouselId.value = "";

  carouselSubmit.innerText =
    "Adicionar slide";

  carouselCancel.classList.add(
    "hidden"
  );

  carouselPreview.style.display =
    "none";
}


carouselImg.addEventListener(
  "input",
  () => {

    showPreview(
      carouselPreview,
      carouselImg.value.trim()
    );

  }
);


// =====================================================
// UTILITÁRIOS
// =====================================================

function showPreview(
  element,
  url
) {

  if (!url) {

    element.style.display =
      "none";

    return;
  }

  element.src = url;

  element.style.display =
    "block";

  element.onerror = () => {

    element.style.display =
      "none";

  };
}


function showStatus(
  element,
  message,
  error
) {

  element.innerText =
    message;

  element.className =
    `status ${error ? "error" : "success"}`;

}


function formatPrice(value) {

  return Number(value || 0)
    .toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );
}


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

  return escapeHTML(value);

}


function getAuthError(error) {

  switch (error.code) {

    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";

    case "auth/invalid-email":
      return "E-mail inválido.";

    case "auth/user-disabled":
      return "Este usuário foi desativado.";

    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um pouco.";

    default:
      return "Não foi possível entrar. Verifique seus dados.";

  }

}