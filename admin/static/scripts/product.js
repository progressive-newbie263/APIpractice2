import { renderPaginationControls } from "./utils/pageNumbering.js";

const productList = document.getElementById("productTable");
const productForm = document.getElementById("addProductForm");
const formTitle = document.querySelector(".form-section h2");
const submitBtn = productForm.querySelector("input[type='submit']");

let products = []; // Store fetched products
let editingProduct = null; // Track the product being edited
let currentPage = 1; // Track the current page
const productsPerPage = 5; // 5 products per page

// Fetch and display products from products API
async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:8082/api/products");
    if (!response.ok) throw new Error("Failed to fetch products.");

    products = await response.json();
    renderProductList(products);
  } catch (error) {
    console.error(error.message);
  }
}

// Filter the products based on the search query
function filterProducts(searchQuery) {
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.keywords.toLowerCase().includes(searchQuery.toLowerCase())
  );
  currentPage = 1;

  renderProductList(filteredProducts); // Render filtered products
}

// Render the product list in the table
function renderProductList(productArray) {
  productList.innerHTML = ""; // Clear the table

  // Pagination logic
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToDisplay = productArray.slice(startIndex, endIndex);

  productsToDisplay.forEach((product) => {
    const row = document.createElement("tr");

    // Add the 'disabled-product' class if the product is inactive
    if (!product.is_active) {
      row.classList.add("disabled-product");
    }

    row.innerHTML = `
      <td>${product.id}</td>
      <td><img class="zoom-out-image" src="/${product.image}" alt="${product.name}" width="50"></td>
      <td>${product.name}</td>
      <td>${product.ratingstars}⭐</td>
      <td>${product.ratingcount} reviews</td>
      <td>$${(product.pricecents / 100).toFixed(2)}</td>
      <td>${product.keywords}</td>
      <td>${product.type}</td>
      <td>
        <button class="edit-btn" data-id="${product.id}">Edit</button>
        <button class="toggle-btn ${product.is_active ? '' : 'disabled'}" data-id="${product.id}">
          ${product.is_active ? "Enabled" : "Disabled"}
        </button>
      </td>
    `;
    productList.appendChild(row);
  });

  // Render pagination controls
  renderPaginationControls(
    productArray.length,
    productsPerPage,
    currentPage,
    (newPage) => {
      currentPage = newPage;
      renderProductList(productArray);
    }
  );
}

// Handle search input
const searchProdInput = document.getElementById("searchProductInput");
searchProdInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const searchQuery = e.target.value;
    filterProducts(searchQuery); // Fetch products based on search query
  }
});

// Handle search button click
const searchProdButton = document.getElementById("searchProductButton");
searchProdButton.addEventListener("click", () => {
  const searchQuery = searchProdInput.value;
  filterProducts(searchQuery); // Fetch products based on search query
});

// Event for toggling/editing a product
productList.addEventListener("click", (e) => {
  const productID = e.target.getAttribute("data-id");

  if (e.target.classList.contains("toggle-btn")) {
    showConfirmationDialog(productID); // Show confirmation before toggling status
  } else if (e.target.classList.contains("edit-btn")) {
    editProduct(productID); // Handle product edit
  }
});

// Show confirmation dialog before toggling product status
function showConfirmationDialog(productID) {
  const product = products.find((p) => p.id == productID);
  if (!product) return;

  // Update confirmation message based on product's is_active status
  const confirmationMessage = product.is_active 
    ? "Confirm to disable the product" 
    : "Confirm to enable the product";

  const confirmation = confirm(confirmationMessage);
  if (confirmation) {
    toggleProductStatus(productID); // If confirmed, toggle the product status
  }
}

// Toggle product status
async function toggleProductStatus(productID) {
  try {
    const product = products.find((p) => p.id == productID);
    if (!product) throw new Error("Product not found.");

    const newStatus = !product.is_active;

    const response = await fetch("/api/products/toggle", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: productID, is_active: newStatus }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    // Show success message
    showToastMessage(`Product has been ${newStatus ? "enabled" : "disabled"} successfully ✅`);

    // Update the product status locally
    product.is_active = newStatus;
    renderProductList(products);
  } catch (error) {
    console.error("Failed to toggle product status:", error);
    alert(`Error: ${error.message}`);
  }
}

// Show success message at the top-right corner
function showToastMessage(message) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  
  const messageText = document.createElement("p");
  messageText.innerText = message;
  toast.appendChild(messageText);
  
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  toast.appendChild(progressBar);

  document.body.appendChild(toast);

  // Start the progress bar animation
  setTimeout(() => {
    progressBar.style.width = "0%"; // Thanh tiến trình thu lại trong vòng 5 giây
  }, 10);

  // After 5 seconds, hide the toast and progress bar
  setTimeout(() => {
    toast.classList.add("hide"); // Thêm class 'hide' để kích hoạt thu lại
  }, 3000);

  // Remove the toast after 5.5 seconds to ensure animation completes
  setTimeout(() => {
    toast.remove(); // Xóa toast khi hết thời gian
  }, 3000);
}

// Edit product
function editProduct(productID) {
  const product = products.find((p) => p.id == productID);

  if (!product) {
    console.error("Product not found");
    return;
  }

  document.getElementById("productImage").value = product.image;
  document.getElementById("productName").value = product.name;
  document.getElementById("productRating").value = product.ratingstars;
  document.getElementById("productRatingCount").value = product.ratingcount;
  document.getElementById("productPrice").value = product.pricecents;
  document.getElementById("productKeywords").value = product.keywords;
  document.getElementById("productType").value = product.type;

  formTitle.innerHTML = "Edit Product";
  submitBtn.value = "Update Product";

  editingProduct = productID;
}

// Add product form submission (create or update)
productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const productData = {
    id: editingProduct,
    image: document.getElementById("productImage").value,
    name: document.getElementById("productName").value,
    ratingstars: parseFloat(document.getElementById("productRating").value),
    ratingcount: parseInt(document.getElementById("productRatingCount").value),
    pricecents: parseInt(document.getElementById("productPrice").value),
    keywords: document.getElementById("productKeywords").value,
    type: document.getElementById("productType").value,
  };

  const method = editingProduct ? "PUT" : "POST";
  const url = editingProduct
    ? "/api/products/update"
    : "/api/products/create";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      alert(`${editingProduct ? "Product updated" : "Product created"} successfully!`);
      productForm.reset();
      fetchProducts();
      editingProduct = null;
      formTitle.innerHTML = "Add Product";
      submitBtn.value = "Add Product";
    } else {
      const errorMessage = await response.text();
      alert(`Error: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Failed to create or update product:", error);
    alert("Failed to create or update product. Please try again.");
  }
});

// Fetch products when the page loads
window.addEventListener("DOMContentLoaded", fetchProducts);
