import { cart, addToCart, calculateCartQuantity } from "../data/cart.js";

import {
  products, 
  loadProducts, 
  loadProductsFetch,
  Product,
  Clothing,
  //Appliance,
} from "../data/products.js";


document.addEventListener("DOMContentLoaded", () => {
  loadProducts(renderProductsGrid);
});

function renderProductsGrid(filteredProducts) {
  let productsHTML = '';

  const productsToRender = filteredProducts || products;

  productsToRender.forEach((product) => {
    // Thêm lớp inactive để vô hiệu hoá sản phẩm, nếu nó là false.
    const isInactive = !product.is_active; 
    const productClass = isInactive ? 'inactive' : ''; 

    productsHTML += `
      <div class="product-container ${productClass}">
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

    fetch(`http://localhost:8082/api/products`)
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
          } 
          // else if (productDetails.type === 'appliance') {
          //   return new Appliance(productDetails);
          // } 
          else {
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

    fetch(`http://localhost:8082/api/products`)
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
          } 
          // else if (productDetails.type === 'appliance') {
          //   return new Appliance(productDetails);
          // } 
          else {
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


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}


//sign-in scripts.
//for login/ logout button toggling

export function userAccountButton () {
  // Get the 'user' cookie
  const userCookie = getCookie('user');
  const user = userCookie ? JSON.parse(userCookie) : null;

  const welcomeMsg = document.getElementById('welcome-msg');
  const authLink = document.getElementById('auth-link');

  const accountDropdown = document.getElementById('accountDropdown');
  const darkOverlay = document.getElementById('darkOverlay');
  const dropdownContent = accountDropdown.querySelector('.dropdown-content');
  const signInLink = document.querySelector('a[href="./sign-in.html"]'); //to remove redirect to login page if user already logged in

  if (user) {
    if (user.role === 'admin') {
      window.location.href = 'http://localhost:8082/admin';
    }

    // User is logged in
    welcomeMsg.textContent = `Hello, ${user.name}`;
    authLink.textContent = 'Sign Out'; // Change to 'Sign Out'
    signInLink.setAttribute('href', '#');
    
    // Handle Sign Out
    authLink.addEventListener('click', function () {
      //set cookie date in the past to effectively delete cookie
      document.cookie = "user=; expires=Fri, 18 Oct 2024 00:00:00 UTC; path=/;";

      // Delete token cookie by setting it to a past date
      document.cookie = "token=; expires=Fri, 18 Oct 2024 00:00:00 UTC; path=/;";
      
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

    signInLink.setAttribute('href', './sign-in.html');

    // Handle Sign In
    authLink.addEventListener('click', function () {
      window.location.href = './sign-in.html'; // Redirect to the login page
    });
  }
}

window.addEventListener('DOMContentLoaded', userAccountButton);






