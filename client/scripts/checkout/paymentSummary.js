import { cart, calculateCartQuantity } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { getDeliveryOption } from "../../data/deliveryOptions.js";
import formatCurrency from "../utils/money.js";
import { addOrder } from "../../data/order.js";

// Function to check if the user is logged in
// If logged in, clicking the order button will function as normal. Otherwise, return the user to the login page.
function isLoggedIn() {
  const userId = getUserIdFromCookie();  // Get the user ID from cookies
  console.log("User ID in isLoggedIn:", userId); // Debug log to check the userId
  return userId !== null; // Return true if user is logged in
}

// Function to get user ID from the cookie
function getUserIdFromCookie() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim(); // Remove leading/trailing spaces
    if (cookie.startsWith('user=')) {
      const cookieValue = cookie.substring('user='.length); // Get the cookie value after "user="
      try {
        const user = JSON.parse(cookieValue); // Try parsing the JSON
        console.log("User cookie parsed:", user); // Debug log to check the parsed user object
        return user.id || null; // Return user id if found, else null
      } catch (error) {
        console.error("Error parsing user cookie:", error); // Log error if JSON is invalid
        return null; // Return null if parsing fails
      }
    }
  }
  console.log("User cookie not found or incorrect format"); // Log when cookie is not found
  return null; // Return null if no "user" cookie is found
}

// Function to render the payment summary
export function renderPaymentSummary() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    productPriceCents += product.pricecents * cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOption.priceCents;
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = 0.1 * totalBeforeTaxCents;
  const totalCents = totalBeforeTaxCents + taxCents;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">Order Summary</div>
    <div class="payment-summary-row">
      <div>Items (${calculateCartQuantity()}):</div>
      <div class="payment-summary-money">$${formatCurrency(productPriceCents)}</div>
    </div>
    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">$${formatCurrency(shippingPriceCents)}</div>
    </div>
    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">$${formatCurrency(totalBeforeTaxCents)}</div>
    </div>
    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">$${formatCurrency(taxCents)}</div>
    </div>
    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">$${formatCurrency(totalCents)}</div>
    </div>
    <button class="place-order-button button-primary js-place-order">
      Place your order
    </button>
  `;

  document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;

  document.querySelector('.js-place-order').addEventListener('click', async () => {
    if (!isLoggedIn()) {
      window.location.href = './sign-in.html';
      alert('Please log in to be able to order our products!');
      return;
    }

    const userId = getUserIdFromCookie();  // Get user ID from cookie

    if (!userId) {
      console.error("User ID not found. Unable to place order.");
      return;
    }

    // Add userId to each cart item
    const cartWithUserId = cart.map(cartItem => ({
      user_id: userId,
      ...cartItem,
    }));

    try {      
      console.log("Request Body:", cartWithUserId);

      const response = await fetch('http://localhost:8082/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartWithUserId),
      });

      if (!response.ok) {
        console.error("Response Error:", response.statusText);
        throw new Error(`Failed to place order, status code: ${response.status}`);
      }

      const order = await response.json();
      addOrder(order);
      console.log("Order placed successfully:", order);

      // Optional: Reset cart after successful order
      localStorage.removeItem('cart');
      window.location.href = './orders.html';
    } catch (error) {
      console.error('Unexpected error. Try again later:', error);
    }
  });
}

// Demo data for testing purposes
const demoOrder = [
  {
    "user_id": 3,
    "productId": "e4f64a65-1377-42bc-89a5-e572d19252e2",
    "quantity": 6,
    "deliveryOptionId": "3"
  },
  {
    "user_id": 3,
    "productId": "aad29d11-ea98-41ee-9285-b916638cac4a",
    "quantity": 3,
    "deliveryOptionId": "2"
  },
  {
    "user_id": 3,
    "productId": "dd82ca78-a18b-4e2a-9250-31e67412f98d",
    "quantity": 8,
    "deliveryOptionId": "2"
  }
];

console.log("demo order: ", demoOrder);
