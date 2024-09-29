import { renderCheckoutHeader } from "./checkout/checkoutHeader.js";
import { renderOrderSummary } from "./checkout/orderSummary.js";
import { renderPaymentSummary } from "./checkout/paymentSummary.js";
import { loadProducts, loadProductsFetch } from "../data/products.js";
import { loadCart, loadCartFetch } from "../data/cart.js";

async function loadPage() {
  try {
    await Promise.all([
      loadProductsFetch(), //return promises
      loadCartFetch()
    ]);
  } catch(error) {
    console.log('Unexpected Error. Please try again later.');
  };
 
  renderCheckoutHeader();
  renderOrderSummary();
  renderPaymentSummary();
}

loadPage();





/*

CODE for loading the products 

//promise.all can help us execute all the promises at the same time
Promise.all([
  loadProductsFetch(), //return promises

  new Promise((resolve) => {
    loadCart(() => {
      resolve();
    });
  })

]).then((values) => {
  console.log(values);
  renderCheckoutHeader();
  renderOrderSummary();
  renderPaymentSummary();
});
*/

/*
new Promise((resolve) => {
  loadProducts(() => {
    resolve('value1'); //value1 in here allow us to use it in the value of next function
  });

}).then((value) => {
  //console.log(value); //in console will have 'value1' string.
  return new Promise((resolve) => {
    loadCart(() => {
      resolve();
    });
  });

}).then(() => {
  renderCheckoutHeader();
  renderOrderSummary();
  renderPaymentSummary();
}); 
*/


/*
loadProducts(() => {
  loadCart(() => {
    //we want to wait until cart and product to load before rending page    
    renderCheckoutHeader();
    renderOrderSummary();
    renderPaymentSummary();
  });

});
*/




