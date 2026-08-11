```javascript
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

// UID do administrador
const ADMIN_UID = "mpBZ0ta8CJcyuQf10gS70BVBGcC2";

// Coleções usadas pelo SITE
// IMPORTANTE:
// O index.html usa "products" e "carousel".
const PRODUCTS_COLLECTION = "products";
const CAROUSEL_COLLECTION = "carousel";


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
// ELEMENTOS - PRODUTOS
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
  document.getElementById("product-description");

const productImg =
  document.getElementById("product-img");

const productPreview =
  document.getElementById("product-preview");

const productSubmit =
  document.getElementById("product-submit");

const productCancel =
  document.getElementById("product-cancel");

const productStatus =
  document.getElementById("product-status");

const productList =
  document.getElementById("product-list");


// =====================================================
// ELEMENTOS - CARROSSEL
// =====================================================

const carouselForm =
  document.getElementById("carousel-form");

const carouselId =
  document.getElementById("carousel-id");

const carouselTitle =
  document.getElementById("carousel-title");

const carouselImg =
  document.getElementById("carousel-img");

const carouselPreview =
  document.getElementById("carousel-preview");

const carouselSubmit =
  document.getElementById("carousel-submit");

const carouselCancel =
  document.getElementById("carousel-cancel");

const carouselStatus =
  document.getElementById("carousel-status");

const carouselList =
  document.getElementById("carousel-list");


// =====================================================
// ESTADO
// =====================================================

let products = [];
let slides = [];


// =====================================================
// MELHORIAS AUTOMÁTICAS DO PAINEL
// =====================================================

// -----------------------------------------------------
// BOTÃO VOLTAR PARA A LOJA
// -----------------------------------------------------

function createBackButton() {

  if (document.getElementById("back-store-button")) {
    return;
  }

  const button = document.createElement("button");

  button.id = "back-store-button";
  button.type = "button";
  button.innerHTML = "← Voltar para a loja";

  button.style.cssText = `
    width: auto;
    margin-top: 10px;
    padding: 10px 16px;
    background: rgba(255,255,255,.10);
    color: white;
    border: 1px solid rgba(255,255,255,.20);
    border-radius: 10px;
    cursor: pointer;
    font-family: inherit;
    font-size: .78rem;
  `;

  button.addEventListener("click", () => {
    window.location.href = "./index.html";
  });

  const topbar = document.querySelector(".topbar");

  if (topbar) {
    topbar.appendChild(button);
  }
}


// -----------------------------------------------------
// BOTÃO MOSTRAR / OCULTAR SENHA
// -----------------------------------------------------

function createPasswordToggle() {

  if (!loginPassword) {
    return;
  }

  if (document.getElementById("password-toggle")) {
    return;
  }

  const wrapper = document.createElement("div");

  wrapper.style.cssText = `
    position: relative;
    width: 100%;
  `;

  loginPassword.parentNode.insertBefore(
    wrapper,
    loginPassword
  );

  wrapper.appendChild(loginPassword);

  loginPassword.style.paddingRight = "50px";

  const button = document.createElement("button");

  button.id = "password-toggle";
  button.type = "button";
  button.innerHTML = "👁";

  button.style.cssText = `
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 38px;
    height: 38px;
    padding: 0;
    background: transparent;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 18px;
  `;

  button.addEventListener("click", () => {

    const showing =
      loginPassword.type === "text";

    loginPassword.type =
      showing ? "password" : "text";

    button.innerHTML =
      showing ? "👁" : "🙈";

  });

  wrapper.appendChild(button);
}


// =====================================================
// INICIALIZA MELHORIAS
// =====================================================

createPasswordToggle();
createBackButton();


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
        "Digite seu e-mail e sua senha.",
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

      console.error(
        "Erro no login:",
        error
      );

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
// ENTER NO LOGIN
// =====================================================

loginPassword.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      loginButton.click();
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

      loginButton.disabled = false;

      loginButton.innerText =
        "Entrar";

      return;
    }


    // -------------------------------------------------
    // VERIFICA UID DO ADMINISTRADOR
    // -------------------------------------------------

    if (user.uid !== ADMIN_UID) {

      console.warn(
        "Usuário autenticado sem permissão:",
        user.uid
      );

      await signOut(auth);

      loginScreen.classList.remove(
        "hidden"
      );

      dashboard.classList.add(
        "hidden"
      );

      showStatus(
        loginStatus,
        "Este usuário não possui acesso ao painel.",
        true
      );

      return;
    }


    // -------------------------------------------------
    // LOGIN AUTORIZADO
    // -------------------------------------------------

    loginScreen.classList.add(
      "hidden"
    );

    dashboard.classList.remove(
      "hidden"
    );


    // Recria botão caso necessário
    createBackButton();


    // Carrega dados
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

    try {

      await signOut(auth);

    } catch (error) {

      console.error(
        "Erro ao sair:",
        error
      );

    }

  }
);


// =====================================================
// PRODUTOS
// =====================================================

async function loadProducts() {

  try {

    const q = query(
      collection(
        db,
        PRODUCTS_COLLECTION
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const snapshot =
      await getDocs(q);

    products =
      snapshot.docs.map(
        item => ({
          id: item.id,
          ...item.data()
        })
      );

  } catch (error) {

    console.warn(
      "Não foi possível ordenar produtos. Carregando sem ordenação.",
      error
    );

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            PRODUCTS_COLLECTION
          )
        );

      products =
        snapshot.docs.map(
          item => ({
            id: item.id,
            ...item.data()
          })
        );

      products.sort(
        (a, b) => {

          const dateA =
            a.createdAt?.seconds || 0;

          const dateB =
            b.createdAt?.seconds || 0;

          return dateB - dateA;

        }
      );

    } catch (secondError) {

      console.error(
        "Erro ao carregar produtos:",
        secondError
      );

      products = [];

      showStatus(
        productStatus,
        "Não foi possível carregar os produtos. Verifique as regras do Firestore.",
        true
      );

    }

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
          padding:10px 0;
        "
      >
        Nenhum produto cadastrado.
      </div>
    `;

    return;
  }


  productList.innerHTML =
    products.map(
      product => `

        <div class="item">

          <img
            src="${escapeAttribute(
              product.img || ""
            )}"
            alt="${escapeAttribute(
              product.title || ""
            )}"
            onerror="this.style.opacity='.25'"
          >

          <div class="item-info">

            <div class="item-title">
              ${escapeHTML(
                product.title || "Produto"
              )}
            </div>

            <div class="item-price">
              ${formatPrice(
                product.price
              )}
            </div>

          </div>

          <div class="item-actions">

            <button
              class="edit"
              type="button"
              data-edit-product="${escapeAttribute(
                product.id
              )}"
            >
              Editar
            </button>

            <button
              class="delete"
              type="button"
              data-delete-product="${escapeAttribute(
                product.id
              )}"
            >
              Excluir
            </button>

          </div>

        </div>

      `
    ).join("");

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


    if (
      !title ||
      !img ||
      Number.isNaN(price)
    ) {

      showStatus(
        productStatus,
        "Preencha nome, preço e imagem.",
        true
      );

      return;
    }


    productSubmit.disabled = true;

    productSubmit.innerText =
      productId.value
        ? "Salvando..."
        : "Adicionando...";


    try {

      const data = {

        title,

        price,

        description,

        img,

        updatedAt:
          serverTimestamp()

      };


      // -------------------------------------------------
      // EDITAR
      // -------------------------------------------------

      if (productId.value) {

        await updateDoc(
          doc(
            db,
            PRODUCTS_COLLECTION,
            productId.value
          ),
          data
        );

        showStatus(
          productStatus,
          "Produto atualizado com sucesso!",
          false
        );

      }

      // -------------------------------------------------
      // ADICIONAR
      // -------------------------------------------------

      else {

        await addDoc(
          collection(
            db,
            PRODUCTS_COLLECTION
          ),
          {

            ...data,

            createdAt:
              serverTimestamp(),

            order:
              products.length

          }
        );

        showStatus(
          productStatus,
          "Produto adicionado com sucesso!",
          false
        );

      }


      resetProductForm();

      await loadProducts();


    } catch (error) {

      console.error(
        "Erro ao salvar produto:",
        error
      );

      showStatus(
        productStatus,
        getFirestoreError(error),
        true
      );

    } finally {

      productSubmit.disabled = false;

      productSubmit.innerText =
        productId.value
          ? "Salvar alterações"
          : "Adicionar produto";

    }

  }
);


