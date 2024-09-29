import { cart, addToCart, calculateCartQuantity } from "../data/cart.js";
import { products, loadProducts, loadProductsFetch } from "../data/products.js";
import { formatCurrency } from './utils/money.js';

//loadProducts(renderProductsGrid);
loadProducts(renderProductsGrid);

function renderProductsGrid() {
  let productsHTML = '';

  const url = new URL(window.location.href);
  const search = url.searchParams.get('search');

  let filteredProducts = products;

  // If a search exists in the URL parameters, filter the products that match the search.
  if (search) {
    filteredProducts = products.filter((product) => {
      let matchingKeyword = false;

      product.keywords.forEach((keyword) => {
        if(keyword.toLowerCase().includes(search.toLowerCase())) {
          matchingKeyword = true;
        }
      }); 

      return matchingKeyword || product.name.toLowerCase().includes(search.toLowerCase());
    });
  }

  filteredProducts.forEach((product) => {
    productsHTML += `
      <div class="product-container">
      <div class="product-image-container">
        <img class="product-image"
          src="${product.image}">
      </div>

      <div class="product-name limit-text-to-2-lines">
        ${product.name}
      </div>

      <div class="product-rating-container">
        <img class="product-rating-stars"
          src="${product.getStarsUrl()}">
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
        <img src="images/icons/checkmark.png">
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

  document.querySelector('.js-products-grid')
    .innerHTML = productsHTML;

  function updateCartQuantity() {
    const cartQuantity = calculateCartQuantity();

    document.querySelector('.js-cart-quantity')
      .innerHTML = cartQuantity;
  }
  //14d
  updateCartQuantity();


  let addedMessageTimeouts = {};
  //13ijklm
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


//18p function/ search util
function searchForProductClick() {
  //fix later: //amazon.html?search=_${}
  document.querySelector('.js-search-button')
    .addEventListener('click', () => {
      const search = document.querySelector('.js-search-bar').value;
      window.location.href = `amazon.html?search=${search}`;
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


