import {
  cart, 
  removeFromCart, 
  calculateCartQuantity, 
  updateQuantity,
  updateDeliveryOption
} from '../../data/cart.js';

import {products, getProduct} from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

import {
  deliveryOptions, 
  getDeliveryOption, 
  calculateDeliveryDate
} from '../../data/deliveryOptions.js';

import { renderPaymentSummary } from './paymentSummary.js';
import { renderCheckoutHeader } from './checkoutHeader.js';

export function renderOrderSummary() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
  
    const matchingProduct = getProduct(productId);
  
    const deliveryOptionId = cartItem.deliveryOptionId;
  
    const deliveryOption = getDeliveryOption(deliveryOptionId);
  
    const dateString = calculateDeliveryDate(deliveryOption);
  
    cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>
  
      <div class="cart-item-details-grid">
        <img class="product-image"
          src="../${matchingProduct.image}">
  
        <div class="cart-item-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            ${matchingProduct.getPrice()}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: 
              <span class="quantity-label js-quantity-label-${matchingProduct.id}">
                ${cartItem.quantity}
              </span>
            </span>
            <span class="update-quantity-link link-primary js-update-link"
            data-product-id="${matchingProduct.id}">
              Update
            </span>
  
  
            <input class="quantity-input js-quantity-input-${matchingProduct.id}">
            <span class="save-quantity-link link-primary js-save-link"
            data-product-id="${matchingProduct.id}">
              Save
            </span>
            
  
            <span class="delete-quantity-link link-primary js-delete-link
            js-delete-link-${matchingProduct.id}" 
            data-product-id="${matchingProduct.id}">
              Delete
            </span>
          </div>
        </div>
  
        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryOptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    </div>
    `;
  });
  
  
  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = '';
  
    deliveryOptions.forEach((deliveryOption) => {
      const dateString = calculateDeliveryDate(deliveryOption);
  
      const priceString = deliveryOption.deliveryDays === 0 ? 'FREE' 
        : `$${formatCurrency(deliveryOption.priceCents)} -`;
  
      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;
      
      html += ` 
        <div class="delivery-option js-delivery-option
        js-delivery-option-${matchingProduct.id}-${deliveryOption.id}"
        data-product-id="${matchingProduct.id}"
        data-delivery-option-id="${deliveryOption.id}">
          <input type="radio"
            ${isChecked ? 'checked' : ''}
            class="delivery-option-input js-delivery-option-input-${matchingProduct.id}-${deliveryOption.id}"
            name="delivery-option-${matchingProduct.id}">
          <div>
            <div class="delivery-option-date">
              ${dateString}
            </div>
            <div class="delivery-option-price">
              ${priceString} Shipping
            </div>
          </div>
        </div>
      `
    });
    return html;
  }
  
  document.querySelector('.js-cart-summary')
    .innerHTML = cartSummaryHTML;
  
  //console.log(cartSummaryHTML);
  document.querySelectorAll('.js-delete-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        removeFromCart(productId);
        
        //15k
        renderCheckoutHeader();
        
        //15h
        renderOrderSummary();
  
        updateCartQuantity(); //14c

        renderPaymentSummary();
      })
    });
  
  //14abc
  function updateCartQuantity() {
    const cartQuantity = calculateCartQuantity();
  
    document.querySelector('.js-return-to-home-link')
      .innerHTML = `${cartQuantity} items`;
  }
  updateCartQuantity();
  
  
  //14f
  document.querySelectorAll('.js-update-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
  
        //updateQuantity(productId, newQuantity);
        
        //14gh
        const container = document.querySelector(`.js-cart-item-container-${productId}`);
        container.classList.add('is-editing-quantity');

        
      });
    });
  
  //14j
  document.querySelectorAll('.js-save-link')
    .forEach((link) => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
  
        const container = document.querySelector(`.js-cart-item-container-${productId}`);
        container.classList.remove('is-editing-quantity');
        // 14k
        const quantityInput = document.querySelector(
          `.js-quantity-input-${productId}`
        );
        const newQuantity = Number(quantityInput.value);
  
        if(newQuantity < 0 || newQuantity >= 1000){
          alert('Quantity must be at least 0 and less than 1000')
          return;
        }
        // Update quantity logic (replace with your implementation)
        updateQuantity(productId, newQuantity);
        
        // 14m
        //const quantityLabel = document.querySelector(`.js-quantity-label-${productId}`);
        //quantityLabel.innerHTML = newQuantity;
  
        //15n
        renderCheckoutHeader();
        
        //14m //updateCartQuantity();
        renderOrderSummary();
        
        //15i
        renderPaymentSummary();
      });
      //14n
      const quantityInput = link.closest('.cart-item-container').querySelector('.js-quantity-input-' + link.dataset.productId); 
      quantityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          // Simulate a click on the corresponding "Save" button
          link.click();
        }
      });  
  });
  

  document.querySelectorAll('.js-delivery-option')
    .forEach((element) => {
      element.addEventListener('click', ()=> {
        const {productId, deliveryOptionId} = element.dataset;
        updateDeliveryOption(productId, deliveryOptionId);
        
        renderOrderSummary();//recall itself (recursion/ de quy)
        
        renderPaymentSummary();
      });
    });
}







