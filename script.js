const FALLBACK_IMG = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80";
const DELIVERY_FEE = 25;
const STORAGE_KEY = "pizza_master_cart_v1";

const SIZE_LABELS = {
    small: "صغير",
    medium: "وسط",
    large: "كبير"
};

const pizzas = [
    {
        id: 1,
        name: "بيتزا مارجريتا الكلاسيكية",
        category: "veg",
        prices: { small: 95, medium: 125, large: 160 },
        desc: "صلصة طماطم إيطالية، جبنة موزاريلا طازجة، وأوراق الريحان.",
        img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        name: "بيتزا بيبروني سوبريم",
        category: "meat",
        prices: { small: 130, medium: 170, large: 215 },
        desc: "شرائح بيبروني مدخنة مع طبقة وفيرة من الموزاريلا الذائبة.",
        img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        name: "بيتزا دجاج باربكيو",
        category: "meat",
        prices: { small: 135, medium: 175, large: 220 },
        desc: "قطع دجاج مشوية، بصل أحمر، فلفل ألوان، وصوص باربكيو مدخن.",
        img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4,
        name: "بيتزا مشروم وخضروات",
        category: "veg",
        prices: { small: 110, medium: 145, large: 185 },
        desc: "مشروم طازج، زيتون أسود، فلفل رومي، وطماطم كرزية.",
        img: "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 5,
        name: "بيتزا هالبينو الحارة",
        category: "spicy",
        prices: { small: 125, medium: 165, large: 210 },
        desc: "لحم مفروم متبل، شرائح هالبينو حارة، وصوص حار مميز.",
        img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 6,
        name: "بيتزا عشاق الجبن",
        category: "veg",
        prices: { small: 120, medium: 155, large: 195 },
        desc: "مزيج غني من الموزاريلا، الشيدر، والبارميزان.",
        img: "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=800&q=80"
    }
];

const navbar = document.getElementById("navbar");
const menuGrid = document.getElementById("menu-grid");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");
const navLinks = document.getElementById("nav-links");
const menuToggle = document.getElementById("menu-toggle");

const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const openCartBtn = document.getElementById("open-cart-btn");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const deliveryFeeEl = document.getElementById("delivery-fee");
const cartTotal = document.getElementById("cart-total");

const openCheckoutBtn = document.getElementById("open-checkout-btn");
const checkoutModal = document.getElementById("checkout-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const checkoutForm = document.getElementById("checkout-form");
const modalTotalAmount = document.getElementById("modal-total-amount");
const toast = document.getElementById("toast");

let activeCategory = "all";
let searchQuery = "";
let selectedSizes = {};
pizzas.forEach((p) => { selectedSizes[p.id] = "medium"; });
let cart = loadCart();

function loadCart() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
        // تجاهل خطأ التخزين
    }
}

function applyImageFallbacks() {
    document.querySelectorAll("img").forEach((img) => {
        img.addEventListener("error", () => {
            if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
        });
    });
}

function getFilteredPizzas() {
    return pizzas.filter((pizza) => {
        const matchesCategory = activeCategory === "all" || pizza.category === activeCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q || pizza.name.toLowerCase().includes(q) || pizza.desc.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });
}