// =====================================================
// EDITAR / EXCLUIR PRODUTO
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


    // -------------------------------------------------
    // EDITAR
    // -------------------------------------------------

    if (editButton) {

      const id =
        editButton.dataset.editProduct;

      const product =
        products.find(
          item => item.id === id
        );

      if (!product) {
        return;
      }


      productId.value =
        product.id;

      productTitle.value =
        product.title || "";

      productPrice.value =
        product.price ?? "";

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


      productForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }


    // -------------------------------------------------
    // EXCLUIR
    // -------------------------------------------------

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

  if (!product) {
    return;
  }


  const confirmed =
    confirm(
      `Excluir "${product.title || "este produto"}"?`
    );


  if (!confirmed) {
    return;
  }


  try {

    await deleteDoc(
      doc(
        db,
        PRODUCTS_COLLECTION,
        id
      )
    );


    showStatus(
      productStatus,
      "Produto excluído com sucesso!",
      false
    );


    await loadProducts();


  } catch (error) {

    console.error(
      "Erro ao excluir produto:",
      error
    );

    showStatus(
      productStatus,
      getFirestoreError(error),
      true
    );

  }

}


// =====================================================
// CANCELAR EDIÇÃO PRODUTO
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

  productPreview.removeAttribute(
    "src"
  );

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

