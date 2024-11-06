import { addToCart, calculateCartQuantity } from "../data/cart.js";
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import formatCurrency from './utils/money.js';

// Function to save orders to local storage
function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
  console.log(orders);
}

// Function to delete an order
function deleteOrder() {
  document.querySelectorAll('.js-delete-order-button').forEach((button) => {
    button.addEventListener('click', () => {
      const orderId = button.dataset.orderId;
      
      // Remove the order from local storage
      let orders = JSON.parse(localStorage.getItem('orders')) || [];
      orders = orders.filter(order => order.order_id !== orderId);
      saveOrders(orders);

      // Remove the order from the DOM
      button.closest('.order-container').remove();
    });
  });
}

// Fetch data from API and load the orders page
async function loadPage() {
  //hằng tạm thời cho orderId.
  //note: tracking tạm thời vô hiệu hoá,
  const orderId = 'mLUYrHnNomBKg2HMjVmW'; // Replace this with dynamic retrieval if available
  
  try {
    const response = await fetch(`http://localhost:8082/api/order-details?order_id=${orderId}`); // Replace 'YOUR_API_ENDPOINT' with the actual API URL
    const orderData = await response.json();

    // Ensure orders is an array
    const orders = Array.isArray(orderData) ? orderData : [orderData];
    saveOrders(orders);

    // Generate HTML for orders
    let ordersHTML = '';
    orders.forEach((order) => {
      const orderTimeString = dayjs(order.order_created_at).format('MMMM D');
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
                <div class="js-order-total" data-order-id="${order.order_id}">
                  $${formatCurrency(order.order_cost_cents)}
                </div>
              </div>
            </div>

            <button class="delete-order-button js-delete-order-button"
              data-order-id="${order.order_id}">
              Delete
            </button>

            <div class="order-header-right-section">
              <div class="order-header-label">Order ID:</div>
              <div>${order.order_id}</div>
            </div>
          </div>

          <div class="order-details-grid">
            ${productsListHTML(order.products)}
          </div>
        </div>
      `;
    });

    document.querySelector('.js-orders-grid').innerHTML = ordersHTML;

    // Update cart quantity in header
    function updateCartQuantity() {
      const cartQuantity = calculateCartQuantity();
      document.querySelector('.order-cart-quantity').innerHTML = cartQuantity;
    }
    updateCartQuantity();

    // Add "Buy Again" button functionality
    document.querySelectorAll('.js-buy-again-button').forEach((button) => {
      button.addEventListener('click', () => {
        const productId = button.dataset.productId;
        addToCart(productId);

        // Update product quantity and order cost
        const order = orders.find(order => 
          order.products.some(product => product.product_id === productId)
        );
        const product = order.products.find(product => product.product_id === productId);
        
        product.quantity++;
        
        const productDetails = order.products.find(p => p.product_id === productId);
        order.order_cost_cents += productDetails.price_cents * 1.1; // Assuming price includes tax

        // Update the quantity and total cost in the DOM
        document.querySelector(`.js-product-quantity[data-product-id="${productId}"]`).innerHTML = `Quantity: ${product.quantity}`;
        document.querySelector(`.js-order-total[data-order-id="${order.order_id}"]`).innerHTML = `$${formatCurrency(order.order_cost_cents)}`;
        
        saveOrders(orders);
        
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

    deleteOrder();
  } catch (error) {
    console.error('Error fetching order data:', error);
  }
}

// Function to generate HTML for each product in an order
function productsListHTML(products) {
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
      <a href="tracking.html?orderId=${product.product_id}">
        <button class="track-package-button button-secondary">
          Track package
        </button>
      </a>
    </div>
  `).join('');
}

loadPage();
