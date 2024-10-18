import { cart, calculateCartQuantity } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { getDeliveryOption } from "../../data/deliveryOptions.js";
import formatCurrency from "../utils/money.js";
import { addOrder } from "../../data/order.js";

/* 
  note: https://supersimplebackend.dev/orders is used as an external source for order ID at the moment. We need to change it.
  view source/ guidance : https://supersimplebackend.dev/documentation#post-orders
*/

// Function to check if the user is logged in
//if logged in, click on order button will func as normal. Else, return user to login page.
function isLoggedIn() {
  // For example, check if there's a "user" key in localStorage
  const user = localStorage.getItem('user');
  return user !== null; // User is logged in if this returns true
}


export function renderPaymentSummary() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    //note: priceCents because in database, it is "pricecents"
    const product = getProduct(cartItem.productId);
    productPriceCents += product.pricecents * cartItem.quantity;

    //note: priceCents because we setted in inside client.
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOption.priceCents;
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = 0.1*totalBeforeTaxCents;
  const totalCents = totalBeforeTaxCents + taxCents;
  
  const paymentSummaryHTML = `
    <div class="payment-summary-title">
      Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items (${calculateCartQuantity()}):</div>
      
      <div class="payment-summary-money">
        $${formatCurrency(productPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">
        $${formatCurrency(shippingPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">
        $${formatCurrency(totalBeforeTaxCents)}
      </div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">
        $${formatCurrency(taxCents)}
      </div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">
        $${formatCurrency(totalCents)}
      </div>
    </div>

    
    <button class="place-order-button button-primary js-place-order">
      Place your order
    </button>

  `;

  document.querySelector('.js-payment-summary')
    .innerHTML = paymentSummaryHTML;

  document.querySelector('.js-place-order').addEventListener('click', async () => {
    // Check if the user is logged in
    if (!isLoggedIn()) {
      // If the user is not logged in, redirect them to the login page
      window.location.href = './sign-in.html'; // Adjust path to your login page
      alert('Please log in to be able to order our products!')
      return; // Stop further execution
    }
  })

  //send request to the backend for placing order button
  //method is POST to give the cart's data.
  //headers gives the backend more information about our request
  document.querySelector('.js-place-order')
    .addEventListener('click', async () => {
      //add error handling practice:
      try {
        const response  = await fetch('https://supersimplebackend.dev/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cart: cart
          })
        });
  
        const order = await response.json();
        addOrder(order);
        //console.log(order);
      } catch (error) {
        console.log('Unexpected error. Try again later.');
      }
      //addOrder(order);

      window.location.href =  './orders.html';

      localStorage.removeItem('cart');
    });
}

