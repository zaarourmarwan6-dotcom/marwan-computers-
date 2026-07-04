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
  // البحث عن الحاويات بالأسماء المتوقعة في ملف HTML الخاص بك
  const shopGrid = document.getElementById('shopGrid') || document.querySelector('.products-grid') || document.querySelector('.grid');
  const featuredGrid = document.getElementById('featuredGrid');
  const searchQuery = document.getElementById('shopSearch') ? document.getElementById('shopSearch').value.toLowerCase() : '';
  
  if (!products || products.length === 0) return;

  const generateCard = p => `
    <div class="product-card" style="border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; background: var(--bg-card, #0d1530); margin: 10px;">
      <div class="product-card-body">
        <div class="product-card-category" style="font-size: 12px; color: var(--primary, #0066ff);">${p.category}</div>
        <h3 class="product-card-name" style="margin: 5px 0; font-size: 18px; color: #fff;">${p.name}</h3>
        <p class="product-card-specs" style="font-size: 13px; opacity: 0.7; color: #ccc;">${p.specs}</p>
        <div class="product-card-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
          <span class="product-price" style="font-weight: bold; color: #fff; font-size: 20px;">$${p.price}</span>
          <button class="cart-btn" onclick="addToCart(${p.id})" style="background: var(--primary, #0066ff); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">
            إضافة للسلة
          </button>
        </div>
      </div>
    </div>
  `;

  // عرض المنتجات في الحاوية الرئيسية المتاحة للمتجر
  if (shopGrid) {
    shopGrid.innerHTML = products.map(generateCard).join('');
  }

  // عرض المنتجات في واجهة الصفحة الرئيسية أيضاً لضمان ظهورها فوراً
  if (featuredGrid) {
    featuredGrid.innerHTML = products.slice(0, 3).map(generateCard).join('');
  } else if (!shopGrid && document.querySelector('main')) {
    // إذا لم يجد الحاويات المخصصة، سيقوم بإنشاء قسم خاص بالمنتجات داخل الواجهة فوراً
    let fallbackGrid = document.getElementById('fallback-products');
    if (!fallbackGrid) {
      fallbackGrid = document.createElement('div');
      fallbackGrid.id = 'fallback-products';
      fallbackGrid.style.display = 'grid';
      fallbackGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
      fallbackGrid.style.gap = '20px';
      fallbackGrid.style.padding = '40px 20px';
      fallbackGrid.style.maxWidth = '1200px';
      fallbackGrid.style.margin = '0 auto';
      document.querySelector('main').appendChild(fallbackGrid);
    }
    fallbackGrid.innerHTML = products.map(generateCard).join('');
  }
  
  if (window.lucide) lucide.createIcons();
}
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
