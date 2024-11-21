import { addToCart, calculateCartQuantity } from "../data/cart.js";
import formatCurrency from './utils/money.js';
import { userAccountButton } from "./amazon.js";
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

// user_id từ cookies
export function getUserIdFromCookies() {
  const cookies = document.cookie.split('; ');
  const userCookie = cookies.find(cookie => cookie.startsWith('user='));
  if (userCookie) {
    const userJson = userCookie.split('=')[1]; 
    const user = JSON.parse(userJson); 
    return user.id; // Return the user ID
  }
  return null; 
}

// Function to check if the order is older than 2 hours
function isOrderExpired(orderCreatedAt) {
  const orderDate = new Date(orderCreatedAt);
  const currentTime = new Date();
  //console.log("Order Date: ", orderDate, "Current Time: ", currentTime);  // Debugging
  orderDate.setTime(orderDate.getTime() - 25200000); 
  const timeDifference = currentTime - orderDate; // in milliseconds

  // 2 giờ = 2 * 60 * 60 * 1000 = 7200000 milli giây
  //tuy nhiên, ta chỉnh nó lên thành 7200000 + 252000000 giây (9 tiếng do vụ GMT+7)
  return timeDifference > 7200000; // Returns true if the order is older than 9 hours
}

// Function to check if the order can be edited (is_updated = false and within 2 hours)
function canEditOrder(orderDetails) {
  return !orderDetails.is_updated && !isOrderExpired(orderDetails.order_created_at);
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



// check status của order (Pending hoặc Delivered)
let currentTab = 'Pending';

// Fetch API này ra:
// http://localhost:8082/api/order-history?user_id=3&order_status=Pending
// Helper function to format the date manually
function formatDate(dateString) {
  const date = new Date(dateString);

  // Adjust for GMT+7
  date.setHours(date.getHours() - 7);

  // Get components
  const day = date.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Add suffix to day (e.g., 1st, 2nd, 3rd, 4th)
  const daySuffix = (day % 10 === 1 && day !== 11) ? "st" :
                    (day % 10 === 2 && day !== 12) ? "nd" :
                    (day % 10 === 3 && day !== 13) ? "rd" : "th";

  // Construct formatted date string
  return `${month} ${day}${daySuffix}, ${year}; ${hours}:${minutes}`;
}

// Function to load order history with the new Edit functionality
async function loadPage() {
  const userId = getUserIdFromCookies();
  if (!userId) {
    console.error('User ID not found in cookies');
    return;
  }

  try {
    const apiUrl = `http://localhost:8082/api/order-history?user_id=${userId}&order_status=${currentTab}`;
    const ordersResponse = await fetch(apiUrl);
    const ordersData = await ordersResponse.json();

    if (currentTab === 'Pending' && ordersData === null) {
      document.querySelector('.js-orders-grid').innerHTML = `
        <p>It seems like you don't have any pending orders at the moment.</p>
      `;
      return;
    } else if (currentTab === 'Delivered' && ordersData === null) {
      document.querySelector('.js-orders-grid').innerHTML = `
        <p>You haven't gotten any delivered orders yet.</p>
      `;
      return;
    }

    ordersData.sort((a, b) => {
      const dateA = new Date(a.order_created_at);
      const dateB = new Date(b.order_created_at);
      return dateB - dateA; // Sort by latest order first
    });

    let ordersHTML = '';
    for (const order of ordersData) {
      const orderDetailsResponse = await fetch(`http://localhost:8082/api/order-details?order_id=${order.order_id}`);
      const orderDetails = await orderDetailsResponse.json();

      if (!orderDetails || !orderDetails.order_id) {
        console.error('Invalid orderDetails or missing order_id');
        continue;
      }

      // Check if the order can be edited
      const isEditable = canEditOrder(orderDetails);
      const isEdited = orderDetails.is_updated;

      // Format thời gian giao hàng
      const orderTimeString = formatDate(orderDetails.order_created_at);

      ordersHTML += `
        <div class="order-container ${isEditable ? '' : 'locked'}">
          <div class="order-header">
            <div class="order-header-left-section">
              <div class="order-date">
                <div class="order-header-label">Order Placed At (GMT+7):</div>
                <div>${orderTimeString}</div>
              </div>
              <div class="order-total">
                <div class="order-header-label">Total:</div>
                <div class="js-order-total" data-order-id="${orderDetails.order_id}">
                  $${formatCurrency(orderDetails.order_cost_cents)}
                </div>
              </div>
            </div>

            <!-- Edit Button -->
            <button class="edit-order-button js-edit-order-button ${isEdited ? 'edited' : ''}" 
          data-order-id="${orderDetails.order_id}">
              ${isEdited ? 'Edited' : isEditable ? 'Edit' : 'Locked'}
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
    addEditOrderFunctionality();
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
        Arriving on: ${formatDate(dayjs(product.estimated_delivery_time))}
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


// Add event listeners for tab switching
document.querySelector('.js-pending-tab').addEventListener('click', () => {
  currentTab = 'Pending';
  loadPage();
});

document.querySelector('.js-delivered-tab').addEventListener('click', () => {
  currentTab = 'Delivered';
  loadPage();
});

// Load the page initially with the "Pending" tab
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

  // Add active class to selected tab and content
  selectedTab.classList.add('active');
  selectedContent.classList.add('active-orders');
}

// Add event listeners to the tabs
pendingTab.addEventListener('click', () => {
  switchTab(pendingTab, deliveredTab, pendingOrders, completedOrders);
  currentTab = 'Pending';
  loadPage();
});

deliveredTab.addEventListener('click', () => {
  switchTab(deliveredTab, pendingTab, completedOrders, pendingOrders);
  currentTab = 'Delivered';
  loadPage();
});



///code hiển thị pop up cho edit order:
// Hiển thị pop-up chỉnh sửa order
function showEditOrderPopup(orderDetails) {
  const popupContainer = document.createElement("div");
  popupContainer.className = "popup-container";

  // Generate product rows
  const productRows = orderDetails.products
    .map(product => `
      <div class="product-row">
        <div class="product-image">
          <img src="../${product.product_image}" alt="${product.product_name}">
        </div>
        <div class="product-info">
          <div class="product-name">${product.product_name}</div>
          <label>
            Quantity:
            <input type="number" class="product-quantity-input" 
                   data-product-id="${product.product_id}" 
                   value="${product.quantity}" min="1">
          </label>
          <label>
            Delivery Option ID:
            <input type="number" class="delivery-option-input" 
                   data-product-id="${product.product_id}" 
                   value="${product.delivery_option_id}">
          </label>
        </div>
      </div>
    `)
    .join("");

  // Create popup content
  popupContainer.innerHTML = `
    <div class="popup-content">
      <h2>Edit Order</h2>
      <div class="products-list">
        ${productRows}
      </div>
      <div class="popup-actions">
        <button class="add-product-button">Add Other Product</button>
        <button class="update-order-button">Update Order</button>
        <button class="close-popup-button">Cancel</button>
      </div>
    </div>
  `;

  // Append popup to body
  document.body.appendChild(popupContainer);

  // Add event listener to close button
  popupContainer.querySelector(".close-popup-button").addEventListener("click", () => {
    document.body.removeChild(popupContainer);
  });

  // Add event listener to update order button
  popupContainer.querySelector(".update-order-button").addEventListener("click", async () => {
    const updatedProducts = Array.from(
      popupContainer.querySelectorAll(".product-row")
    ).map(row => {
      const productId = row.querySelector(".product-quantity-input").dataset.productId;
      const quantity = parseInt(row.querySelector(".product-quantity-input").value, 10);
      // Ensure delivery_option_id is treated as a string
      const deliveryOptionId = row.querySelector(".delivery-option-input").value.toString();
      return { product_id: productId, quantity, delivery_option_id: deliveryOptionId };
    });

    const updatedOrder = {
      order_id: orderDetails.order_id,
      user_id: orderDetails.user_id,
      products: updatedProducts,
    };

    // Make PUT request to update order
    try {
      const response = await fetch("http://localhost:8082/api/order-details/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedOrder),
      });
      const result = await response.json();
      console.log("Order updated:", result);
      document.body.removeChild(popupContainer); // Close popup
    } catch (error) {
      console.error("Error updating order:", error);
    }
  });
}



// Đóng pop-up
function closeEditOrderPopup() {
  const popup = document.querySelector('.edit-order-popup');
  if (popup) popup.remove();
}

// Gửi API PUT để cập nhật order
async function updateOrder(orderId) {
  const productRows = document.querySelectorAll('.edit-product-row');
  const updatedProducts = Array.from(productRows).map(row => {
    return {
      product_id: row.dataset.productId,
      quantity: parseInt(row.querySelector('.product-quantity-input').value, 10),
      delivery_option_id: row.querySelector('.delivery-option-select').value,
    };
  });

  const updatedOrder = {
    order_id: orderId,
    products: updatedProducts,
  };

  try {
    const response = await fetch(`http://localhost:8082/api/order-details/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOrder),
    });

    if (response.ok) {
      alert('Order updated successfully!');
      closeEditOrderPopup();
      loadPage(); // Tải lại danh sách order
    } else {
      alert('Failed to update order.');
    }
  } catch (error) {
    console.error('Error updating order:', error);
  }
}

// Thêm event listener cho nút Edit
function addEditOrderFunctionality() {
  document.querySelectorAll('.js-edit-order-button').forEach(button => {
    button.addEventListener('click', async () => {
      const orderId = button.dataset.orderId;

      try {
        const response = await fetch(`http://localhost:8082/api/order-details?order_id=${orderId}`);
        const orderDetails = await response.json();

        if (orderDetails) {
          showEditOrderPopup(orderDetails);
        } else {
          alert('Failed to fetch order details.');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    });
  });
}
