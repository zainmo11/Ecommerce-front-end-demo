// Global products variable
let products = [];

// Fetch and display products on page load
document.addEventListener('DOMContentLoaded', function() {
	if (document.body.classList.contains('cart-page')) {
		displayCartItems();
		const clearCartButton = document.getElementById('clearCartButton');
		if (clearCartButton) {
			clearCartButton.addEventListener('click', clearCart);
		} else {
			console.error('Clear cart button not found');
		}
	} else {
		fetchProducts();

		// Event listeners for filter buttons
		const filterButton = document.getElementById('filterButton');
		const clearFilterButton = document.getElementById('clearFilterButton');

		if (filterButton) {
			filterButton.addEventListener('click', applyFilters);
		} else {
			console.error('Filter button not found');
		}

		if (clearFilterButton) {
			clearFilterButton.addEventListener('click', clearFilters);
		} else {
			console.error('Clear filter button not found');
		}

		// Add event listener for the "Add to cart" button on the product detail page
		const productId = getQueryParam('product');
		if (productId) {
			const addToCartButton = document.getElementById('addToCartButton');
			if (addToCartButton) {
				addToCartButton.addEventListener('click', () => {
					const quantity = parseInt(document.getElementById('inputQuantity').value, 10) || 1;
					addToCart(productId, quantity);
				});
			} else {
				console.error('Add to cart button not found');
			}
		}
	}
});

// Fetch products from API
async function fetchProducts() {
	try {
		const response = await fetch('https://fakestoreapi.com/products');
		products = await response.json();
		displayProducts(products);
	} catch (error) {
		console.error('Error fetching products:', error);
	}
}

// Display products on the page
function displayProducts(productsToDisplay) {
	const productList = document.getElementById('product-list');
	if (productList) {
		productList.innerHTML = ''; // Clear previous products

		productsToDisplay.forEach(product => {
			const productCard = document.createElement('div');
			productCard.className = 'card';
			productCard.innerHTML = `
                <a href="product.html?product=${product.id}">
                    <img src="${product.image}" alt="${product.title}" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">$${product.price}</p>
                    </div>
                </a>
            `;
			productList.appendChild(productCard);
		});
	} else {
		console.error('Product list container not found');
	}
}

// Apply filters to the product list
function applyFilters() {
	const searchTerm = document.getElementById('searchInput').value.toLowerCase();
	const minPrice = parseFloat(document.getElementById('minPriceInput').value) || 0;
	const maxPrice = parseFloat(document.getElementById('maxPriceInput').value) || Infinity;
	const selectedCategory = document.getElementById('categoryInput').value;

	const filteredProducts = products.filter(product => {
		const titleMatch = product.title.toLowerCase().includes(searchTerm);
		const priceMatch = product.price >= minPrice && product.price <= maxPrice;
		const categoryMatch = selectedCategory ? product.category === selectedCategory : true;
		return titleMatch && priceMatch && categoryMatch;
	});

	displayProducts(filteredProducts);
}

// Clear all filters and display all products
function clearFilters() {
	document.getElementById('searchInput').value = '';
	document.getElementById('minPriceInput').value = '';
	document.getElementById('maxPriceInput').value = '';
	document.getElementById('categoryInput').value = '';
	displayProducts(products);
}

// Get URL parameters
function getQueryParam(param) {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(param);
}

// Fetch and display product details on the product detail page
document.addEventListener('DOMContentLoaded', () => {
	const productId = getQueryParam('product');

	if (productId) {
		fetch(`https://fakestoreapi.com/products/${productId}`)
			.then(response => response.json())
			.then(data => {
				const productImage = document.getElementById('productImage');
				const productTitle = document.getElementById('productTitle');
				const productPrice = document.getElementById('productPrice');
				const productOldPrice = document.getElementById('productOldPrice');
				const productDescription = document.getElementById('productDescription');
				const productSKU = document.getElementById('productSKU');

				if (productImage && productTitle && productPrice && productOldPrice && productDescription && productSKU) {
					productImage.src = data.image;
					productTitle.textContent = data.title;
					productPrice.textContent = `$${data.price}`;
					productOldPrice.textContent = `$${(data.price + 10).toFixed(2)}`; // Example old price
					productDescription.textContent = data.description;
					productSKU.textContent = `SKU: ${data.id}`; // Adjust as needed
				} else {
					console.error('Product details elements not found');
				}
			})
			.catch(error => console.error('Error fetching product:', error));
	}
});

