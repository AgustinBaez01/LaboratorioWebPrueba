const productList = document.getElementById('product-list');
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// Obtener productos de la API y renderizarlos
async function fetchProducts() {
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        products = await res.json();
        console.log(products); // Verifica si los productos se cargan correctamente
        renderProducts(products); // Renderiza productos después de cargarlos
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

fetchProducts();

// Función para renderizar productos
function renderProducts(productsToRender) {
    productList.innerHTML = '';
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('col-md-4', 'mb-4');
        productCard.innerHTML = `
            <div class="card" style="height: 100%; margin: 5px; padding: 10px;">
                <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 250px; object-fit: contain;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">$${product.price}</p>
                    <div class="mt-auto d-flex flex-column align-items-center">
                        <button class="btn btn-primary mb-2" data-id="${product.id}" style="width: 80%;">Ver detalles</button>
                        <button class="btn btn-success" data-id="${product.id}" style="width: 100%;">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        `;
        productList.appendChild(productCard);

        // Agregar evento al hacer clic en la tarjeta
        productCard.addEventListener('click', () => {
            showProductDetails(product);
        });

        // Mantener el evento de clic para el botón "Ver detalles"
        productCard.querySelector('.btn-primary').addEventListener('click', (event) => {
            event.stopPropagation(); // Evitar que se dispare el evento de la tarjeta
            showProductDetails(product);
        });

        productCard.querySelector('.btn-success').addEventListener('click', (event) => {
            event.stopPropagation(); // Evitar que se dispare el evento de la tarjeta
            addToCart(product);
            Swal.fire('Producto agregado al carrito', '', 'success');
        });
    });
}

// Función para mostrar detalles del producto en un modal
function showProductDetails(product) {
    const modalBody = document.getElementById('product-modal').querySelector('.modal-body');
    modalBody.innerHTML = ''; // Limpiar el contenido anterior

    const productImage = document.createElement('img');
    productImage.src = product.image;
    productImage.alt = product.title;
    productImage.style.width = '100%';
    productImage.style.objectFit = 'contain';

    const productTitle = document.createElement('h5');
    productTitle.textContent = product.title;

    const productDescription = document.createElement('p');
    productDescription.textContent = product.description;

    const productPrice = document.createElement('p');
    productPrice.textContent = `$${product.price}`; // Corregido

    modalBody.append(productImage, productTitle, productDescription, productPrice);

    const addToCartBtn = document.getElementById('add-to-cart');
    addToCartBtn.onclick = () => {
        addToCart(product);
        Swal.fire('Producto agregado al carrito', '', 'success');
        closeModal();
    };

    const modal = new bootstrap.Modal(document.getElementById('product-modal'));
    modal.show();
}

// Función para agregar productos al carrito
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// Actualizar el contador de productos en el carrito
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = `${totalQuantity}`; // Corregido
}

// Inicializar el contador cuando se carga la página
updateCartCount();

// Funciones del carrito
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsList = document.getElementById('cart-items');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');

// Abrir y cerrar el sidebar del carrito
cartBtn.addEventListener('click', () => {
    cartSidebar.classList.toggle('active');
    renderCartItems();
});

// Renderizar productos en el carrito
function renderCartItems() {
    cartItemsList.innerHTML = '';
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <span>${item.title} - $${item.price} x ${item.quantity}</span>
            <button class="btn btn-secondary btn-sm" onclick="updateQuantity(${index}, -1)">-</button>
            <button class="btn btn-secondary btn-sm" onclick="updateQuantity(${index}, 1)">+</button>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Eliminar</button>
        `;
        cartItemsList.appendChild(li);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalLi = document.createElement('li');
    totalLi.classList.add('list-group-item', 'active');
    totalLi.textContent = `Total: $${total.toFixed(2)}`; // Corregido
    cartItemsList.appendChild(totalLi);
}

// Actualizar la cantidad de un producto en el carrito
function updateQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;
    if (item.quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// Eliminar un producto del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// Vaciar el carrito
clearCartBtn.addEventListener('click', () => {
    cart = [];
    localStorage.removeItem('cart');
    updateCartCount();
    renderCartItems();
    Swal.fire('Carrito vaciado', '', 'info');
});

// Finalizar la compra
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        Swal.fire('El carrito está vacío', '', 'warning');
    } else {
        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
        renderCartItems();
        Swal.fire('Compra finalizada con éxito', '', 'success');
    }
});

// Función para buscar productos
function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// Evento para buscar al presionar el botón
document.getElementById('search-button').addEventListener('click', searchProducts);

// Evento para buscar al cambiar el valor del input
document.getElementById('search-input').addEventListener('input', searchProducts);

// Evento para buscar al presionar Enter
document.getElementById('search-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchProducts();
    }
});

// Evento para filtrar por categoría
const categoryLinks = document.querySelectorAll('.category');
categoryLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const category = event.target.getAttribute('data-category');
        const filteredByCategory = products.filter(product => product.category === category);
        renderProducts(filteredByCategory);
    });
});

// Funcionalidad para el botón de búsqueda
document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    console.log('Buscar:', query); // Aquí puedes reemplazar con la lógica deseada
});

// Funcionalidad para el botón de perfil
document.getElementById('profile-button').addEventListener('click', function() {
    console.log('Ir al perfil');
});

// Mostrar menú de perfil
document.getElementById('profile-btn').addEventListener('click', function() {
    const menu = document.getElementById('profile-menu');
    menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
});

// Opcional: cerrar el menú si se hace clic fuera de él
window.addEventListener('click', function(event) {
    const menu = document.getElementById('profile-menu');
    if (!menu.contains(event.target) && event.target.id !== 'profile-button') {
        menu.style.display = 'none';
    }
});