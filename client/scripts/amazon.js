import { cart, addToCart, calculateCartQuantity } from "../data/cart.js";

import {
  products, 
  loadProducts, 
  loadProductsFetch,  
} from "../data/products.js";

import { formatCurrency } from './utils/money.js';

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
        );
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
      if (e.key === 'Enter') {
        const search = document.querySelector('.js-search-bar').value;
        window.location.href = `amazon.html?search=${search}`;
      }
    });
}


