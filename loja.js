import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

let productsData = [];
let carouselData = [];

let cart = [];

let currentSlide = 0;

const productsGrid =
  document.getElementById("products-grid");

const slidesContainer =
  document.getElementById("slides-container");


// =====================================================
// CARREGAR PRODUTOS
// =====================================================

async function loadProducts() {

  try {

    const q = query(
      collection(db, "produtos"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    productsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderProducts();

  } catch (error) {

    console.error("Erro ao carregar produtos:", error);

    // Fallback caso ainda não existam documentos
    const snapshot =
      await getDocs(collection(db, "produtos"));

    productsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderProducts();
  }
}


// =====================================================
// CARREGAR CARROSSEL
// =====================================================

async function loadCarousel() {

  try {

    const q = query(
      collection(db, "carrossel"),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);

    carouselData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderCarousel();

  } catch (error) {

    console.error("Erro ao carregar carrossel:", error);

    const snapshot =
      await getDocs(collection(db, "carrossel"));

    carouselData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderCarousel();
  }
}


// =====================================================
// CARROSSEL
// =====================================================

function renderCarousel() {

  if (!carouselData.length) {

    slidesContainer.innerHTML = `
      <div
        class="slide active"
        style="
          background:
          linear-gradient(
            135deg,
            #678ec2,
            #406494
          );
        "
      >
        <div class="slide-caption">

          <div class="slide-title syne">
            xapn®
          </div>

        </div>
      </div>
    `;

    return;
  }

  slidesContainer.innerHTML =
    carouselData.map((slide, index) => `

      <div
        class="slide ${index === 0 ? "active" : ""}"
        style="
          background-image:
          linear-gradient(
            rgba(30,41,59,.15),
            rgba(30,41,59,.25)
          ),
          url("${escapeAttribute(slide.img)}");
        "
      >

        <div class="slide-caption">

          <div class="slide-title syne">
            ${escapeHTML(slide.title || "xapn®")}
          </div>

        </div>

      </div>

    `).join("");

  currentSlide = 0;
}


function showSlide(index) {

  const slides =
    document.querySelectorAll(".slide");

  if (!slides.length) return;

  slides.forEach((slide, i) => {

    slide.classList.toggle(
      "active",
      i === index
    );

  });
}


window.nextSlide = function () {

  if (!carouselData.length) return;

  currentSlide =
    (currentSlide + 1) %
    carouselData.length;

  showSlide(currentSlide);
};


window.prevSlide = function () {

  if (!carouselData.length) return;

  currentSlide =
    (currentSlide - 1 + carouselData.length) %
    carouselData.length;

  showSlide(currentSlide);
};


setInterval(() => {

  if (carouselData.length > 1) {
    window.nextSlide();
  }

}, 5000);


// =====================================================
// PRODUTOS
// =====================================================

function renderProducts() {

  if (!productsData.length) {

    productsGrid.innerHTML = `
      <div class="loading">
        Nenhum produto cadastrado ainda.
      </div>
    `;

    return;
  }

  productsGrid.innerHTML =
    productsData.map(product => `

      <div class="product-card">

        <div>

          <img
            src="${escapeAttribute(product.img || "")}"
            alt="${escapeAttribute(product.title || "Produto")}"
            class="product-img"
            loading="lazy"
          >

          <div class="product-name">
            ${escapeHTML(product.title || "")}
          </div>

          <div class="product-price">
            ${formatPrice(product.price)}
          </div>

          <div class="product-description">
            ${escapeHTML(product.description || "")}
          </div>

        </div>

        <button
          class="btn"
          onclick="addToCart('${product.id}')"
        >
          Adicionar
        </button>

      </div>

    `).join("");
}


// =====================================================
// CARRINHO
// =====================================================

window.addToCart = function (id) {

  const product =
    productsData.find(item => item.id === id);

  if (!product) return;

  cart.push(product);

  updateCart();

  toggleCart(true);
};


function updateCart() {

  document.getElementById("cart-count")
    .innerText = cart.length;

  const container =
    document.getElementById("cart-items");

  if (!cart.length) {

    container.innerHTML = `
      <p
        style="
          font-size:.8rem;
          color:rgba(255,255,255,.5);
          text-align:center;
        "
      >
        Carrinho vazio.
      </p>
    `;

  } else {

    container.innerHTML =
      cart.map((item, index) => `

        <div class="cart-item">

          <div>

            <div style="font-size:.85rem">
              ${escapeHTML(item.title)}
            </div>

            <div
              style="
                font-size:.75rem;
                color:#dbeafe;
              "
            >
              ${formatPrice(item.price)}
            </div>

          </div>

          <button
            style="
              background:none;
              border:none;
              color:#ff6b6b;
              cursor:pointer;
            "
            onclick="removeFromCart(${index})"
          >
            ✕
          </button>

        </div>

      `).join("");
  }

  const total =
    cart.reduce(
      (total, item) =>
        total + Number(item.price || 0),
      0
    );

  document.getElementById("cart-total")
    .innerText = formatPrice(total);
}


window.removeFromCart = function (index) {

  cart.splice(index, 1);

  updateCart();
};


window.toggleCart = function (forceOpen) {

  const drawer =
    document.getElementById("cart-drawer");

  if (forceOpen !== undefined) {

    drawer.classList.toggle(
      "open",
      forceOpen
    );

  } else {

    drawer.classList.toggle("open");

  }
};


// =====================================================
// WHATSAPP
// =====================================================

window.sendWhatsApp = function () {

  if (!cart.length) {

    alert("Carrinho vazio!");

    return;
  }

  let message =
    "Olá xapn®, gostaria de comprar os seguintes itens:\n\n";

  cart.forEach(item => {

    message +=
      `• ${item.title} - ${formatPrice(item.price)}\n`;

  });

  const total =
    cart.reduce(
      (total, item) =>
        total + Number(item.price || 0),
      0
    );

  message +=
    `\n*Total:* ${formatPrice(total)}`;

  const phone =
    "5582993689706";

  const url =
    `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
};


// =====================================================
// CURSOR
// =====================================================

const dot =
  document.getElementById("dot");

const ring =
  document.getElementById("ring");

let mx = 0;
let my = 0;

let rx = 0;
let ry = 0;


document.addEventListener("mousemove", event => {

  mx = event.clientX;
  my = event.clientY;

  if (dot) {

    dot.style.left =
      mx + "px";

    dot.style.top =
      my + "px";
  }

});


function animateCursor() {

  rx += (mx - rx) * .12;
  ry += (my - ry) * .12;

  if (ring) {

    ring.style.left =
      rx + "px";

    ring.style.top =
      ry + "px";

  }

  requestAnimationFrame(
    animateCursor
  );
}


animateCursor();


// =====================================================
// PARTÍCULAS
// =====================================================

const particles =
  document.getElementById("particles");

if (particles) {

  for (let i = 0; i < 25; i++) {

    const particle =
      document.createElement("div");

    particle.classList.add(
      "particle"
    );

    particle.style.left =
      Math.random() * 100 + "%";

    particle.style.animationDuration =
      (6 + Math.random() * 10) + "s";

    particle.style.animationDelay =
      Math.random() * 8 + "s";

    const size =
      2 + Math.random() * 4;

    particle.style.width =
      size + "px";

    particle.style.height =
      size + "px";

    particles.appendChild(
      particle
    );
  }
}


// =====================================================
// UTILITÁRIOS
// =====================================================

function formatPrice(value) {

  return Number(value || 0)
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
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


// =====================================================
// INICIALIZAÇÃO
// =====================================================

await Promise.all([
  loadProducts(),
  loadCarousel()
]);

updateCart();