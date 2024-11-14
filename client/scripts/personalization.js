import { userAccountButton } from "./amazon.js";
import { calculateCartQuantity } from "../data/cart.js";

const cartQuantity = calculateCartQuantity();
document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;

window.addEventListener('DOMContentLoaded', () => {
  userAccountButton();
});