async function loadCarousel() {

  try {

    const q = query(
      collection(
        db,
        CAROUSEL_COLLECTION
      ),
      orderBy(
        "order",
        "asc"
      )
    );


    const snapshot =
      await getDocs(q);


    slides =
      snapshot.docs.map(
        item => ({
          id: item.id,
          ...item.data()
        })
      );


  } catch (error) {

    console.warn(
      "Não foi possível ordenar o carrossel. Carregando sem ordenação.",
      error
    );


    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            CAROUSEL_COLLECTION
          )
        );


      slides =
        snapshot.docs.map(
          item => ({
            id: item.id,
            ...item.data()
          })
        );


      slides.sort(
        (a, b) =>
          (a.order ?? 9999) -
          (b.order ?? 9999)
      );


    } catch (secondError) {

      console.error(
        "Erro ao carregar carrossel:",
        secondError
      );

      slides = [];

      showStatus(
        carouselStatus,
        "Não foi possível carregar o carrossel. Verifique as regras do Firestore.",
        true
      );

    }

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
          padding:10px 0;
        "
      >
        Nenhum slide cadastrado.
      </div>
    `;

    return;
  }


  carouselList.innerHTML =
    slides.map(
      slide => `

        <div class="item">

          <img
            src="${escapeAttribute(
              slide.img || ""
            )}"
            alt="${escapeAttribute(
              slide.title || ""
            )}"
            onerror="this.style.opacity='.25'"
          >

          <div class="item-info">

            <div class="item-title">
              ${escapeHTML(
                slide.title || "Slide"
              )}
            </div>

            <div
              style="
                color:rgba(255,255,255,.5);
                font-size:.7rem;
                margin-top:3px;
              "
            >
              Ordem:
              ${slide.order ?? 9999}
            </div>

          </div>

          <div class="item-actions">

            <button
              class="edit"
              type="button"
              data-edit-slide="${escapeAttribute(
                slide.id
              )}"
            >
              Editar
            </button>

            <button
              class="delete"
              type="button"
              data-delete-slide="${escapeAttribute(
                slide.id
              )}"
            >
              Excluir
            </button>

          </div>

        </div>

      `
    ).join("");

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
        "Preencha o título e a imagem.",
        true
      );

      return;
    }


    carouselSubmit.disabled = true;

    carouselSubmit.innerText =
      carouselId.value
        ? "Salvando..."
        : "Adicionando...";


    try {

      const data = {

        title,

        img,

        updatedAt:
          serverTimestamp()

      };


      // -------------------------------------------------
      // EDITAR SLIDE
      // -------------------------------------------------

      if (carouselId.value) {

        await updateDoc(
          doc(
            db,
            CAROUSEL_COLLECTION,
            carouselId.value
          ),
          data
        );


        showStatus(
          carouselStatus,
          "Slide atualizado com sucesso!",
          false
        );

      }


      // -------------------------------------------------
      // ADICIONAR SLIDE
      // -------------------------------------------------

      else {

        await addDoc(
          collection(
            db,
            CAROUSEL_COLLECTION
          ),
          {

            ...data,

            createdAt:
              serverTimestamp(),

            order:
              slides.length

          }
        );


        showStatus(
          carouselStatus,
          "Slide adicionado com sucesso!",
          false
        );

      }


      resetCarouselForm();

      await loadCarousel();


    } catch (error) {

      console.error(
        "Erro ao salvar slide:",
        error
      );

      showStatus(
        carouselStatus,
        getFirestoreError(error),
        true
      );

    } finally {

      carouselSubmit.disabled = false;

      carouselSubmit.innerText =
        carouselId.value
          ? "Salvar alterações"
          : "Adicionar slide";

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


    // -------------------------------------------------
    // EDITAR
    // -------------------------------------------------

    if (edit) {

      const id =
        edit.dataset.editSlide;

      const slide =
        slides.find(
          item => item.id === id
        );

      if (!slide) {
        return;
      }


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


      carouselForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }


    // -------------------------------------------------
    // EXCLUIR
    // -------------------------------------------------

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

  if (!slide) {
    return;
  }


  const confirmed =
    confirm(
      `Excluir "${slide.title || "este slide"}"?`
    );


  if (!confirmed) {
    return;
  }


  try {

    await deleteDoc(
      doc(
        db,
        CAROUSEL_COLLECTION,
        id
      )
    );


    showStatus(
      carouselStatus,
      "Slide excluído com sucesso!",
      false
    );


    await loadCarousel();


  } catch (error) {

    console.error(
      "Erro ao excluir slide:",
      error
    );

    showStatus(
      carouselStatus,
      getFirestoreError(error),
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

  carouselPreview.removeAttribute(
    "src"
  );

}


// =====================================================
// PREVIEW CARROSSEL
// =====================================================

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
// PREVIEW
// =====================================================

function showPreview(
  element,
  url
) {

  if (!url) {

    element.style.display =
      "none";

    element.removeAttribute(
      "src"
    );

    return;
  }


  element.onerror = () => {

    element.style.display =
      "none";

  };


  element.onload = () => {

    element.style.display =
      "block";

  };


  element.src = url;

}


// =====================================================
// STATUS
// =====================================================

function showStatus(
  element,
  message,
  error = false
) {

  if (!element) {
    return;
  }


  element.innerText =
    message;


  element.className =
    `status ${
      error
        ? "error"
        : "success"
    }`;

}


// =====================================================
// PREÇO
// =====================================================

function formatPrice(value) {

  return Number(
    value || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


// =====================================================
// SEGURANÇA HTML
// =====================================================

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


// =====================================================
// ERROS DO FIREBASE AUTH
// =====================================================

function getAuthError(error) {

  switch (error.code) {

    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";

    case "auth/invalid-email":
      return "E-mail inválido.";

    case "auth/user-disabled":
      return "Este usuário foi desativado.";

    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos.";

    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";

    case "auth/user-not-found":
      return "Usuário não encontrado.";

    case "auth/wrong-password":
      return "Senha incorreta.";

    default:
      return "Não foi possível entrar. Verifique seus dados.";

  }

}


// =====================================================
// ERROS DO FIRESTORE
// =====================================================

function getFirestoreError(error) {

  console.error(
    "Firestore:",
    error
  );


  if (
    error?.code ===
    "permission-denied"
  ) {

    return "O Firebase bloqueou esta operação. Verifique as regras do Firestore.";

  }


  if (
    error?.code ===
    "unauthenticated"
  ) {

    return "Sua sessão expirou. Entre novamente.";

  }


  return "Não foi possível concluir a operação.";

}
```