function renderMenu() {
    const list = getFilteredPizzas();
    if (list.length === 0) {
        menuGrid.innerHTML = `<div class="empty-menu">لا توجد أصناف مطابقة لبحثك حالياً.</div>`;
        return;
    }

    menuGrid.innerHTML = list.map((pizza, index) => {
        const currentSize = selectedSizes[pizza.id] || "medium";
        const currentPrice = pizza.prices[currentSize];

        return `
            <article class="pizza-card" style="animation-delay: ${index * 0.07}s">
                <div class="card-img-wrap">
                    <img src="${pizza.img}" alt="${pizza.name}">
                </div>
                <div class="card-body">
                    <div>
                        <h3>${pizza.name}</h3>
                        <p>${pizza.desc}</p>
                    </div>
                    <div class="size-selector" role="group" aria-label="اختيار حجم ${pizza.name}">
                        ${["small", "medium", "large"].map((sz) => `
                            <button type="button" class="size-btn ${currentSize === sz ? "active" : ""}" data-pizza-id="${pizza.id}" data-size="${sz}">
                                ${SIZE_LABELS[sz]}
                            </button>
                        `).join("")}
                    </div>
                    <div class="card-footer">
                        <span class="price" id="price-${pizza.id}">${currentPrice} ج.م</span>
                        <button type="button" class="add-to-cart" data-add-id="${pizza.id}">
                            <i class="fas fa-plus"></i> أضف للسلة
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    applyImageFallbacks();
}

menuGrid.addEventListener("click", (e) => {
    const sizeBtn = e.target.closest(".size-btn");
    if (sizeBtn) {
        const pizzaId = Number(sizeBtn.dataset.pizzaId);
        const size = sizeBtn.dataset.size;
        selectedSizes[pizzaId] = size;

        const pizza = pizzas.find((p) => p.id === pizzaId);
        if (!pizza) return;

        const card = sizeBtn.closest(".pizza-card");
        card.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("active"));
        sizeBtn.classList.add("active");

        const priceEl = document.getElementById(`price-${pizzaId}`);
        if (priceEl) {
            priceEl.textContent = `${pizza.prices[size]} ج.م`;
            priceEl.classList.add("updated");
            setTimeout(() => priceEl.classList.remove("updated"), 250);
        }
        return;
    }

    const addBtn = e.target.closest(".add-to-cart");
    if (addBtn) {
        addToCart(Number(addBtn.dataset.addId));
    }
});

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.dataset.filter;
        renderMenu();
    });
});

searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderMenu();
});

function triggerCartBounce() {
    openCartBtn.classList.remove("bump");
    void openCartBtn.offsetWidth;
    openCartBtn.classList.add("bump");
}

function addToCart(pizzaId) {
    const pizza = pizzas.find((p) => p.id === pizzaId);
    if (!pizza) return;

    const size = selectedSizes[pizzaId] || "medium";
    const unitPrice = pizza.prices[size];
    const itemKey = `${pizza.id}-${size}`;

    const existing = cart.find((item) => item.key === itemKey);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            key: itemKey,
            id: pizza.id,
            name: pizza.name,
            size,
            sizeLabel: SIZE_LABELS[size],
            unitPrice,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    triggerCartBounce();
    showToast(`تمت إضافة ${pizza.name} (${SIZE_LABELS[size]}) للسلة`);
}

function changeQuantity(itemKey, delta) {
    const idx = cart.findIndex((item) => item.key === itemKey);
    if (idx === -1) return;

    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
    }

    saveCart();
    updateCartUI();
}

cartItemsContainer.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest(".qty-btn");
    if (!qtyBtn) return;
    changeQuantity(qtyBtn.dataset.key, Number(qtyBtn.dataset.delta));
});

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + delivery;

    cartCount.textContent = String(totalCount);
    cartSubtotal.textContent = `${subtotal} ج.م`;
    deliveryFeeEl.textContent = `${delivery} ج.م`;
    cartTotal.textContent = `${total} ج.م`;
    modalTotalAmount.textContent = `${total} ج.م`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-msg">السلة فارغة حالياً</p>`;
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <small>الحجم: ${item.sizeLabel} — ${item.unitPrice} ج.م</small>
                <span>${item.unitPrice * item.quantity} ج.م</span>
            </div>
            <div class="cart-controls">
                <button type="button" class="qty-btn" data-key="${item.key}" data-delta="-1" aria-label="تقليل الكمية">-</button>
                <span>${item.quantity}</span>
                <button type="button" class="qty-btn" data-key="${item.key}" data-delta="1" aria-label="زيادة الكمية">+</button>
            </div>
        </div>
    `).join("");
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function openCart() {
    cartSidebar.classList.add("active");
    cartOverlay.classList.add("active");
    navLinks.classList.remove("active");
}

function closeCart() {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
}

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", (e) => {
    if (e.target === cartOverlay) closeCart();
});

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("active"));
});

openCheckoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("السلة فارغة! أضيفي بيتزا أولاً.");
        return;
    }
    closeCart();
    checkoutModal.classList.add("active");
});

function closeCheckoutModal() {
    checkoutModal.classList.remove("active");
}

closeModalBtn.addEventListener("click", closeCheckoutModal);
checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) closeCheckoutModal();
});

checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("customer-name").value.trim();
    if (!name) return;

    cart = [];
    saveCart();
    updateCartUI();
    checkoutForm.reset();
    closeCheckoutModal();
    showToast(`شكراً ${name}! تم استلام طلبك وجاري تحضيره 🍕`);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeCart();
        closeCheckoutModal();
        navLinks.classList.remove("active");
    }
});

window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.14 });

    revealEls.forEach((el) => observer.observe(el));
}

renderMenu();
updateCartUI();
applyImageFallbacks();
initScrollReveal();