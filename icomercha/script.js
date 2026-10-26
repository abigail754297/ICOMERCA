// Base de datos por defecto de productos
const defaultProducts = [
    {
        id: "1",
        title: "Vestido Casual Elegante de Verano para Mujer",
        price: 15.99,
        discount: 40,
        category: "ropa",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500",
        sold: "18.4 mil+ vendidos",
        description: "Vestido confeccionado con telas suaves y transpirables ideales para clima cálido. Diseño moderno y versátil."
    },
    {
        id: "2",
        title: "Set de Maquillaje y Paleta de Sombras Profesional",
        price: 12.50,
        discount: 50,
        category: "belleza",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
        sold: "25.1 mil+ vendidos",
        description: "Paleta con 32 colores altamente pigmentados, e incluye pinceles para un acabado perfecto de larga duración."
    },
    {
        id: "3",
        title: "Reloj Inteligente Deportivo con Pulsómetro y Bluetooth",
        price: 14.49,
        discount: 60,
        category: "electronica",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        sold: "12.8 mil+ vendidos",
        description: "Monitor de actividad física completa, resistente al agua y notificación de llamadas y mensajes al instante."
    }
];

// Estado global persistente con localStorage
let products = JSON.parse(localStorage.getItem('merkaya_products_v5')) || defaultProducts;
let cart = JSON.parse(localStorage.getItem('merkaya_cart_v5')) || [];
let currentUser = JSON.parse(localStorage.getItem('merkaya_user')) || null;
let activeCategory = 'todas';
let isLoginMode = false;

// Guardar en localStorage
function saveStorage() {
    localStorage.setItem('merkaya_products_v5', JSON.stringify(products));
    localStorage.setItem('merkaya_cart_v5', JSON.stringify(cart));
    localStorage.setItem('merkaya_user', JSON.stringify(currentUser));
}

