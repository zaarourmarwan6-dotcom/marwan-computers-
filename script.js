let products = [];
let cart = [];
let currentCategory = "الكل";

document.addEventListener("DOMContentLoaded", () => {
  fetch('products.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      renderShop();
    })
    .catch(error => console.error("خطأ في تحميل المنتجات:", error));

  if (window.lucide) lucide.createIcons();
});

function navTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  
  const targetPage = document.getElementById(`page-${pageId}`);
  if(targetPage) targetPage.classList.add('active');
  
  const navLink = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
  if(navLink) navLink.classList.add('active');
  
  window.scrollTo(0,0);
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  const scrollTop = document.getElementById('scrollTop');
  if(window.scrollY > 50) {
    nav.classList.add('scrolled');
    scrollTop.classList.add('visible');
  } else {
    nav.classList.remove('scrolled');
    scrollTop.classList.remove('visible');
  }
});

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartSidebar').classList.toggle('open');
}
function toggleMobile() {
  document.getElementById('mobileNav').classList.toggle('open');
}

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  if(!prod || prod.status === 'out') return;
  
  const existing = cart.find(item => item.id === id);
  if(existing) {
    existing.qty++;
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  updateCartUI();
  showToast("تم إضافة المنتج إلى السلة");
}

function updateCartQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  updateCartUI();
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const itemsContainer = document.getElementById('cartItems');
  const totalSum = document.getElementById('cartTotalSum');
  
  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
  if(badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }
  
  if(cart.length === 0) {
    if(itemsContainer) itemsContainer.innerHTML = '<div class="cart-empty">السلة فارغة حالياً</div>';
    if(totalSum) totalSum.textContent = "$0";
    return;
  }
  
  let html = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    html += `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price}</div>
          <div class="cart-item-qty">
            <button onclick="updateCartQty(${item.id}, -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="updateCartQty(${item.id}, 1)">+</button>
          </div>
          <div class="cart-item-remove" onclick="updateCartQty(${item.id}, -${item.qty})">حذف</div>
        </div>
      </div>
    `;
  });
  if(itemsContainer) itemsContainer.innerHTML = html;
  if(totalSum) totalSum.textContent = `$${total}`;
}

function checkoutWhatsApp() {
  if(cart.length === 0) return;
  let msg = "مرحباً Marwan Computers، أود طلب المنتجات التالية:\n\n";
  let total = 0;
  cart.forEach(item => {
    msg += `- ${item.name} (العدد: ${item.qty}) -> $${item.price * item.qty}\n`;
    total += item.price * item.qty;
  });
  msg += `\nالمجموع الكلي: $${total}`;
  window.open(`https://wa.me/96181545079?text=${encodeURIComponent(msg)}`, '_blank');
}

function renderShop() {
  const shopGrid = document.getElementById('shopGrid') || document.querySelector('.products-grid') || document.querySelector('.grid');
  const featuredGrid = document.getElementById('featuredGrid');
  
  if (!products || products.length === 0) return;

  const generateCard = p => `
    <div class="product-card" style="border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; background: #0d1530; margin: 10px; color: white;">
      <div class="product-card-body">
        <div class="product-card-category" style="font-size: 12px; color: #0066ff;">${p.category}</div>
        <h3 class="product-card-name" style="margin: 5px 0; font-size: 18px;">${p.name}</h3>
        <p class="product-card-specs" style="font-size: 13px; opacity: 0.7; color: #ccc;">${p.specs}</p>
        <div class="product-card-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
          <span class="product-price" style="font-weight: bold; font-size: 20px;">$${p.price}</span>
          <button class="cart-btn" onclick="addToCart(${p.id})" style="background: #0066ff; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">
            إضافة للسلة
          </button>
        </div>
      </div>
    </div>
  `;

  if (shopGrid) shopGrid.innerHTML = products.map(generateCard).join('');
  if (featuredGrid) featuredGrid.innerHTML = products.slice(0, 3).map(generateCard).join('');
  
  if (window.lucide) lucide.createIcons();
}

function setCategory(cat) {
  currentCategory = cat;
  renderShop();
}

function openLogin() { document.getElementById('loginModal').classList.add('open'); }
function closeLogin() { document.getElementById('loginModal').classList.remove('open'); document.getElementById('loginErr').style.display='none'; }
function handleLogin() {
  const pass = document.getElementById('loginPass').value;
  if(pass === "marwan2026") { 
    document.getElementById('adminBar').classList.add('visible');
    document.body.style.paddingTop = "44px";
    closeLogin();
    showToast("مرحباً بك يا مدير!");
  } else {
    document.getElementById('loginErr').style.display = 'block';
  }
}
function logout() {
  document.getElementById('adminBar').classList.remove('visible');
  document.body.style.paddingTop = "0";
  navTo('home');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if(toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}
