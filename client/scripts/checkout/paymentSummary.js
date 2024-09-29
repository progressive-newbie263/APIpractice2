import { cart, calculateCartQuantity } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { getDeliveryOption } from "../../data/deliveryOptions.js";
import formatCurrency from "../utils/money.js";
import { addOrder } from "../../data/order.js";

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

      window.location.href =  './orders.html';
    });
}