// Renderizar la cuadrícula de productos en la página principal
function renderGrid() {
    const grid = document.getElementById('productsGrid');
    const searchVal = document.getElementById('searchInput').value.toLowerCase();

    const filtered = products.filter(p => {
        const matchesCategory = activeCategory === 'todas' || p.category === activeCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchVal);
        return matchesCategory && matchesSearch;
    });

    document.getElementById('productCounter').textContent = `${filtered.length} artículos encontrados`;
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: #888;">No se encontraron productos.</p>';
        return;
    }

    filtered.forEach(p => {
        const originalPrice = (p.price / (1 - (p.discount || 0) / 100)).toFixed(2);

        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Clic en la tarjeta abre el detalle del producto
        card.onclick = (e) => {
            if (!e.target.closest('.btn-add-cart') && !e.target.closest('.delete-btn')) {
                openDetailModal(p.id);
            }
        };

        card.innerHTML = `
            ${p.discount ? `<span class="discount-tag">-${p.discount}%</span>` : ''}
            <button class="delete-btn" onclick="deleteProduct('${p.id}')" title="Eliminar de tienda">&times;</button>
            <img src="${p.image}" alt="${p.title}" class="product-img" onerror="this.src='https://via.placeholder.com/300?text=Merkaya'">
            <div class="product-info">
                <div>
                    <p class="product-title">${p.title}</p>
                    <div class="price-row">
                        <span class="current-price">$${p.price.toFixed(2)}</span>
                        ${p.discount ? `<span class="old-price">$${originalPrice}</span>` : ''}
                    </div>
                    <span class="free-shipping"><i class="fa-solid fa-truck-fast"></i> Envío gratis</span>
                </div>
                <div>
                    <div class="sold-count">${p.sold}</div>
                    <button class="btn-add-cart" onclick="addToCart('${p.id}')">
                        <i class="fa-solid fa-cart-plus"></i> Añadir al carrito
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Abrir la vista completa/pantalla detallada del producto
function openDetailModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const originalPrice = (product.price / (1 - (product.discount || 0) / 100)).toFixed(2);
    const content = document.getElementById('detailModalContent');

    content.innerHTML = `
        <button class="close-btn" onclick="toggleModal('detailModal', false)" style="position: absolute; top: 15px; right: 15px;">&times;</button>
        <img src="${product.image}" alt="${product.title}" class="detail-img">
        <div class="detail-info">
            <div>
                <span class="detail-category">${product.category}</span>
                <h2 class="detail-title">${product.title}</h2>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">${product.description || 'Producto garantizado de alta calidad en Merkaya.'}</p>
                
                <div class="detail-price-box">
                    <span style="font-size: 12px; color: var(--text-muted);">Precio de Oferta:</span>
                    <div class="detail-price">$${product.price.toFixed(2)}</div>
                    ${product.discount ? `<span style="text-decoration: line-through; font-size: 13px; color: #888;">Antes: $${originalPrice} (-${product.discount}%)</span>` : ''}
                </div>

                <span class="free-shipping"><i class="fa-solid fa-truck-fast"></i> Envío Gratis a todo el país</span>
                <div class="sold-count" style="margin-top: 6px;">🔥 ${product.sold}</div>
            </div>

            <div class="detail-actions">
                <button class="btn-submit" onclick="addToCart('${product.id}'); toggleModal('detailModal', false);">
                    <i class="fa-solid fa-cart-plus"></i> Añadir al Carrito
                </button>
            </div>
        </div>
    `;

    toggleModal('detailModal', true);
}

// Sistema de Usuario / Autenticación
function updateAuthUI() {
    const label = document.getElementById('userNameLabel');
    if (currentUser) {
        label.textContent = `¡Hola, ${currentUser.name}!`;
    } else {
        label.textContent = 'Ingresar / Registrarse';
    }
}

document.getElementById('authBtn').onclick = () => {
    if (currentUser) {
        if (confirm(`¿Deseas cerrar sesión, ${currentUser.name}?`)) {
            currentUser = null;
            saveStorage();
            updateAuthUI();
            showToast('Sesión cerrada');
        }
    } else {
        toggleModal('authModal', true);
    }
};

document.getElementById('toggleAuthMode').onclick = (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').innerHTML = isLoginMode ? 
        '<i class="fa-solid fa-right-to-bracket" style="color: var(--primary);"></i> Iniciar Sesión' : 
        '<i class="fa-solid fa-user-plus" style="color: var(--primary);"></i> Crear Cuenta';
    document.getElementById('nameGroup').classList.toggle('hidden', isLoginMode);
    document.getElementById('authSubmitBtn').textContent = isLoginMode ? 'Entrar' : 'Crear Cuenta';
    document.getElementById('authToggleText').textContent = isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?';
    document.getElementById('toggleAuthMode').textContent = isLoginMode ? 'Registrarse' : 'Iniciar Sesión';
};

document.getElementById('authForm').onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const name = document.getElementById('regName').value || email.split('@')[0];

    currentUser = { name, email };
    saveStorage();
    updateAuthUI();
    toggleModal('authModal', false);
    showToast(`Bienvenido a Merkaya, ${name}`);
};

// Subir Producto a la tienda
document.getElementById('uploadForm').onsubmit = (e) => {
    e.preventDefault();
    const newProduct = {
        id: Date.now().toString(),
        title: document.getElementById('title').value,
        price: parseFloat(document.getElementById('price').value),
        discount: parseInt(document.getElementById('discount').value) || 0,
        category: document.getElementById('category').value,
        image: document.getElementById('image').value,
        sold: document.getElementById('sold').value || '10+ vendidos'
    };

    products.unshift(newProduct);
    saveStorage();
    renderGrid();
    toggleModal('uploadModal', false);
    showToast('¡Producto publicado en Merkaya!');
};

function deleteProduct(id) {
    if (confirm('¿Eliminar este producto de Merkaya?')) {
        products = products.filter(p => p.id !== id);
        saveStorage();
        renderGrid();
        showToast('Producto eliminado');
    }
}

// Funciones del Carrito de Compras
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const item = cart.find(c => c.id === id);

    if (item) item.qty += 1;
    else cart.push({ ...product, qty: 1 });

    saveStorage();
    updateCartUI();
    showToast('Añadido al carrito');
}

function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');

    badge.textContent = cart.reduce((acc, i) => acc + i.qty, 0);
    container.innerHTML = '';
    let total = 0;

    cart.forEach(i => {
        total += i.price * i.qty;
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${i.image}">
            <div class="cart-item-info">
                <div class="cart-item-title">${i.title}</div>
                <div class="cart-item-price">$${i.price.toFixed(2)} x ${i.qty}</div>
            </div>
        `;
        container.appendChild(el);
    });

    totalEl.textContent = `$${total.toFixed(2)}`;
}

// Notificaciones flotantes (Toasts)
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.getElementById('toastContainer').appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Helper para abrir/cerrar modales
function toggleModal(id, show) {
    document.getElementById(id).classList.toggle('active', show);
}

// Event Listeners de Modales y Búsqueda
document.getElementById('openUploadModal').onclick = () => toggleModal('uploadModal', true);
document.getElementById('closeUploadModal').onclick = () => toggleModal('uploadModal', false);
document.getElementById('openCartDrawer').onclick = () => toggleModal('cartDrawer', true);
document.getElementById('closeCartDrawer').onclick = () => toggleModal('cartDrawer', false);
document.getElementById('closeAuthModal').onclick = () => toggleModal('authModal', false);
document.getElementById('searchInput').oninput = renderGrid;

document.getElementById('categoryTabs').onclick = (e) => {
    const target = e.target.closest('.cat-btn');
    if (target) {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        activeCategory = target.dataset.category;
        renderGrid();
    };
}