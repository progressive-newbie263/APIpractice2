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
    const response = await fetch('http://localhost:8082/api/products');
    if (!response.ok) throw new Error("Failed to fetch products.");
    
    products = await response.json();
    renderProductList(products);
  } catch (error) {
    console.error(error.message);
  }
}

// Filter the products based on the search query
function filterProducts(searchQuery) {
  const filteredProducts = products.filter(product => 
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

    row.innerHTML = `
      <td>${product.id}</td>
      <td><img class="zoom-out-image" src="/${product.image}" alt="${product.name}" width="50"></td>
      <td>${product.name}</td>
      <td>${product.ratingstars}⭐</td>
      <td>${product.ratingcount} reviews</td>
      <td>$${(product.pricecents / 100).toFixed(2)}</td>
      <td>${product.keywords}</td>
      <td>${product.type}</td>
      
      <!--
      <td>${product.sizechartlink.String ? product.sizechartlink.String : 'No info'}</td>
      <td>${product.instructionslink.String ? product.instructionslink.String : 'No info'}</td>
      <td>${product.warrantylink.String ? product.warrantylink.String : 'No info'}</td>
      -->

      <td>
        <button class="edit-btn" data-id="${product.id}">
          Edit
        </button>
        <button class="delete-btn" data-id="${product.id}">
          Delete
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

// Event for deleting/editing a product
productList.addEventListener("click", (e) => {
  const productID = e.target.getAttribute("data-id");
  
  if (e.target.classList.contains("delete-btn")) {
    const isConfirmed = window.confirm("Bạn có chắc muốn xoá sản phẩm không?");
    
    if (isConfirmed) {
      deleteProduct(productID); // Call deleteProduct function if confirmed
    }
  } else if (e.target.classList.contains("edit-btn")) {
    editProduct(productID); // Handle product edit
  }
});

// Delete product
async function deleteProduct(productID) {
  try {
    const response = await fetch('/api/products/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: productID }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    console.log("Sản phẩm xoá thành công!");
    alert("Sản phẩm được xoá thành công");

    // Remove deleted product from local products array and re-render the list
    products = products.filter(product => product.id !== productID);
    renderProductList(products);

  } catch (error) {
    console.error('Error:', error);
    alert(`Failed to delete product: ${error.message}`);
  }
}

// Edit product
function editProduct(productID) {
  // Find the product from the products array
  const product = products.find(p => p.id == productID);
  
  if (!product) {
    console.error("Product not found");
    return;
  }

  // Helper function to clean up the values
  function cleanValue(value) {
    if (!value || value === 'No info' || typeof value === 'object') {
      return ''; // Return empty string for null, 'no info', or [object Object]
    }
    return value;
  }

  // Populate the form with the cleaned product details
  document.getElementById("productImage").value = product.image;
  document.getElementById("productName").value = product.name;
  document.getElementById("productRating").value = product.ratingstars;
  document.getElementById("productRatingCount").value = product.ratingcount;
  document.getElementById("productPrice").value = product.pricecents;
  document.getElementById("productKeywords").value = product.keywords;
  document.getElementById("productType").value = product.type;
  
  // document.getElementById("sizeChartLink").value = cleanValue(product.sizechartlink);
  // document.getElementById("instructionsLink").value = cleanValue(product.instructionslink);
  // document.getElementById("warrantyLink").value = cleanValue(product.warrantylink);

  // Change the form title and submit button text to indicate editing mode
  formTitle.innerHTML = "Edit Product";
  submitBtn.value = "Update Product";
  
  // Store the product ID in a hidden field or global variable to use when submitting
  editingProduct = productID;
}


// Add product form submission (for both create and update)
document.getElementById("addProductForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent page refresh on form submit

  // Collect form data
  const productData = {
    id: editingProduct, // Use the product ID stored when editing
    image: document.getElementById("productImage").value,
    name: document.getElementById("productName").value,
    ratingstars: parseFloat(document.getElementById("productRating").value),
    ratingcount: parseInt(document.getElementById("productRatingCount").value),
    pricecents: parseInt(document.getElementById("productPrice").value),
    keywords: document.getElementById("productKeywords").value,
    type: document.getElementById("productType").value,
    // sizechartlink: document.getElementById("sizeChartLink").value || null,
    // instructionslink: document.getElementById("instructionsLink").value || null,
    // warrantylink: document.getElementById("warrantyLink").value || null,
  };

  const method = editingProduct ? "PUT" : "POST"; // If editing, use PUT; otherwise, POST
  const url = editingProduct ? `/api/products/update` : `/api/products/create`;

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    // Directly update and display the product list after successful update or creation
    if (response.ok) {
      alert(`${editingProduct ? 'Product updated' : 'Product created'} successfully!`);
      document.getElementById("addProductForm").reset(); 
      fetchProducts(); // Reload the products list after updating or creating
      editingProduct = null; // Reset editingProduct
      formTitle.innerHTML = "Add Product"; // Reset form title
      submitBtn.value = "Add Product"; // Reset button text
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
