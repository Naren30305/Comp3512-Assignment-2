//Wrap around DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {

    //INSERT ALL CODE HERE
    const url = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json"
    let allProducts = [];
    let cart = [];
    let currentProductId = null;
    

    /* ---------------------- SINGLE PRODUCT VIEW ---------------------- */

    const breadcrumbs = document.querySelector("#breadcrumbs");
    const productImage = document.querySelector("#productImage");
    const productTitle = document.querySelector("#productTitle");
    const productPrice = document.querySelector("#productPrice");
    const productDescription = document.querySelector("#productDescription");
    const productMaterial = document.querySelector("#productMaterial");
    const qtyInput = document.querySelector("#qtyInput");
    const addToCartBtn = document.querySelector("#addToCartBtn");
    const relatedProducts = document.querySelector("#relatedProducts");
    const results = document.querySelector("#results");

   /* 
  showProduct(productId)
  ----------------------
  Displays the Single Product View for the selected product.
  - Finds the product from allProducts
  - Updates all UI elements (title, price, description, etc.)
  - Shows breadcrumbs
  - Shows placeholder image
  - Resets quantity input
  - Renders related products
  - Switches the SPA view to "singleProductView"
*/
function showProduct(productId) {
    // Track which product is currently being viewed
    currentProductId = productId;

    // Find the matching product (string compare ensures no type mismatch)
    const product = allProducts.find(p => String(p.id) === String(productId));

    // If product doesn't exist
    if (!product) {
        console.error("Product not found:", productId);
        return;
    }

    // -------------------------
    // Update breadcrumbs (top path: Home > Gender > Category > Title)
    // -------------------------
    breadcrumbs.textContent =
        `Home > ${product.gender} > ${product.category} > ${product.title}`;

    // -------------------------
    // Update main product info
    // -------------------------
    productTitle.textContent = product.title;
    productPrice.textContent = `$${product.price.toFixed(2)}`;
    productDescription.textContent = product.description;
    productMaterial.textContent = `Material: ${product.material}`;

    function getProductImage(product) {
        if (product.category === "Tops") return "images/tops.jpg";
        if (product.category === "Bottoms") return "images/bottoms.jpg";
        if (product.category === "Dresses") return "images/dress.jpg";
        if (product.category === "Swimwear") return "images/swimwear.jpg";
        if (product.category === "Accessories") return "images/accessories.jpg";
        if (product.category === "Outerwear") return "images/outerwear.jpg";
        return "images/default.jpg";
      }

    productImage.innerHTML = ""; // clear previous image

    const img = document.createElement("img");
    img.src = getProductImage(product); // <--- use the helper
    img.alt = product.name; 
    img.style.width = "300px";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    
    productImage.appendChild(img);

    // Always reset quantity input to 1 when opening this view
    qtyInput.value = 1;

    // Render related products (same category)
    renderRelatedProducts(product);

    // Switch to the single product view in the SPA
    showView("singleProductView");
}


/*
  renderRelatedProducts(product)
  ------------------------------
  Shows up to 4 other items from the same category as the current product.
  These appear as simple clickable cards below the main product info.
*/
function renderRelatedProducts(product) {
    // Clear previous related products
    relatedProducts.innerHTML = "";

    // Get related items: same category, exclude the current product
    const related = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4); // only show first 4 items

    // Create a small card for each related product
    related.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("related-card");
        card.dataset.productId = p.id; // allow clicking to open single product
        card.textContent = `${p.title} - $${p.price.toFixed(2)}`;
        relatedProducts.appendChild(card);
    });
}


/*
  Click event for product cards in the Browse View
  ------------------------------------------------
  - Detects when the user clicks a product card in the Browse results.
  - Reads the product ID from the card.
*/
results.addEventListener("click", (e) => {
    const card = findProductCard(e.target);
    if (!card) return;

    const id = card.dataset.productId;
    showProduct(id);
});


// Helper function to find the parent .product-card
function findProductCard(element) {
    while (element !== null) {
        if (element.classList && element.classList.contains("product-card")) {
            return element;
        }
        element = element.parentNode;  
    }
    return null;
}


/*
  addToCart(productId, qty)
  -------------------------
  Adds a product to the shopping cart.
  - If the item already exists in the cart, increase its quantity.
  - Otherwise, create a new entry.
  - Shows a temporary alert (will be replaced with a toast later).
*/
function addToCart(productId, qty) {

    // Try to find existing item
    const existing = cart.find(item => item.id == productId);

    if (existing) {
        existing.quantity += qty; // increment existing quantity
    } else {
        cart.push({ id: productId, quantity: qty }); // add new entry
    }

    alert("Added to cart!");
}


/*
  When the "Add to Cart" button is clicked in the Single Product View:
  - Read the value from the quantity input
  - Call addToCart() with the currentProductId
*/
addToCartBtn.addEventListener("click", () => {
    const qty = parseInt(qtyInput.value);
    addToCart(currentProductId, qty);
});


/*
  showView(viewId)
  - Shows only the view whose id matches viewId
*/
function showView(viewId) {
    document.querySelectorAll("article.view").forEach(view => {
        view.style.display = (view.id === viewId) ? "block" : "none";
    });
};

    /* ---------------------- SINGLE PRODUCT VIEW ---------------------- */

});