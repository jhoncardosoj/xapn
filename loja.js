import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const PHONE_NUMBER = '82993689706';

// 1. Carregar Banners
async function loadCarousel() {
  const sliderContainer = document.getElementById('slider-container');
  const dotsContainer = document.getElementById('dots-container');

  try {
    const querySnapshot = await getDocs(collection(db, "carousel"));
    let slidesData = [];
    
    querySnapshot.forEach((doc) => {
      slidesData.push(doc.data());
    });

    if (slidesData.length === 0) {
      slidesData = [
        {
          badge: "Nova coleção",
          title: "Vestida de Graça",
          desc: "Camisetas premium com propósito, minimalismo e identidade. Depois você só substitui as imagens pelas fotos oficiais da XAPN.",
          imgUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80",
          btnText: "Ver coleção"
        },
        {
          badge: "Essentials",
          title: "Minimalismo que permanece",
          desc: "Design limpo, acabamento premium e uma estética pensada para quem veste propósito.",
          imgUrl: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80",
          btnText: "Comprar agora"
        },
        {
          badge: "XAPN 2026",
          title: "Nova temporada",
          desc: "Troque estes banners pelo painel administrativo e atualize tudo sem editar o código.",
          imgUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
          btnText: "Explorar"
        }
      ];
    }

    const existingSlides = sliderContainer.querySelectorAll('.slide');
    existingSlides.forEach(s => s.remove());
    dotsContainer.innerHTML = '';

    slidesData.forEach((slide, index) => {
      const slideDiv = document.createElement('div');
      slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
      slideDiv.style.backgroundImage = `url('${slide.imgUrl}')`;
      slideDiv.innerHTML = `
        <div class='overlay'>
          <div class='badge'>${slide.badge || ''}</div>
          <h1>${slide.title || ''}</h1>
          <p>${slide.desc || ''}</p>
          <a class='cta' href='#produtos'>${slide.btnText || 'Ver coleção'}</a>
        </div>
      `;
      sliderContainer.insertBefore(slideDiv, dotsContainer);

      const dotBtn = document.createElement('button');
      dotBtn.className = `dot ${index === 0 ? 'active' : ''}`;
      dotsContainer.appendChild(dotBtn);
    });

    initSliderLogic();

  } catch (err) {
    console.error("Erro ao carregar o carrossel:", err);
  }
}

// 2. Lógica do Carrossel
function initSliderLogic() {
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.dot')];
  if (slides.length === 0) return;

  let current = 0;

  function show(i) {
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  dots.forEach((d, i) => d.addEventListener('click', () => {
    current = i;
    show(current);
  }));

  setInterval(() => {
    current = (current + 1) % slides.length;
    show(current);
  }, 4500);
}

// 3. Carregar Produtos
async function loadProducts() {
  const grid = document.getElementById('products-grid');

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    let html = '';

    querySnapshot.forEach((doc) => {
      const p = doc.data();
      const msg = encodeURIComponent(`Tenho interesse na ${p.name}`);
      
      html += `
        <div class='card'>
          <img src='${p.imgUrl}' alt='${p.name}'>
          <div class='info'>
            <h3>${p.name}</h3>
            <div class='price'>R$ ${Number(p.price).toFixed(2).replace('.', ',')}</div>
            <a class='buy' href='https://api.whatsapp.com/send/?phone=${PHONE_NUMBER}&text=${msg}' target='_blank'>Comprar</a>
          </div>
        </div>
      `;
    });

    if (html !== '') {
      grid.innerHTML = html;
    } else {
      grid.innerHTML = `
        <div class='card'><img src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80'><div class='info'><h3>Oversized Grace</h3><div class='price'>R$ 89,90</div><a class='buy' href='https://api.whatsapp.com/send/?phone=${PHONE_NUMBER}&text=Tenho%20interesse%20na%20Oversized%20Grace' target='_blank'>Comprar</a></div></div>
        <div class='card'><img src='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'><div class='info'><h3>Essential Blue</h3><div class='price'>R$ 94,90</div><a class='buy' href='https://api.whatsapp.com/send/?phone=${PHONE_NUMBER}&text=Tenho%20interesse%20na%20Essential%20Blue' target='_blank'>Comprar</a></div></div>
        <div class='card'><img src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80'><div class='info'><h3>Faith Collection</h3><div class='price'>R$ 99,90</div><a class='buy' href='https://api.whatsapp.com/send/?phone=${PHONE_NUMBER}&text=Tenho%20interesse%20na%20Faith%20Collection' target='_blank'>Comprar</a></div></div>
        <div class='card'><img src='https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'><div class='info'><h3>Purpose Tee</h3><div class='price'>R$ 92,90</div><a class='buy' href='https://api.whatsapp.com/send/?phone=${PHONE_NUMBER}&text=Tenho%20interesse%20na%20Purpose%20Tee' target='_blank'>Comprar</a></div></div>
      `;
    }
  } catch (err) {
    console.error("Erro ao carregar os produtos:", err);
  }
}

// 4. Carregar Imagem da Seção Sobre
async function loadAboutImage() {
  const aboutImgDiv = document.getElementById('about-image');
  if (!aboutImgDiv) return;

  try {
    const docRef = doc(db, "settings", "about");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().imgUrl) {
      aboutImgDiv.style.backgroundImage = `url('${docSnap.data().imgUrl}')`;
    }
  } catch (err) {
    console.error("Erro ao carregar imagem da seção Sobre:", err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCarousel();
  loadProducts();
  loadAboutImage();
});