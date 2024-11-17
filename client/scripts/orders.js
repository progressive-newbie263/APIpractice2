//LƯU Ý:
// THẰNG Pending và Delivered phải viết HOA CHỮ CÁI ĐẦU
// SAI NGU CMN 1 tiếng vì quên!

import { addToCart, calculateCartQuantity } from "../data/cart.js";
import formatCurrency from './utils/money.js';
import { userAccountButton } from "./amazon.js";
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

// Helper function to get user_id from cookies
export function getUserIdFromCookies() {
  const cookies = document.cookie.split('; ');
  const userCookie = cookies.find(cookie => cookie.startsWith('user='));
  
  if (userCookie) {
    const userJson = userCookie.split('=')[1]; // Get the JSON string
    const user = JSON.parse(userJson); // Parse it into an object
    return user.id; // Return the user ID
  }

  return null; // Return null if the cookie is not found
}

// State variable to track current tab (pending or delivered)
let currentTab = 'Pending';


//fetch API này ra:
//http://localhost:8082/api/order-history?user_id=3&order_status=Pending (Pending viết hoa)
async function loadPage() {
  const userId = getUserIdFromCookies();
  if (!userId) {
    console.error('User ID not found in cookies');
    return;
  }

  try {
    // Fetch data based on the current tab
    const apiUrl = `http://localhost:8082/api/order-history?user_id=${userId}&order_status=${currentTab}`;
    const ordersResponse = await fetch(apiUrl);
    const ordersData = await ordersResponse.json();

    // Sort orders by creation time (newest first)
    ordersData.sort((a, b) => {
      const dateA = dayjs(a.order_created_at);
      const dateB = dayjs(b.order_created_at);
      return dateB.isBefore(dateA) ? -1 : 1;
    });

    let ordersHTML = '';
    for (const order of ordersData) {
      const orderDetailsResponse = await fetch(`http://localhost:8082/api/order-details?order_id=${order.order_id}`);
      const orderDetails = await orderDetailsResponse.json();

      if (!orderDetails || !orderDetails.order_id) {
        console.error('Invalid orderDetails or missing order_id');
        continue;
      }

      const orderTimeString = dayjs(orderDetails.order_created_at).subtract(7, 'hour').format('MMMM D');

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
                <div class="js-order-total" data-order-id="${orderDetails.order_id}">
                  $${formatCurrency(orderDetails.order_cost_cents)}
                </div>
              </div>
            </div>

            <button class="delete-order-button js-delete-order-button" data-order-id="${orderDetails.order_id}">
              Delete
            </button>

            <div class="order-header-right-section">
              <div class="order-header-label">Order ID:</div>
              <div>${orderDetails.order_id}</div>
            </div>
          </div>

          <div class="order-details-grid">
            ${productsListHTML(orderDetails.products, orderDetails)}
          </div>
        </div>
      `;
    }

    document.querySelector('.js-orders-grid').innerHTML = ordersHTML;

    updateCartQuantity();
    addBuyAgainFunctionality();
  } catch (error) {
    console.error('Error fetching order data:', error);
  }
}

// Function to generate HTML for products
function productsListHTML(products, orderDetails) {
  return products.map(product => `
    <div class="product-image-container">
      <img src="../${product.product_image}">
    </div>
    <div class="product-details">
      <div class="product-name">
        ${product.product_name}
      </div>
      <div class="product-delivery-date">
        Arriving on: ${dayjs(product.estimated_delivery_time).format('MMMM D')}
      </div>
      <div class="product-quantity js-product-quantity" data-product-id="${product.product_id}">
        Quantity: ${product.quantity}
      </div>
      <button class="buy-again-button button-primary js-buy-again-button" data-product-id="${product.product_id}">
        <img class="buy-again-icon" src="../images/icons/buy-again.png">
        <span class="buy-again-message">Buy it again</span>
      </button>
    </div>
    <div class="product-actions">
      <a href="tracking.html?orderId=${orderDetails.order_id}&productId=${product.product_id}">
        <button class="track-package-button button-secondary">Track package</button>
      </a>
    </div>
  `).join('');
}

// Function to update cart quantity in the header
function updateCartQuantity() {
  const cartQuantity = calculateCartQuantity();
  document.querySelector('.order-cart-quantity').innerHTML = cartQuantity;
}

// Add functionality to "Buy Again" buttons
function addBuyAgainFunctionality() {
  document.querySelectorAll('.js-buy-again-button').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      addToCart(productId);

      button.innerHTML = 'Added';
      setTimeout(() => {
        button.innerHTML = `
          <img class="buy-again-icon" src="../images/icons/buy-again.png">
          <span class="buy-again-message">Buy it again</span>
        `;
      }, 1000);

      updateCartQuantity();
    });
  });
}

// Add event listeners for tab switching
document.querySelector('.js-pending-tab').addEventListener('click', () => {
  currentTab = 'Pending';
  loadPage();
});

document.querySelector('.js-delivered-tab').addEventListener('click', () => {
  currentTab = 'Delivered';
  loadPage();
});

// Load the page initially with the "pending" tab
loadPage();
window.addEventListener('DOMContentLoaded', userAccountButton);



//code toggle giữa 2 button/tab:
// Get the tabs and content containers
const pendingTab = document.querySelector('.js-pending-tab');
const deliveredTab = document.querySelector('.js-delivered-tab');
const pendingOrders = document.getElementById('pending-orders');
const completedOrders = document.getElementById('completed-orders');

// Function to switch tabs and content
function switchTab(selectedTab, deselectedTab, selectedContent, deselectedContent) {
  // Remove active class from all tabs and content
  deselectedTab.classList.remove('active');
  deselectedContent.classList.remove('active-orders');

  // Add active class to the selected tab and content
  selectedTab.classList.add('active');
  selectedContent.classList.add('active-orders');
}

// Add event listeners to the tabs
pendingTab.addEventListener('click', () => {
  switchTab(pendingTab, deliveredTab, pendingOrders, completedOrders);
});

deliveredTab.addEventListener('click', () => {
  switchTab(deliveredTab, pendingTab, completedOrders, pendingOrders);
});
