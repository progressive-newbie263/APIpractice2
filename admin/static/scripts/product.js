import { renderPaginationControls } from "./utils/pageNumbering.js";


// Get DOM elements
const productList = document.getElementById("productTable");
const productForm = document.getElementById("addProductForm");
const formTitle = document.querySelector(".form-section h2");
const submitBtn = productForm.querySelector("input[type='submit']");

let products = []; // Store fetched products
let editingProduct = null; // Track the product being edited
let currentPage = 1; //track the current page
const productsPerPage = 5; //5 prods per page


// Fetch and display products from products API.
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

  //adding in setting pages code:
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToDisplay = productArray.slice(startIndex, endIndex); //search query updated

  productsToDisplay.forEach((product) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${product.id}</td>

      <td>
        <img class="zoom-out-image" src="/${product.image}" alt="${product.name}" width="50">
      </td>
      
      <td>${product.name}</td>
      
      <td>${product.ratingstars}⭐</td>

      <td>${product.ratingcount} reviews</td>
      
      <td>
        $${(product.pricecents / 100).toFixed(2)}
      </td>

      <td>${product.keywords}</td>

      <td>${product.type}</td>

      <td>${product.sizechartlink.String ? product.sizechartlink.String : 'No info'}</td>

      <td>${product.instructionslink.String ? product.instructionslink.String : 'No info'}</td>

      <td>${product.warrantylink.String ? product.warrantylink.String : 'No info'}</td>

      <td>
        <button class="edit-btn" onclick="editProduct('${product.id}')">
          Edit
        </button>
        
        <button class="delete-btn" onclick="deleteProduct('${product.id}')">
          Delete
        </button>
      </td>
    `;
    productList.appendChild(row);
  });

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

// Render pagination buttons
// function renderPaginationControls(productArray) {
//   const paginationContainer = document.getElementById("paginationControls");
//   paginationContainer.innerHTML = ""; // Clear the existing buttons

//   const totalPages = Math.ceil(products.length / productsPerPage);

//   if(totalPages > 0) {
//     for (let i = 1; i <= totalPages; i++) {
//       const button = document.createElement("button");
//       button.textContent = i;
//       button.className = i === currentPage ? "active" : "";

//       button.addEventListener("click", () => {
//         currentPage = i;
//         renderProductList(productArray);
//       });
//       paginationContainer.appendChild(button);
//     }
//   }
// }


//searching/filtering out products:
const searchProdInput = document.getElementById("searchProductInput");
searchProdInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const searchQuery = e.target.value;
    filterProducts(searchQuery); // Fetch products based on search query
  }
});

//adding event listeners for clicking on search button or entering enter button:
const searchProdButton = document.getElementById("searchProductButton");
searchProdButton.addEventListener("click", () => {
  const searchQuery = searchProdInput.value;
  filterProducts(searchQuery); // Fetch products based on search query
});


window.addEventListener("DOMContentLoaded", fetchProducts);

/*
// Add/Edit product functionality
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productData = {
    name: document.getElementById("productName").value,
    image: document.getElementById("productImage").value,
    ratingstars: parseFloat(document.getElementById("productRating").value),
    ratingcount: parseInt(document.getElementById("productRatingCount").value),
    pricecents: parseInt(document.getElementById("productPrice").value),
    type: document.getElementById("productType").value,
    keywords: document.getElementById("productKeywords").value,
    sizechartlink: document.getElementById("sizeChartLink").value,
    instructionslink: document.getElementById("instructionsLink").value,
    warrantylink: document.getElementById("warrantyLink").value,
  };

  try {
    if (editingProduct) {
      // Update product
      await fetch(`http://localhost:8082/api/products/${editingProduct.id}`, {
        method: "PUT",
        
        headers: { 
          "Content-Type": "application/json" 
        },
        
        body: JSON.stringify(productData),
      });
      editingProduct = null;
    } else {
      // Add new product
      await fetch(`http://localhost:8082/api/products`, {
        method: "POST",
        
        headers: { 
          "Content-Type": "application/json" 
        },
        
        body: JSON.stringify(productData),
      });
    }

    productForm.reset(); // Clear form
    formTitle.textContent = "Add New Product"; // Reset form title
    submitBtn.value = "Add Product"; // Reset button text
    fetchProducts(); // Refresh product list

  } catch (error) {
    console.error("Failed to submit product data:", error);
  }
});


// Edit product
function editProduct(id) {
  const product = products.find((p) => p.id === id);

  document.getElementById("productName").value = product.name;
  document.getElementById("productImage").value = product.image;
  document.getElementById("productRating").value = product.ratingstars;
  document.getElementById("productRatingCount").value = product.ratingcount;
  document.getElementById("productPrice").value = product.pricecents;
  document.getElementById("productType").value = product.type;
  document.getElementById("productKeywords").value = product.keywords;
  document.getElementById("sizeChartLink").value = product.sizechartlink.String ? product.sizechartlink.String : 'No information available';
  document.getElementById("instructionsLink").value = product.instructionslink.String ? product.instructionslink.String : 'No information available';
  document.getElementById("warrantyLink").value = product.warrantylink.String ? product.warrantylink.String : 'No information available';

  editingProduct = product;
  formTitle.textContent = `Edit Product (ID: ${product.id})`;
  submitBtn.value = "Update Product";
}

// Delete product
async function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await fetch(`http://localhost:8082/api/products/${id}`, {
        method: "DELETE",
      });
      fetchProducts(); // Refresh product list after deletion
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  }
}

// Initialize by fetching products when the page loads
*/