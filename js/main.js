//Wrap around DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {

    //INSERT ALL CODE HERE
    const url = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json"
    let allProducts = [];
    let cart = [];
    let currentProductId = null;


    function loadProducts() {
        // FIRST: Try to load the product data from localStorage.
        let stored = localStorage.getItem("products");
    
        // If localStorage already has product data saved
        if (stored) {
    
            // Convert JSON string → JavaScript array
            allProducts = JSON.parse(stored);
    
            // Build all filters and show the browse results
            generateCategoryFilters();
            generateSizeFilters();
            generateColorFilters();
            applyBrowseFiltersAndSort();
    
            // Stop here — no need to fetch from API
            return;
        }
    

        // Otherwise: fetch the product data from the API
        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();  // convert response → JS data
                }
                throw new Error("Fetch failed");
            })
            .then(data => {
    
                // Save fetched data into our global array
                allProducts = data;
    
                // Save the data in localStorage for future visits
                // Convert array → JSON string before saving
                localStorage.setItem("products", JSON.stringify(allProducts));
    
                console.log("Fetched from server and saved to localStorage");
    
                // Now generate filters and show results
                generateCategoryFilters();
                generateSizeFilters();
                generateColorFilters();
                applyBrowseFiltersAndSort();
            })
            .catch(err => {
                console.error("Error loading products:", err);
            });
    }
    
    

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
    const activeFilters = document.querySelector("#activeFilters");
    const clearAllFiltersBtn = document.querySelector("#clearAllFilters");
    const sortSelect = document.querySelector("#sortSelect");
    const sizeOptions = document.querySelector("#sizeOptions");
    const colorOptions = document.querySelector("#colorOptions");
    let selectedSize = null;
    let selectedColor = null;

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
        `Home > ${product.gender} > ${product.category} > ${product.name}`;

    // -------------------------
    // Update main product info
    // -------------------------
    productTitle.textContent = product.name;
    productPrice.textContent = `$${product.price.toFixed(2)}`;
    productDescription.textContent = product.description;
    productMaterial.textContent = `Material: ${product.material}`;

    // Set default selected size and color for this product
    selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    selectedColor = product.color && product.color.length > 0 ? product.color[0].name : null;

    // Render size and color options for this product
    renderSizeOptions(product);
    renderColorOptions(product);

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

function getProductImage(product) {
    if (product.category === "Tops") return "images/tops.jpg";
    if (product.category === "Bottoms") return "images/bottoms.jpg";
    if (product.category === "Dresses") return "images/dress.jpg";
    if (product.category === "Swimwear") return "images/swimwear.jpg";
    if (product.category === "Accessories") return "images/accessories.jpg";
    if (product.category === "Outerwear") return "images/outerwear.jpg";
    if (product.category === "Loungewear") return "images/loungewear.jpg";
    if (product.category === "Intimates") return "images/intimates.jpg";
    if (product.category === "Shoes") return "images/shoes.jpg";
    if (product.category === "Sweaters") return "images/sweaters.jpg";
    if (product.category === "Jumpsuits") return "images/jumpsuits.jpg";
    return "images/default.jpg";
  }

    /*
    renderSizeOptions(product)
    Builds clickable size buttons (XS, S, M, L, etc.) for the
    current product. Highlights the currently selected size.
    */
  function renderSizeOptions(product) {
    sizeOptions.innerHTML = "";

    //If no sizes listed, show a message that says one size only
    if (!product.sizes || product.sizes.length === 0) {
        sizeOptions.textContent = "One size only";
        return;
    }

    product.sizes.forEach(size => {
        const btn = document.createElement("button");
        btn.textContent = size;
        btn.classList.add("size-option");

        if(size === selectedSize) {
            btn.classList.add("active");
        }
        sizeOptions.appendChild(btn);
    });
  }

    /*
    Size options click handler
    --------------------------
    When user clicks a size button, update selectedSize and
    highlight that button.
    */
    sizeOptions.addEventListener("click", (e) => {
        if (!e.target.classList.contains("size-option")) return;

        selectedSize = e.target.textContent;

        // Toggle active class on all size buttons
        const buttons = sizeOptions.querySelectorAll(".size-option");
        buttons.forEach(btn => {
            btn.classList.toggle("active", btn === e.target);
        });
    });


    /*
    renderColorOptions(product)
    Builds color swatches for the current product using the
    product.color array (name + hex). Highlights the selected color.
    */
    function renderColorOptions(product) {
        colorOptions.innerHTML = "";
    
        if (!product.color || product.color.length === 0) {
            colorOptions.textContent = "No color options";
            return;
        }
    
        product.color.forEach(c => {
            // wrapper so we can stack swatch + text together
            const wrapper = document.createElement("div");
            wrapper.classList.add("color-wrapper");
    
            // swatch circle
            const swatch = document.createElement("button");
            swatch.classList.add("color-swatch");
            swatch.style.backgroundColor = c.hex;
            swatch.dataset.colorName = c.name;
    
            if (c.name === selectedColor) {
                swatch.classList.add("active");
            }
    
            // label
            const label = document.createElement("span");
            label.textContent = c.name;
            label.classList.add("color-label");
    
            wrapper.appendChild(swatch);
            wrapper.appendChild(label);
    
            colorOptions.appendChild(wrapper);
        });
    }

    /*
    Color options click handler
    ---------------------------
    When user clicks a color swatch, update selectedColor and
    highlight that swatch.
    */
    colorOptions.addEventListener("click", (e) => {
        if (!e.target.classList.contains("color-swatch")) return;

        selectedColor = e.target.dataset.colorName;

        const swatches = colorOptions.querySelectorAll(".color-swatch");
        swatches.forEach(sw => {
            sw.classList.toggle("active", sw === e.target);
        });
    });
    