// Add product to cart
function addToCart(productId, quantity) {
	let cart = JSON.parse(localStorage.getItem('cart')) || [];

	// Check if the product already exists in the cart
	const existingProduct = cart.find(item => item.id === productId);
	if (existingProduct) {
		existingProduct.quantity += quantity;
	} else {
		cart.push({ id: productId, quantity });
	}

	// Save the updated cart to localStorage
	localStorage.setItem('cart', JSON.stringify(cart));
	alert('Product added to cart');
}

// Display cart items on the cart page
function displayCartItems() {
	const cart = JSON.parse(localStorage.getItem('cart')) || [];
	const cartItemsContainer = document.getElementById('cartItems');
	const totalPriceElement = document.getElementById('totalPrice');

	let totalPrice = 0;
	cartItemsContainer.innerHTML = ''; // Clear previous items

	if (cart.length === 0) {
		cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
		totalPriceElement.textContent = '€ 0.00';
		return;
	}

	// Use Promise.all to wait for all fetch requests to complete
	Promise.all(cart.map(async item => {
		try {
			const response = await fetch(`https://fakestoreapi.com/products/${item.id}`);
			const product = await response.json();

			const productTotalPrice = product.price * item.quantity;
			totalPrice += productTotalPrice;

			const productCard = document.createElement('div');
			productCard.className = 'row mb-4 d-flex justify-content-between align-items-center';
			productCard.innerHTML = `
                <div class="col-md-2 col-lg-2 col-xl-2">
                    <img src="${product.image}" class="img-fluid rounded-3" alt="${product.title}">
                </div>
                <div class="col-md-3 col-lg-3 col-xl-3">
                    <h6 class="text-muted">${product.category}</h6>
                    <h6 class="mb-0">${product.title}</h6>
                </div>
                <div class="col-md-3 col-lg-3 col-xl-2 d-flex">
    			<button class="btn btn-link px-1" onclick="updateQuantity('${item.id}', -1)" style="text-decoration: none;font-size: 20px">
        			-
    			</button>
    			<input
        			min="0"
        			name="quantity"
        			value="${item.quantity}"
        			type="number"
        			class="form-control form-control-sm"
        			style="max-width: 5rem; text-align: center;"
        			readonly
    			/>
    			<button class="btn btn-link px-1" onclick="updateQuantity('${item.id}', 1)" style="text-decoration: none">
        			+
    			</button>
                </div>
                <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                    <h6 class="mb-0">€ ${productTotalPrice.toFixed(2)}</h6>
                </div>
                <div class="col-md-1 col-lg-1 col-xl-1 text-end">
                    <a href="#!" class="text-muted" onclick="removeFromCart('${item.id}')"><i class="fas fa-times"></i></a>
                </div>
            `;

			cartItemsContainer.appendChild(productCard);
		} catch (error) {
			console.error('Error fetching product details:', error);
		}
	})).then(() => {
		totalPriceElement.textContent = `€ ${totalPrice.toFixed(2)}`;
	});
}

// Update product quantity in the cart
function updateQuantity(productId, change) {
	let cart = JSON.parse(localStorage.getItem('cart')) || [];
	const item = cart.find(item => item.id === productId);

	if (item) {
		item.quantity += change;

		if (item.quantity <= 0) {
			cart = cart.filter(item => item.id !== productId);
		}

		localStorage.setItem('cart', JSON.stringify(cart));
		displayCartItems();
	}
}

// Function to remove product from the cart
function removeFromCart(productId) {
	let cart = JSON.parse(localStorage.getItem('cart')) || [];
	cart = cart.filter(item => item.id !== productId);
	localStorage.setItem('cart', JSON.stringify(cart));
	displayCartItems(); // Refresh the cart display
}

// Function to clear the cart
function clearCart() {
	localStorage.removeItem('cart');
	displayCartItems(); // Refresh the cart display
}
