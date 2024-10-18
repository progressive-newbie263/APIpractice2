import { cart, addToCart, calculateCartQuantity } from "../data/cart.js";

import {
  products, 
  loadProducts, 
  loadProductsFetch,
  Product,
  Clothing,
  Appliance,
} from "../data/products.js";

//unused fetch load.
//loadProductsFetch(renderProductsGrid);
loadProducts(renderProductsGrid);

function renderProductsGrid(filteredProducts) {
  let productsHTML = '';

  const productsToRender = filteredProducts || products;

  productsToRender.forEach((product) => {
    productsHTML += `
      <div class="product-container">
      <div class="product-image-container">
        <img class="product-image" src="../${product.image}">
      </div>

      <div class="product-name limit-text-to-2-lines">
        ${product.name}
      </div>

      <div class="product-rating-container">
        <img class="product-rating-stars" src="../${product.getStarsUrl()}">
        
        <div class="product-rating-count link-primary">
          ${product.ratingcount}
        </div>
      </div>

      <div class="product-price">
        ${product.getPrice()}
      </div>

      <div class="product-quantity-container">
        <select class="js-quantity-selector-${product.id}">
          <option selected value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>

      ${product.extraInfoHTML()}

      <div class="product-spacer"></div>

      <div class="added-to-cart js-added-to-cart-${product.id}">
        <img src="../images/icons/checkmark.png">
        Added
      </div>

      <button class="add-to-cart-button button-primary js-add-to-cart"
        data-product-id = "${product.id}"
      >
        Add to Cart
      </button>
    </div>
    `;
  });

  document.querySelector('.js-products-grid').innerHTML = productsHTML;

  function updateCartQuantity() {
    const cartQuantity = calculateCartQuantity();
    document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
  }  
  updateCartQuantity();

  let addedMessageTimeouts = {};
  function showingMessage(productId) {
    const addedMessage = document.querySelector(`.js-added-to-cart-${productId}`);
    addedMessage.classList.add('unhidden');
    
    const previousTimeoutId = addedMessageTimeouts[productId];
    if (previousTimeoutId) {
      clearTimeout(previousTimeoutId);
    }

    const timeoutId = setTimeout(() => {
      addedMessage.classList.remove('unhidden');
    }, 2000);
    // Save the timeoutId for this product so we can stop it later if we need to.
    addedMessageTimeouts[productId] = timeoutId;
  }


  //make sure when using dataset, change from kebab case (product-name)
  //into camel case (productName) (and so on...)
  document.querySelectorAll('.js-add-to-cart')
    .forEach((button) => {
      button.addEventListener('click', () => {
        console.log('Added products');
        const productId = button.dataset.productId;
        //const {productId} = button.dataset;
        showingMessage(productId);

        addToCart(productId);

        updateCartQuantity();
      });
    });

  searchForProductClick();
  searchForProductEnter();
}


function searchForProductClick() {
  document.querySelector('.js-search-button').addEventListener('click', () => {
    const search = document.querySelector('.js-search-bar').value.toLowerCase();

    fetch(`http://localhost:8082/products`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(products => {
        const filteredProducts = products.filter(product =>
          product.keywords.toLowerCase().includes(search) || 
          product.name.toLowerCase().includes(search)
        )
        .map(productDetails => {
          // Ensure the product is wrapped in the appropriate class
          if (productDetails.type === 'clothing') {
            return new Clothing(productDetails);
          } else if (productDetails.type === 'appliance') {
            return new Appliance(productDetails);
          } else {
            return new Product(productDetails);
          }
        });
        renderProductsGrid(filteredProducts); // Render filtered products
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  });
}

function searchForProductEnter() {
  document.querySelector('.js-search-bar') // Attach the listener to the search bar, must be done.
    .addEventListener('keydown', (e) => {
      const search = document.querySelector('.js-search-bar').value.toLowerCase();

    fetch(`http://localhost:8082/products`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(products => {
        const filteredProducts = products.filter(product =>
          product.keywords.toLowerCase().includes(search) || 
          product.name.toLowerCase().includes(search)
        )
        .map(productDetails => {
          // Ensure the product is wrapped in the appropriate class
          if (productDetails.type === 'clothing') {
            return new Clothing(productDetails);
          } else if (productDetails.type === 'appliance') {
            return new Appliance(productDetails);
          } else {
            return new Product(productDetails);
          }
        });
        renderProductsGrid(filteredProducts); // Render filtered products
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
    });
}



//sign-in scripts.
//for login/ logout button toggling
window.addEventListener('DOMContentLoaded', function () {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const welcomeMsg = document.getElementById('welcome-msg');
  const authLink = document.getElementById('auth-link');

  const accountDropdown = document.getElementById('accountDropdown');
  const darkOverlay = document.getElementById('darkOverlay');
  const dropdownContent = accountDropdown.querySelector('.dropdown-content');

  /* 
  //function debounce(func, wait) {
  //   let timeout;
  //   return function executedFunction(...args) {
  //     const later = () => {
  //       clearTimeout(timeout);
  //       func(...args);
  //     };
  //     clearTimeout(timeout);
  //     timeout = setTimeout(later, wait);
  //   };
  // }

  // // Debounced event handlers
  // const debouncedMouseEnter = debounce(function() {
  //   //console.log("changed");
  //   darkOverlay.classList.add('active');
  //   dropdownContent.classList.add('active');
  // }, 100);

  // const debouncedMouseLeave = debounce(function() {
  //   darkOverlay.classList.remove('active');
  //   //dropdownContent.classList.remove('active');
  // }, 100);

  // const debouncedMouseEnterDropdown = debounce(function() {
  //   darkOverlay.classList.add('active');
  //   dropdownContent.classList.add('active');
  // }, 100);

  // const debouncedMouseLeaveDropdown = debounce(function() {
  //   darkOverlay.classList.remove('active');
  //   dropdownContent.classList.remove('active');
  // }, 100);

  // accountDropdown.addEventListener('mouseenter', debouncedMouseEnter);
  // accountDropdown.addEventListener('mouseleave', debouncedMouseLeave);
  // dropdownContent.addEventListener('mouseenter', debouncedMouseEnterDropdown);
  // dropdownContent.addEventListener('mouseleave', debouncedMouseLeaveDropdown);
  */

  if (user) {
    if (user.role === 'admin') {
      window.location.href = 'http://localhost:8082/admin';
    }

    // User is logged in
    welcomeMsg.textContent = `Hello, ${user.name}`;
    authLink.textContent = 'Sign Out'; // Change to 'Sign Out'
    
    // Handle Sign Out
    authLink.addEventListener('click', function () {
      localStorage.removeItem('user');
      // Optionally, you can call the logout API as well
      fetch('http://localhost:8082/api/logout', {
        method: 'POST',
        credentials: 'include',
      })
        .then((response) => {
          if (response.ok) {
            location.reload(); // Reload the page after logout
          } else {
            alert('Logout failed');
          }
        });
    });
  } else {
    // User is not logged in
    welcomeMsg.textContent = `Hello, Sign in`;
    authLink.textContent = 'Sign In'; // Change to 'Sign In'

    // Handle Sign In
    authLink.addEventListener('click', function () {
      window.location.href = './sign-in.html'; // Redirect to the login page
    });
  }
});