/*
  renderRelatedProducts(product)
  Builds up to 4 related product cards (same category, different id)
  underneath the main Single Product view.

  Each related card:
    - uses class "product-card related-card"
    - has data-product-id set
    - shows image, name, price
    - includes a "+ Add" button
*/
function renderRelatedProducts(product) {
    // Clear any previous related items
    relatedProducts.innerHTML = "";

    // Get other products in the same category (exclude current one)
    const related = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4); // limit to 4 items

    // If no related items, just leave blank (or show message if you want)
    if (related.length === 0) {
        return;
    }

    related.forEach(p => {
        // Outer card
        const card = document.createElement("article");
        card.classList.add("product-card", "related-card"); // reuse product-card styling
        card.dataset.productId = p.id;

        // Image
        const img = document.createElement("img");
        img.src = getProductImage(p);
        img.alt = p.name || p.title;
        img.classList.add("product-image"); // same class as browse cards
        card.appendChild(img);

        // Title
        const title = document.createElement("h4");
        title.textContent = p.name || p.title;
        title.classList.add("product-title");
        card.appendChild(title);

        // Price
        const price = document.createElement("p");
        price.textContent = `$${p.price.toFixed(2)}`;
        price.classList.add("product-price");
        card.appendChild(price);

        // "+ Add" button
        const addBtn = document.createElement("button");
        addBtn.textContent = "+ Add";
        addBtn.classList.add("card-add");   
        card.appendChild(addBtn);

        relatedProducts.appendChild(card);
    });
}

relatedProducts.addEventListener("click", (e) => {
    let card = e.target;
  
    // walk up the tree until we find .related-card
    while (card && !card.classList?.contains("related-card")) {
      card = card.parentNode;
    }
  
    if (!card) return;
  
    const productId = card.dataset.productId;
    showProduct(productId);
  });


