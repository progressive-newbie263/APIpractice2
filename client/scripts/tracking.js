import { calculateCartQuantity } from '../data/cart.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { userAccountButton } from './amazon.js';

async function loadPage() {
  // Get URL parameters
  const url = new URL(window.location.href);
  const orderId = url.searchParams.get('orderId');
  const productId = url.searchParams.get('productId');

  console.log(orderId, productId); 

  if (!orderId || !productId) {
    console.error('Order ID or Product ID missing');
    return;
  }
  
  try {    
    const productResponse = await fetch(`http://localhost:8082/api/order-details?order_id=${orderId}`);
    const orderDetails = await productResponse.json();

    // Find the product details in the order data
    const productDetails = orderDetails.products.find(product => product.product_id === productId);
    
    if (!productDetails) {
      console.error('Product not found in order');
      return;
    }

    // Update the cart quantity in the header
    updateCartQuantity();

    // Calculate progress and set up tracking display
    const today = dayjs();
    const orderTime = dayjs(orderDetails.order_created_at);
    const deliveryTime = dayjs(productDetails.estimated_delivery_time);
    const percentProgress = ((today - orderTime) / (deliveryTime - orderTime)) * 100;

    const trackingHTML = `
      <a class="back-to-orders-link link-primary" href="orders.html">
        View all orders
      </a>
      <div class="delivery-date">
        Arriving on ${dayjs(productDetails.estimated_delivery_time).format('dddd, MMMM D')}
      </div>
      <div class="product-info">
        ${productDetails.product_name}
      </div>
      <div class="product-info">
        Quantity: ${productDetails.quantity}
      </div>

      <img class="product-image" src="../${productDetails.product_image}">

      <div class="progress-labels-container">
        <div class="progress-label ${
          percentProgress < 50 ? 'current-status' : ''
        }">
          Preparing
        </div>
        
        <div class="progress-label ${
          percentProgress >= 50 && percentProgress < 100 ? 'current-status' : ''
        }">
          Shipped
        </div>
        
        <div class="progress-label ${
          percentProgress >= 100 ? 'current-status' : ''
        }">
          Delivered
        </div>
      </div>
      
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percentProgress}%"></div>
      </div>
    `;

    document.querySelector('.js-order-tracking').innerHTML = trackingHTML;

  } catch (error) {
    console.error('Error fetching order data:', error);
  }
}

function updateCartQuantity() {
  const cartQuantity = calculateCartQuantity();
  document.querySelector('.tracking-cart-quantity').innerHTML = cartQuantity;
}

// Load the page content when the script runs
loadPage();

window.addEventListener('DOMContentLoaded', userAccountButton);