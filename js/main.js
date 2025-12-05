//Wrap around DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {

    //INSERT ALL CODE HERE
    const url = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json"
    let allProducts = [];
    let cart = [];
    let currentProductId = null;

    // Load products from JSON once the DOM is ready
    fetch(url)
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            console.log("Loaded products:", allProducts);

        })
        .catch(err => {
            console.error("Error loading products:", err);
        });

    

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
    renderCartView();   
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

    /* ---------------------- SINGLE PRODUCT VIEW END ---------------------- */


    /* ---------------------- SHOPPING CART VIEW  ---------------------- */

    const cartItems = document.querySelector("#cartItems");
    const shippingType = document.querySelector("#shippingType");
    const shippingCountry = document.querySelector("#shippingCountry");
    const sumMerch = document.querySelector("#sumMerch");
    const sumTax = document.querySelector("#sumTax");
    const sumShip = document.querySelector("#sumShip");
    const sumTotal = document.querySelector("#sumTotal");
    const checkoutBtn = document.querySelector("#checkoutBtn");


    /* 
    renderCartView()
    Builds the shopping cart UI inside #cartItems.
    For each item in the cart:
        - Find the matching product in allProducts
        - Display name, price, quantity box, subtotal, remove button
    If cart is empty, show "Your cart is empty"
    */
    function renderCartView() {
        cartItems.innerHTML = "";

        //If nothing in cart, show message and zero totals 
        if (cart.length === 0) {
            cartItems.textContent = "Your cart is empty";
            updateCartSummary();
            return;
        }

        cart.forEach(item => {
            // Find matching product so we can show name & price
            const product = allProducts.find(p => p.id === item.id);
            if (!product) return;

            const price = product.price;
            const subTotal = price * item.quantity;

            // Create the row container
            const row = document.createElement("div");
            row.classList.add("cart-item");
            row.dataset.productId = item.id;
            
            //Title
            const title = document.createElement("h3");
            title.textContent = product.name || product.title;
            row.appendChild(title);

            //Price info
            const info = document.createElement("p");
            info.textContent = `Price: $${price.toFixed(2)}`;
            row.appendChild(info);

            //Quantity control
            const qtyLabel = document.createElement("label");
            qtyLabel.textContent = "Qty: ";

            const qtyInputCart = document.createElement("input");
            qtyInputCart.type = "number";
            qtyInputCart.min = "1";
            qtyInputCart.value = item.quantity;
            qtyInputCart.classList.add("cart-qty");
            qtyLabel.appendChild(qtyInputCart);
            row.appendChild(qtyLabel);

            //Subtotal
            const sub = document.createElement("p");
            sub.textContent = `Subtotal: $${subTotal.toFixed(2)}`;
            row.appendChild(sub);

            //Remove button 
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.classList.add("cart-remove");
            row.appendChild(removeBtn);
            
            cartItems.appendChild(row);
        });

        updateCartSummary();
    }
    /*
    updateCartSummary()
    -------------------
    Calculates:
        - merchandise total
        - GST
        - shipping cost
        - final total
    Updates the #summaryBox UI.
    */
    function updateCartSummary() {
        let merchTotal = 0;

        cart.forEach(item => {
            const product = allProducts.find(p => p.id === item.id);
            if(!product) return;
            merchTotal += product.price * item.quantity;
        });

        const tax = merchTotal * 0.05;
        const shipping = calculateShipping(merchTotal, shippingType.value, shippingCountry.value);
        const total = merchTotal + tax + shipping;

        sumMerch.textContent = `$${merchTotal.toFixed(2)}`;
        sumTax.textContent = `$${tax.toFixed(2)}`;
        sumShip.textContent = `$${shipping.toFixed(2)}`;
        sumTotal.textContent = `$${total.toFixed(2)}`;
}

    /*
    calculateShipping(merchTotal, type, country)
    -------------------------------------------
    Simple shipping rules:
        - Free shipping over $500
        - Base cost depends on shipping type and country
    */
    function calculateShipping(merchTotal, type, country) {
        if(merchTotal == 0) return 0;

        if (merchTotal > 500) return 0;

        let base = 0;

        //Shipping cost based on type and country
        if (type === "standard") {
            if(country === "canada") base = 10;
            else if (country === "usa") base = 15;
            else if (country === "international") base = 20;
        }
        else if(type === "express") {
            if(country === "canada") base = 25;
            else if (country === "usa") base = 25;
            else if (country === "international") base = 30;
        }
        else if (type === "priority") {
            if(country === "canada") base = 35;
            else if (country === "usa") base = 50;
            else if (country === "international") base = 50;
        }

        return base;
    }
    /*
    findCartRow(element)
    --------------------
    Same idea as your findProductCard:
    Walk upward in the DOM until we find the parent <div class="cart-item">
    */
    function findCartRow(e) {
        while (e != null) {
            if (e.classList && e.classList.contains("cart-item")) {
                return e;
            }
            e = e.parentNode;
        }
        return null;
    };

    /*
    Event Delegation:
    -----------------
    Handle clicking the remove button inside any cart row.
    */
    cartItems.addEventListener("click", (e) => {
        if (!e.target.classList.contains("cart-remove")) return;

        const row = findCartRow(e.target);
        if(!row) return;

        const id = row.dataset.productId;
        removeFromCart(id);
    });

    /*
    Event Delegation:
    -----------------
    Handle quantity changes inside any cart row.
    */
    cartItems.addEventListener("change", (e) => {
        if (!e.target.classList.contains("cart-qty")) return;

        const row = findCartRow(e.target);
        if(!row) return;

        const id = row.dataset.productId;
        const newQty = parseInt(e.target.value);
        updateCartQuantity(id, newQty);
    })

    /*
    removeFromCart(productId)
    -------------------------
    Deletes the item from the cart array.
    */
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        renderCartView();
    }

    /*
    updateCartQuantity(productId, newQty)
    ------------------------------------
    Updates quantity of the item.
    */
    function updateCartQuantity(productId, newQty) {
        if (!newQty || newQty < 1 ) newQty = 1;

        const item = cart.find(i => i.id === productId);
        if(!item) return;

        item.quantity = newQty;
        renderCartView();
    }

    /*
    Recalculate shipping cost whenever user changes dropdowns
    */
    shippingType.addEventListener("change", updateCartSummary);
    shippingCountry.addEventListener("change", updateCartSummary);

    /*
    checkoutBtn functionality:
    - show alert
    - clear cart
    - refresh cart view
    */
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        alert("Checkout complete!");

        // Clear cart and re-render
        cart = [];
        renderCartView();
        /* ---------------------- SHOPPING CART VIEW END ---------------------- */

});

});