/*
  Click event for product cards in the Browse View
  ------------------------------------------------
  - Detects when the user clicks a product card in the Browse results.
  - Reads the product ID from the card.
*/
results.addEventListener("click", (e) => {
    if (e.target.classList.contains("card-add")) {
        // 1) If user clicked the "+ Add" button on a card, add to cart only
        const card = findProductCard(e.target);
        if (!card) return;
        const id = card.dataset.productId;
        addToCart(id, 1);
        return;
    }

    // 2) Otherwise treat click as "open this product"
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

    const idNum = Number(productId);

    // Try to find existing item
    const existing = cart.find(item => item.id === idNum);

    if (existing) {
        existing.quantity += qty; // increment existing quantity
    } else {
        cart.push({ id: idNum, quantity: qty }); // add new entry
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
            title.textContent = product.name;
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
    Deletes the item from the cart array.
    */
    function removeFromCart(productId) {
        const idNum = Number(productId);
        cart = cart.filter(item => item.id !== idNum);
        renderCartView();
    }

    /*
    updateCartQuantity(productId, newQty)
    Updates quantity of the item.
    */
    function updateCartQuantity(productId, newQty) {
        if (!newQty || newQty < 1 ) newQty = 1;

        const idNum = Number(productId);
        const item = cart.find(i => i.id === idNum);
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


    /* ---------------------- BROWSE VIEW  ---------------------- */

    const genderFilterBox = document.querySelector("#filterGender");
    const categoryFilterBox = document.querySelector("#filterCategory");
    const sizeFilterBox = document.querySelector("#filterSize");
    const colorFilterBox = document.querySelector("#filterColor");
    

    const browseState = {
        gender: null,        // "womens", "mens", or null
        category: null,      // "Tops", "Bottoms", ...
        size: null,          // "XS", "S", ...
        colors: [],          // array of selected color names: ["Beige", "Blue"]
        sortBy: "name"       // "name" | "price" | "category"
      };


    /* 
    renderBrowseResults(products)
    -----------------------------
    Clears the results area and creates product cards for each product.
    Each card shows image, title, price, and includes a data-product-id.
    */
    function renderBrowseResults(products) {
        results.innerHTML = "";
      
        if (products.length === 0) {
          results.textContent = "No products match your filter.";
          return;
        }
      
        products.forEach(product => {
          const card = document.createElement("article");
          card.classList.add("product-card");
          card.dataset.productId = product.id;
      
          // IMAGE
          const img = document.createElement("img");
          img.src = getProductImage(product);
          img.alt = product.name || product.title;
          img.classList.add("product-image");
          card.appendChild(img);
      
          // TITLE  ← this is what you want
          const title = document.createElement("h3");
          title.textContent = product.name || product.title;
          title.classList.add("product-title");
          card.appendChild(title);
      
          // PRICE
          const price = document.createElement("p");
          price.textContent = `$${product.price.toFixed(2)}`;
          price.classList.add("product-price");
          card.appendChild(price);
      
          // ADD BUTTON
          const addBtn = document.createElement("button");
          addBtn.textContent = "+ Add";
          addBtn.classList.add("card-add");
          card.appendChild(addBtn);
      
          results.appendChild(card);
        });
      }

    function applyBrowseFiltersAndSort() {
        let filtered = allProducts.slice();

        //Gender filter
        if (browseState.gender) {
            filtered = filtered.filter(p => p.gender === browseState.gender);
        }

        //Category filter
        if (browseState.category) {
            filtered = filtered.filter(p => p.category === browseState.category);
        }

        // Size filter
        if (browseState.size) {
            let newFiltered = [];
          
            for (let i = 0; i < filtered.length; i++) {
              let product = filtered[i];
              let hasSize = false;
          
              // check if product has a sizes array
              if (product.sizes) {
                for (let j = 0; j < product.sizes.length; j++) {
                  if (product.sizes[j] === browseState.size) {
                    hasSize = true;
                    break;
                  }
                }
              }
          
              if (hasSize) newFiltered.push(product);
            }
          
            filtered = newFiltered;
          }
          

        //Color filter
        if (browseState.colors.length > 0) {
            filtered = filtered.filter(p => {
              if (!p.color) return false; // safety
              const productColorNames = p.color.map(c => c.name);
              // product must contain ALL selected colors
              return browseState.colors.every(
                cName => productColorNames.includes(cName)
              );
            });
          }

        //Sort
        if (browseState.sortBy === "name") {
            filtered.sort((a, b) => {
              const nameA = a.name || a.title;
              const nameB = b.name || b.title;
        
              if (nameA < nameB) return -1;
              if (nameA > nameB) return 1;
              return 0;
            });
          } else if (browseState.sortBy === "price") {
            filtered.sort((a, b) => a.price - b.price);
          } else if (browseState.sortBy === "category") {
            filtered.sort((a, b) => {
              const catA = a.category;
              const catB = b.category;
              if (catA < catB) return -1;
              if (catA > catB) return 1;
              return 0;
            });
          }
          renderBrowseResults(filtered);
          renderActiveFilters();
    }


    /*
    renderActiveFilters()
    Shows the current filters as little "chips" (e.g., Female, Dresses, Small, Blue).
    Clicking a chip removes that one filter and re-applies filtering.
    */
    function renderActiveFilters() {

        if (!activeFilters) return;
    
        activeFilters.innerHTML = "";
    
        // Helper to create one chip
        const addChip = (label, type, value) => {
        const chip = document.createElement("button");
        chip.classList.add("filter-chip");
        chip.textContent = label;
    
        chip.addEventListener("click", () => {
            // Remove that specific filter when the chip is clicked
            if (type === "gender") {
            browseState.gender = null;
            } else if (type === "category") {
            browseState.category = null;
            } else if (type === "size") {
            browseState.size = null;
            } else if (type === "color") {
            browseState.colors = browseState.colors.filter(c => c !== value);
            }
    
            applyBrowseFiltersAndSort();
        });
    
        activeFilters.appendChild(chip);
        };
    
        // Gender (convert internal value to label)
        if (browseState.gender) {
            const label = browseState.gender === "womens" ? "Female" : "Male";
            addChip(label, "gender");
        }
    
        // Category chip
        if (browseState.category) {
            addChip(browseState.category, "category");
        }
    
        // Size chip
        if (browseState.size) {
            addChip(browseState.size, "size");
        }
    
        // Color chips
        browseState.colors.forEach(colorName => {
            addChip(colorName, "color", colorName);
        });
    }

    /*
    Clear All Filters button
    Resets browseState and re-applies filters (which in this case
    means "no filters" → all products).
    */
   if (clearAllFiltersBtn) {
    clearAllFiltersBtn.addEventListener("click", () => {
        browseState.gender = null;
        browseState.category = null;
        browseState.size = null;
        browseState.colors = [];
        browseState.sortBy = "name";

        if (sortSelect) {
            sortSelect.value = "name";
        }

        resetAllFilterButtons();

        applyBrowseFiltersAndSort();
    });
   }

    /*
    Sort dropdown handler

    When the user changes the sort order (name / price / category),
    update browseState.sortBy and re-apply filtering.
    */
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
        browseState.sortBy = sortSelect.value;
        applyBrowseFiltersAndSort();
        });
    }

    /* 
    Gender filter
    Clicking Female/Male sets browseState.gender.
    Clicking the same again turns it off (toggle).
    */
    genderFilterBox.addEventListener("click", (e) => {
        let btn = e.target;
        while (btn && !btn.classList.contains("gender-filter")) {
            btn = btn.parentNode;
        }
        if (!btn) return;
    
        const value = btn.dataset.gender;
    
        // Toggle: if already selected, clear it; otherwise set it
        if (browseState.gender === value) {
        browseState.gender = null;
        } else {
        browseState.gender = value;
        }
    
        // Update active class on buttons
        const buttons = genderFilterBox.querySelectorAll(".gender-filter");
        buttons.forEach(b => {
            if (b.dataset.gender === browseState.gender) {
              b.classList.add("active");
            } else {
              b.classList.remove("active");
            }
          });
    
        applyBrowseFiltersAndSort();
    });

    /*
    Category filter
    Only one category active at a time.
    */
    categoryFilterBox.addEventListener("click", (e) => {
        let btn = e.target;
        while (btn && !btn.classList.contains("category-filter")) {
            btn = btn.parentNode;
        }
        if (!btn) return;
      
        const value = btn.dataset.category;
      
        if (browseState.category === value) {
          browseState.category = null;
        } else {
          browseState.category = value;
        }
      
        const buttons = categoryFilterBox.querySelectorAll(".category-filter");
        buttons.forEach(b => {
            if (b.dataset.category === browseState.category) {
              b.classList.add("active");
            } else {
              b.classList.remove("active");
            }
          });
      
        applyBrowseFiltersAndSort();
      });


    /*
    Size filter
    One size at a time (XS, S, M, L...).
    */
    sizeFilterBox.addEventListener("click", (e) => {
        let btn = e.target;
        while (btn && (!btn.classList || !btn.classList.contains("size-filter"))) {
            btn = btn.parentNode;
        }
        if (!btn) return;

        const value = btn.dataset.size;

        if (browseState.size === value) {
            browseState.size = null;
        } else {
            browseState.size = value;
        }

        const buttons = sizeFilterBox.querySelectorAll(".size-filter");
        buttons.forEach(b => {
            if (b.dataset.size === browseState.size) {
                b.classList.add("active");
            } else {
                b.classList.remove("active");
            }
        });

        applyBrowseFiltersAndSort();
    });

    /*
    Color filter
    Allows multiple colors at once (array of strings).
    */
    colorFilterBox.addEventListener("click", (e) => {
        let btn = e.target;
        while (btn && (!btn.classList || !btn.classList.contains("color-filter"))) {
            btn = btn.parentNode;
        }
        if (!btn) return;
    
        const value = btn.dataset.color;
        const index = browseState.colors.indexOf(value);
    
        if (index === -1) {
            browseState.colors.push(value);
            btn.classList.add("active");
        } else {
            browseState.colors.splice(index, 1);
            btn.classList.remove("active");
        }
    
        applyBrowseFiltersAndSort();
    });
    


    /*
    generateColorFilters()
    Looks at allProducts and builds one color button for each
    unique color name (Wine, Light Gray, Red, etc.).
    */
    function generateColorFilters() {
        let colors = [];
    
        // Collect all color names from product data
        for (let i = 0; i < allProducts.length; i++) {
            let p = allProducts[i];
    
            if (p.color) {
                for (let j = 0; j < p.color.length; j++) {
                    let colorName = p.color[j].name;
    
                    // Add only if not already in colors[]
                    let exists = false;
    
                    for (let k = 0; k < colors.length; k++) {
                        if (colors[k] === colorName) {
                            exists = true;
                            break;
                        }
                    }
    
                    if (!exists) {
                        colors.push(colorName);
                    }
                }
            }
        }
    
        // Sort alphabetically
        colors.sort();
    
        // Clear old buttons
        colorFilterBox.innerHTML = "";
    
        // Build buttons
        for (let i = 0; i < colors.length; i++) {
            const btn = document.createElement("button");
            btn.classList.add("color-filter");
            btn.dataset.color = colors[i];
            btn.textContent = colors[i];
            colorFilterBox.appendChild(btn);
        }
    }
    

    /*
    generateCategoryFilters()
    Builds one button per unique category found in allProducts.
    Example: Tops, Bottoms, Dresses, Outerwear, Loungewear, Shoes, etc.
    */
    function generateCategoryFilters() {

        let categories = []; 
    
        // Collect category names from all products (no duplicates)
        for (let i = 0; i < allProducts.length; i++) {
            const p = allProducts[i];
            const cat = p.category;
    
            if (cat) {
                // manually check if cat is already in the array
                let exists = false;
                for (let j = 0; j < categories.length; j++) {
                    if (categories[j] === cat) {
                        exists = true;
                        break;
                    }
                }
    
                if (!exists) {
                    categories.push(cat);
                }
            }
        }
    
        // Sort alphabetically
        categories.sort();
    
        // Clear any existing buttons
        categoryFilterBox.innerHTML = "";
    
        // Build buttons
        for (let k = 0; k < categories.length; k++) {
            const catName = categories[k];
    
            const btn = document.createElement("button");
            btn.classList.add("category-filter");
            btn.dataset.category = catName;
            btn.textContent = catName;
    
            categoryFilterBox.appendChild(btn);
        }
    }
    

    /*
    generateSizeFilters()
    Builds size buttons (XS, S, M, L, XL, etc.)
    */
    function generateSizeFilters() {

        let sizes = [];  

        // Collect all sizes from products (no duplicates)
        for (let i = 0; i < allProducts.length; i++) {
            const product = allProducts[i];

            if (product.sizes) {
                for (let j = 0; j < product.sizes.length; j++) {
                    const size = product.sizes[j];

                    // check if size already exists in sizes[]
                    let exists = false;
                    for (let k = 0; k < sizes.length; k++) {
                        if (sizes[k] === size) {
                            exists = true;
                            break;
                        }
                    }

                    if (!exists) {
                        sizes.push(size);
                    }
                }
            }
        }

        // Clear existing buttons
        sizeFilterBox.innerHTML = "";

        // Build buttons
        for (let i = 0; i < sizes.length; i++) {
            const sizeName = sizes[i];

            const btn = document.createElement("button");
            btn.classList.add("size-filter");
            btn.dataset.size = sizeName;
            btn.textContent = sizeName;

            sizeFilterBox.appendChild(btn);
        }
    }

    /*
    resetAllFilterButtons()
    When a user clicks on an active filter and then clicks the "clear all" button it'll remove the active filter.
    */
    function resetAllFilterButtons() {
        // Gender
        document.querySelectorAll(".gender-filter").forEach(btn => {
            btn.classList.remove("active");
        });
    
        // Category
        document.querySelectorAll(".category-filter").forEach(btn => {
            btn.classList.remove("active");
        });
    
        // Size
        document.querySelectorAll(".size-filter").forEach(btn => {
            btn.classList.remove("active");
        });
    
        // Color
        document.querySelectorAll(".color-filter").forEach(btn => {
            btn.classList.remove("active");
        });
    }
    

  

    /* ---------------------- BROWSE VIEW END ---------------------- */


    /* ---------------------- NAVIGATION BUTTONS ---------------------- */
    // Handle nav buttons (Home, Browse, Cart)
    
    document.querySelectorAll("nav [data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
        const viewId = btn.dataset.view;   // e.g. "homeView", "browseView", "cartView"
        showView(viewId);
    });
    });

    // About modal elements
    const aboutBtn = document.querySelector("#aboutBtn");
    const aboutOverlay = document.querySelector("#aboutOverlay");
    const closeAboutBtn = document.querySelector("#closeAbout");

    // Open modal using display = "flex"
    aboutBtn.addEventListener("click", () => {
    aboutOverlay.style.display = "flex";
    });

    // Close modal using display = "none"
    closeAboutBtn.addEventListener("click", () => {
    aboutOverlay.style.display = "none";
    });


    // Default starting view when the page first loads
    loadProducts();  
    showView("homeView");

    /* ---------------------- NAVIGATION BUTTONS END ---------------------- */

});
