import { addToCart, calculateCartQuantity } from "../data/cart.js";
import formatCurrency from './utils/money.js';
import { userAccountButton } from "./amazon.js";
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
// import utc from 'https://unpkg.com/dayjs@1.11.10/esm/plugin/utc.js';
// dayjs.extend(utc);

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


// Fetch data from API and load the orders page
async function loadPage() {
  const userId = getUserIdFromCookies();
  if (!userId) {
    console.error('User ID not found in cookies');
    return;
  }

  try {
    const ordersResponse = await fetch(`http://localhost:8082/api/order-history?user_id=${userId}`);
    const ordersData = await ordersResponse.json();

    // Sắp xếp đơn hàng theo thời gian giảm dần (đơn hàng mới nhất lên trên)
    ordersData.sort((a, b) => {
      const dateA = dayjs(a.order_created_at);
      const dateB = dayjs(b.order_created_at);
      return dateB.isBefore(dateA) ? -1 : 1; // Sắp xếp giảm dần
    });

    let ordersHTML = '';
    for (const order of ordersData) {
      const orderDetailsResponse = await fetch(`http://localhost:8082/api/order-details?order_id=${order.order_id}`);
      const orderDetails = await orderDetailsResponse.json();

      // Ensure orderDetails is valid
      if (!orderDetails || !orderDetails.order_id) {
        console.error('Invalid orderDetails or missing order_id');
        continue; // Skip invalid orders
      }

      //trừ đi 7 tiếng. (GMT+7. thời gian gốc là GMT)
      //const orderTimeString = dayjs(orderDetails.order_created_at).format('MMMM D');
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
            ${productsListHTML(orderDetails.products, orderDetails)}  <!-- Pass orderDetails here -->
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


// Function to generate HTML for each product in an order
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

      <button class="buy-again-button button-primary js-buy-again-button"
        data-product-id="${product.product_id}">
        <img class="buy-again-icon" src="../images/icons/buy-again.png">
        <span class="buy-again-message">Buy it again</span>
      </button>
    </div>

    <div class="product-actions">
      <a href="tracking.html?orderId=${orderDetails.order_id}&productId=${product.product_id}">
        <button class="track-package-button button-secondary">
          Track package
        </button>
      </a>
    </div>
  `).join('');
}


// Function to update cart quantity in header
function updateCartQuantity() {
  const cartQuantity = calculateCartQuantity();
  document.querySelector('.order-cart-quantity').innerHTML = cartQuantity;
}

// Add functionality to "Buy Again" buttons
function addBuyAgainFunctionality() {
  document.querySelectorAll('.js-buy-again-button').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      addToCart(productId);

      // Update UI
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

// Call loadPage to load the orders on page load
loadPage();


window.addEventListener('DOMContentLoaded', userAccountButton);