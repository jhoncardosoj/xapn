```javascript
// =====================================================
// XAPN® — ADMIN.JS
// Painel administrativo
// =====================================================

// =====================================================
// FIREBASE
// =====================================================

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

const ADMIN_UID = "mpBZ0ta8CJcyuQf10gS70BVBGcC2";


// =====================================================
// ELEMENTOS — LOGIN
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

      return;
    }


    // =================================================
    // SEGURANÇA DO ADMIN
    // =================================================

    if (user.uid !== ADMIN_UID) {

      await signOut(auth);

      showStatus(
        loginStatus,
        "Este usuário não possui acesso ao painel.",
        true
      );

      return;
    }


    // =================================================
    // ACESSO AUTORIZADO
    // =================================================

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
// =====================================================
// PRODUTOS
// =====================================================
// =====================================================

const productForm =
  document.getElementById(
    "product-form"
  );

const productId =
  document.getElementById(
    "product-id"
  );

const productTitle =
  document.getElementById(
    "product-title"
  );

const productPrice =
  document.getElementById(
    "product-price"
  );

const productDescription =
  document.getElementById(
    "product-description"
  );

const productImg =
  document.getElementById(
    "product-img"
  );

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

    /*
     * IMPORTANTE:
     *
     * O site público usa:
     *
     * collection(db, "products")
     *
     * Portanto o admin também precisa
     * usar exatamente "products".
     */

    const productsRef =
      collection(
        db,
        "products"
      );


    let snapshot;


    // =================================================
    // PRIMEIRO TENTA ORDENAR POR createdAt
    // =================================================

    try {

      const q =
        query(
          productsRef,
          orderBy(
            "createdAt",
            "desc"
          )
        );

      snapshot =
        await getDocs(q);

    } catch (orderError) {

      /*
       * Caso documentos antigos não tenham
       * createdAt, carrega normalmente.
       */

      console.warn(
        "Não foi possível ordenar por createdAt. Carregando normalmente.",
        orderError
      );

      snapshot =
        await getDocs(
          productsRef
        );

    }


    products =
      snapshot.docs.map(
        item => ({

          id: item.id,

          ...item.data()

        })
      );


    renderProducts();


  } catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );


    productList.innerHTML = `

      <div
        style="
          color:#ffd0d0;
          font-size:.8rem;
          padding:15px 0;
        "
      >
        Erro ao carregar produtos.
      </div>

    `;

  }

}


// =====================================================
// RENDERIZAR PRODUTOS
// =====================================================

function renderProducts() {

  if (!products.length) {

    productList.innerHTML = `

      <div
        style="
          color:rgba(255,255,255,.5);
          font-size:.8rem;
          padding:15px 0;
        "
      >
        Nenhum produto cadastrado.
      </div>

    `;

    return;

  }


  productList.innerHTML =
    products
      .map(
        product => {

          const image =
            product.img ||
            product.image ||
            "";


          return `

            <div class="item">

              ${
                image
                  ?
                `
                  <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(product.title || "Produto")}"
                  >
                `
                  :
                `
                  <div
                    style="
                      width:60px;
                      height:60px;
                      border-radius:8px;
                      background:rgba(255,255,255,.08);
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      font-size:20px;
                    "
                  >
                    👕
                  </div>
                `
              }


              <div class="item-info">

                <div class="item-title">

                  ${escapeHTML(
                    product.title ||
                    "Produto sem nome"
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
                  type="button"
                  class="edit"
                  data-edit-product="${escapeAttribute(product.id)}"
                >
                  Editar
                </button>


                <button
                  type="button"
                  class="delete"
                  data-delete-product="${escapeAttribute(product.id)}"
                >
                  Excluir
                </button>

              </div>

            </div>

          `;

        }
      )
      .join("");

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
      Number(
        productPrice.value
      );


    const description =
      productDescription.value.trim();


    const img =
      productImg.value.trim();


    // =================================================
    // VALIDAÇÃO
    // =================================================

    if (!title) {

      showStatus(
        productStatus,
        "Digite o nome do produto.",
        true
      );

      return;

    }


    if (
      productPrice.value === "" ||
      Number.isNaN(price) ||
      price < 0
    ) {

      showStatus(
        productStatus,
        "Digite um preço válido.",
        true
      );

      return;

    }


    if (!img) {

      showStatus(
        productStatus,
        "Adicione uma imagem do produto.",
        true
      );

      return;

    }


    productSubmit.disabled =
      true;


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


      // =================================================
      // EDITAR
      // =================================================

      if (productId.value) {

        await updateDoc(
          doc(
            db,
            "products",
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


      // =================================================
      // ADICIONAR
      // =================================================

      else {

        await addDoc(
          collection(
            db,
            "products"
          ),
          {

            ...data,

            createdAt:
              serverTimestamp()

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

      productSubmit.disabled =
        false;

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


    // =================================================
    // EDITAR
    // =================================================

    if (editButton) {

      const id =
        editButton.dataset.editProduct;


      const product =
        products.find(
          item =>
            item.id === id
        );


      if (!product)
        return;


      productId.value =
        product.id;


      productTitle.value =
        product.title || "";


      productPrice.value =
        product.price ?? "";


      productDescription.value =
        product.description || "";


      productImg.value =
        product.img ||
        product.image ||
        "";


      showPreview(
        productPreview,
        product.img ||
        product.image ||
        ""
      );


      productSubmit.innerText =
        "Salvar alterações";


      productCancel.classList.remove(
        "hidden"
      );


      document
        .getElementById("product-form")
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    }


    // =================================================
    // EXCLUIR
    // =================================================

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
      item =>
        item.id === id
    );


  if (!product)
    return;


  const confirmed =
    confirm(
      `Excluir "${product.title || "este produto"}"?`
    );


  if (!confirmed)
    return;


  try {

    await deleteDoc(
      doc(
        db,
        "products",
        id
      )
    );


    await loadProducts();


    showStatus(
      productStatus,
      "Produto excluído com sucesso.",
      false
    );


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
// CANCELAR EDIÇÃO
// =====================================================

productCancel.addEventListener(
  "click",
  resetProductForm
);


function resetProductForm() {

  productForm.reset();


  productId.value =
    "";


  productSubmit.innerText =
    "Adicionar produto";


  productCancel.classList.add(
    "hidden"
  );


  productPreview.src =
    "";


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
// =====================================================
// CARROSSEL
// =====================================================
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

    /*
     * IMPORTANTE:
     *
     * O site público usa:
     *
     * collection(db, "carousel")
     *
     * Portanto o admin também usa "carousel".
     */

    const carouselRef =
      collection(
        db,
        "carousel"
      );


    let snapshot;


    // =================================================
    // TENTA ORDENAR POR createdAt
    // =================================================

    try {

      const q =
        query(
          carouselRef,
          orderBy(
            "createdAt",
            "asc"
          )
        );


      snapshot =
        await getDocs(q);


    } catch (orderError) {

      console.warn(
        "Não foi possível ordenar o carrossel por createdAt.",
        orderError
      );


      snapshot =
        await getDocs(
          carouselRef
        );

    }


    slides =
      snapshot.docs.map(
        item => ({

          id: item.id,

          ...item.data()

        })
      );


    renderCarouselAdmin();


  } catch (error) {

    console.error(
      "Erro ao carregar carrossel:",
      error
    );


    carouselList.innerHTML = `

      <div
        style="
          color:#ffd0d0;
          font-size:.8rem;
          padding:15px 0;
        "
      >
        Erro ao carregar slides.
      </div>

    `;

  }

}


// =====================================================
// RENDERIZAR CARROSSEL
// =====================================================

function renderCarouselAdmin() {

  if (!slides.length) {

    carouselList.innerHTML = `

      <div
        style="
          color:rgba(255,255,255,.5);
          font-size:.8rem;
          padding:15px 0;
        "
      >
        Nenhum slide cadastrado.
      </div>

    `;

    return;

  }


  carouselList.innerHTML =
    slides
      .map(
        slide => {

          const image =
            slide.img ||
            slide.image ||
            "";


          return `

            <div class="item">

              ${
                image
                  ?
                `
                  <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(slide.title || "Slide")}"
                  >
                `
                  :
                `
                  <div
                    style="
                      width:60px;
                      height:60px;
                      border-radius:8px;
                      background:rgba(255,255,255,.08);
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      font-size:20px;
                    "
                  >
                    🖼️
                  </div>
                `
              }


              <div class="item-info">

                <div class="item-title">

                  ${escapeHTML(
                    slide.title ||
                    "Slide sem título"
                  )}

                </div>

              </div>


              <div class="item-actions">

                <button
                  type="button"
                  class="edit"
                  data-edit-slide="${escapeAttribute(slide.id)}"
                >
                  Editar
                </button>


                <button
                  type="button"
                  class="delete"
                  data-delete-slide="${escapeAttribute(slide.id)}"
                >
                  Excluir
                </button>

              </div>

            </div>

          `;

        }
      )
      .join("");

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


    if (!title) {

      showStatus(
        carouselStatus,
        "Digite o título do slide.",
        true
      );

      return;

    }


    if (!img) {

      showStatus(
        carouselStatus,
        "Adicione uma imagem para o slide.",
        true
      );

      return;

    }


    carouselSubmit.disabled =
      true;


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


      // =================================================
      // EDITAR
      // =================================================

      if (carouselId.value) {

        await updateDoc(
          doc(
            db,
            "carousel",
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


      // =================================================
      // ADICIONAR
      // =================================================

      else {

        await addDoc(
          collection(
            db,
            "carousel"
          ),
          {

            ...data,

            createdAt:
              serverTimestamp()

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

      carouselSubmit.disabled =
        false;

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

    const editButton =
      event.target.closest(
        "[data-edit-slide]"
      );


    const deleteButton =
      event.target.closest(
        "[data-delete-slide]"
      );


    // =================================================
    // EDITAR
    // =================================================

    if (editButton) {

      const id =
        editButton.dataset.editSlide;


      const slide =
        slides.find(
          item =>
            item.id === id
        );


      if (!slide)
        return;


      carouselId.value =
        slide.id;


      carouselTitle.value =
        slide.title || "";


      carouselImg.value =
        slide.img ||
        slide.image ||
        "";


      showPreview(
        carouselPreview,
        slide.img ||
        slide.image ||
        ""
      );


      carouselSubmit.innerText =
        "Salvar alterações";


      carouselCancel.classList.remove(
        "hidden"
      );


      document
        .getElementById("carousel-form")
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    }


    // =================================================
    // EXCLUIR
    // =================================================

    if (deleteButton) {

      deleteSlide(
        deleteButton.dataset.deleteSlide
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
      item =>
        item.id === id
    );


  if (!slide)
    return;


  const confirmed =
    confirm(
      `Excluir "${slide.title || "este slide"}"?`
    );


  if (!confirmed)
    return;


  try {

    await deleteDoc(
      doc(
        db,
        "carousel",
        id
      )
    );


    await loadCarousel();


    showStatus(
      carouselStatus,
      "Slide excluído com sucesso.",
      false
    );


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
// CANCELAR EDIÇÃO DO CARROSSEL
// =====================================================

carouselCancel.addEventListener(
  "click",
  resetCarouselForm
);


function resetCarouselForm() {

  carouselForm.reset();


  carouselId.value =
    "";


  carouselSubmit.innerText =
    "Adicionar slide";


  carouselCancel.classList.add(
    "hidden"
  );


  carouselPreview.src =
    "";


  carouselPreview.style.display =
    "none";

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
// UTILITÁRIOS
// =====================================================

function showPreview(
  element,
  url
) {

  if (!url) {

    element.src = "";

    element.style.display =
      "none";

    return;

  }


  element.style.display =
    "block";


  element.src =
    url;


  element.onerror =
    () => {

      element.style.display =
        "none";

    };

}


// =====================================================
// STATUS
// =====================================================

function showStatus(
  element,
  message,
  error
) {

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
// PROTEÇÃO CONTRA HTML
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

      return "Muitas tentativas. Aguarde um pouco.";


    case "auth/network-request-failed":

      return "Erro de conexão. Verifique sua internet.";


    default:

      return (
        "Não foi possível entrar. " +
        "Verifique seus dados."
      );

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


  switch (error.code) {

    case "permission-denied":

      return (
        "Permissão negada pelo Firebase. " +
        "Verifique as regras do Firestore."
      );


    case "unavailable":

      return (
        "Firebase temporariamente indisponível."
      );


    case "failed-precondition":

      return (
        "O Firebase informou que uma configuração " +
        "ou índice precisa ser ajustado."
      );


    case "not-found":

      return (
        "O documento não foi encontrado."
      );


    case "network-request-failed":

      return (
        "Erro de conexão com o Firebase."
      );


    default:

      return (
        "Erro ao salvar. " +
        "Abra o console do navegador para mais detalhes."
      );

  }

}
```
