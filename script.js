let products = [];
let cart = [];
let currentCategory = "الكل";

document.addEventListener("DOMContentLoaded", () => {
  // جلب المنتجات من ملف JSON
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
  badge.textContent = totalCount;
  badge.style.display = totalCount > 0 ? 'flex' : 'none';
  
  if(cart.length === 0) {
    itemsContainer.innerHTML = '<div class="cart-empty">السلة فارغة حالياً</div>';
    totalSum.textContent = "$0";
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
  itemsContainer.innerHTML = html;
  totalSum.textContent = `$${total}`;
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
  const shopGrid = document.getElementById('shopGrid');
  const featuredGrid = document.getElementById('featuredGrid');
  const searchQuery = document.getElementById('shopSearch') ? document.getElementById('shopSearch').value.toLowerCase() : '';
  
  const categories = ["الكل", ...new Set(products.map(p => p.category))];
  const filtersContainer = document.getElementById('shopFilters');
  if(filtersContainer) {
    filtersContainer.innerHTML = categories.map(cat => 
      `<button class="filter-tab ${currentCategory === cat ? 'active' : ''}" onclick="setCategory('${cat}')">${cat}</button>`
    ).join('');
  }

  let filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.specs.toLowerCase().includes(searchQuery);
    const matchesCat = currentCategory === "الكل" || p.category === currentCategory;
    return matchesSearch && matchesCat;
  });

  const generateCard = p => `
    <div class="product-card">
      <div class="product-card-image">
        <i data-lucide="monitor" width="48" height="48" style="opacity:0.2;"></i>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${p.category}</div>
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-specs">${p.specs}</div>
        <div class="availability ${p.status === 'in' ? 'in-stock' : 'out-stock'}">
          <span class="availability-dot"></span> ${p.status === 'in' ? 'متوفر' : 'نفذت الكمية'}
        </div>
        <div class="product-card-footer">
          <div class="product-price">$${p.price}</div>
          <div class="product-actions">
            <button class="cart-btn" onclick="addToCart(${p.id})" ${p.status === 'out' ? 'disabled style="opacity:0.5;"' : ''}><i data-lucide="shopping-cart" width="14" height="14"></i></button>
          </div>
        </div>
      </div>
    </div>
  `;

  if(shopGrid) {
    shopGrid.innerHTML = filtered.map(generateCard).join('');
    document.getElementById('shopEmpty').style.display = filtered.length === 0 ? 'block' : 'none';
  }

  if(featuredGrid) {
    featuredGrid.innerHTML = products.slice(0, 3).map(generateCard).join('');
    document.getElementById('homeEmpty').style.display = products.length === 0 ? 'block' : 'none';
  }
  
  if(window.lucide) lucide.createIcons();
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
function showAdminPanel() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-admin').classList.add('active');
  renderAdminTable();
}

function renderAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  const q = document.getElementById('adminSearch').value.toLowerCase();
  let filtered = products.filter(p => p.name.toLowerCase().includes(q));

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <div class="product-cell">
          <div class="cell-info"><h4>${p.name}</h4><span>${p.specs}</span></div>
        </div>
      </td>
      <td>${p.category}</td>
      <td>$${p.price}</td>
      <td><span class="status-badge ${p.status === 'in' ? 's-in' : 's-out'}">${p.status === 'in' ? 'متوفر' : 'نفد'}</span></td>
      <td class="actions-cell">
        <button class="btn-icon" onclick="editProduct(${p.id})"><i data-lucide="edit" width="14" height="14"></i></button>
        <button class="btn-icon" style="color:var(--error);" onclick="deleteProduct(${p.id})"><i data-lucide="trash-2" width="14" height="14"></i></button>
      </td>
    </tr>
  `).join('');
  if(window.lucide) lucide.createIcons();
}

function openProductModal() {
  document.getElementById('productForm').reset();
  document.getElementById('pId').value = '';
  document.getElementById('modalTitle').textContent = "إضافة منتج جديد";
  document.getElementById('productModal').classList.add('open');
}
function closeProductModal(e) {
  if(!e || e.target.classList.contains('modal-overlay')) {
    document.getElementById('productModal').classList.remove('open');
  }
}

function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('pId').value;
  const name = document.getElementById('pName').value;
  const category = document.getElementById('pCategory').value;
  const price = parseFloat(document.getElementById('pPrice').value);
  const specs = document.getElementById('pSpecs').value;
  const status = document.getElementById('pStatus').value;
  
  if(id) {
    const index = products.findIndex(p => p.id == id);
    if(index !== -1) products[index] = { id: parseInt(id), name, category, price, specs, status };
  } else {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, name, category, price, specs, status });
  }
  
  closeProductModal(null);
  renderShop();
  renderAdminTable();
  showToast("تم الحفظ! انسخ المنتجات لملف products.json لتحديثها للزبائن.");
}

function editProduct(id) {
  const p = products.find(prod => prod.id === id);
  if(!p) return;
  document.getElementById('pId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pSpecs').value = p.specs;
  document.getElementById('pStatus').value = p.status;
  document.getElementById('modalTitle').textContent = "تعديل المنتج";
  document.getElementById('productModal').classList.add('open');
}

function deleteProduct(id) {
  if(confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
    products = products.filter(p => p.id !== id);
    renderShop();
    renderAdminTable();
    showToast("تم حذف المنتج");
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function handleContact(e) {
  e.preventDefault();
  showToast("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
  document.getElementById('cForm').reset();
}
