import { addOrder, orders } from "../data/order.js";
import {getProduct, loadProductsFetch} from '../data/products.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import formatCurrency from './utils/money.js';
import { cart, addToCart, calculateCartQuantity } from "../data/cart.js";


// Function to save orders to local storage
function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

// Function to load orders from local storage
/*
function loadOrders() {
  const storedOrders = localStorage.getItem('orders');
  if (storedOrders) {
    return JSON.parse(storedOrders);
  }
  return orders; // Fall back to default orders if not found in storage
}
*/

function deleteOrder() {
  document.querySelectorAll('.js-delete-order-button')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const orderId = button.dataset.orderId;

        // Remove the order from the orders array
        const orderNumber = orders.filter(order => order.id !== orderId);

        if (orderNumber !== -1) {
          orders.splice(orderNumber, 1);
        }
        // Save the updated orders to local storage
        saveOrders();

        //remove order from DOM model
        button.closest('.order-container').remove();
      });
    });
}



//starting of the function loading page:
async function loadPage() {
  await loadProductsFetch();

  let ordersHTML = '';

  if (!orders || !Array.isArray(orders)) {
    orders = []; // Ensure orders is an array
  }

  orders.forEach((order) => {
    const orderTimeString = dayjs(order.orderTime).format('MMMM D');

    ordersHTML += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${orderTimeString}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div class="js-order-total" data-order-id="${order.id}">
                $${formatCurrency(order.totalCostCents)}
              </div>
            </div>
          </div>

          <button class="delete-order-button js-delete-order-button"
          data-order-id="${order.id}">
            Delete
          </button>

          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          </div>
        </div>

        <div class="order-details-grid">
          ${productsListHTML(order)}
        </div>
      </div>
    `;
  });

  function productsListHTML(order) {
    if (!order.products || !Array.isArray(order.products)) {
      return ''; // Return an empty string if order.products is undefined or not an array
    }
  
    let productsListHTML = '';
  
    order.products.forEach((productDetails) => {
      const product = getProduct(productDetails.productId);
  
      if (product) { // Ensure product is defined
        productsListHTML += `
          <div class="product-image-container">
            <img src="${product.image}">
          </div>
          <div class="product-details">
            <div class="product-name">
              ${product.name}
            </div>
            
            <div class="product-delivery-date">
              Arriving on: ${dayjs(productDetails.estimatedDeliveryTime).format('MMMM D')}
            </div>
            
            <div class="product-quantity js-product-quantity" data-product-id="${product.id}">
              Quantity: ${productDetails.quantity}
            </div>
  
            <button class="buy-again-button button-primary js-buy-again-button"
            data-product-id="${product.id}">
              <img class="buy-again-icon" src="images/icons/buy-again.png">
              <span class="buy-again-message">Buy it again</span>
            </button>
          </div>
  
          <div class="product-actions">
            <a href="tracking.html?orderId=${order.id}&productId=${product.id}">
              <button class="track-package-button button-secondary">
                Track package
              </button>
            </a>
          </div>
        `;
      }
    });
  
    return productsListHTML;
  }

  document.querySelector('.js-orders-grid').innerHTML = ordersHTML;

  function updateCartQuantity() {
    const cartQuantity = calculateCartQuantity();

    document.querySelector('.order-cart-quantity').innerHTML = cartQuantity;
  }
  
  updateCartQuantity();

  document.querySelectorAll('.js-buy-again-button').forEach((button) => {
    button.addEventListener('click', (order) => {
      addToCart(button.dataset.productId);
      
      const quantityElement = document.querySelector(`.js-product-quantity[data-product-id="${button.dataset.productId}"]`);

      // Update the quantity and total cost in the order
      const product = orders.flatMap(order => order.products).find(product => product.productId == button.dataset.productId);
      if (product) {
        // Update the quantity.
        product.quantity++;
        quantityElement.innerHTML = `Quantity: ${product.quantity}`;

        // Update the total cost
        const productDetails = getProduct(button.dataset.productId);
        const order = orders.find(order => order.products.includes(product));
        order.totalCostCents += productDetails.priceCents * 1.1; // 1.1 because 10% tax

        // Update the total cost in the DOM
        const totalElement = document.querySelector(`.js-order-total[data-order-id="${order.id}"]`);
        totalElement.innerHTML = `$${formatCurrency(order.totalCostCents)}`;

        // Save the order (changing the numbers directly in the order).
        saveOrders();
      }

      button.innerHTML = 'Added';
      setTimeout(() => {
        button.innerHTML = `
          <img class="buy-again-icon" src="images/icons/buy-again.png">
          <span class="buy-again-message">Buy it again</span>
        `;
      }, 1000);

      updateCartQuantity();
    });
  });
  
  deleteOrder();
}

loadPage();
