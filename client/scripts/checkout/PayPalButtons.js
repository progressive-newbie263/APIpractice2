// import {cart} from '../../data/cart.js';
// import {orders} from '../../data/order.js';
// import {WindowUtils} from '../utils/WindowUtils.js';
// import {Component} from '../components/Component.js';

// export class PayPalButtons extends Component {
//   element;
//   #selector;

//   constructor(selector) {
//     super();
//     this.element = document.querySelector(selector);
//     this.#selector = selector;
//   }

//   render() {
//     paypal.Buttons({
//       onInit: (data, actions) => {
//         if (cart.isEmpty()) {
//           actions.disable();
//         }
//       },

//       // Sets up the transaction when a payment button is clicked
//       createOrder: (data, actions) => {
//         const costs = cart.calculateCosts();

//         return actions.order.create({
//           purchase_units: [{
//             amount: {
//               value: (costs.totalCents / 100).toFixed(2)
//             }
//           }]
//         });
//       },

//       // Finalize the transaction after payer approval
//       onApprove: async (data, actions) => {
//         const orderData = await actions.order.capture();

//         // Successful capture! For dev/demo purposes:
//         console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));

//         const transaction = orderData.purchase_units[0].payments.captures[0];
//         alert(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);

//         // When ready to go live, remove the alert and show a success message within this page. For example:
//         // const element = document.getElementById('paypal-button-container');
//         // element.innerHTML = '<h3>Thank you for your payment!</h3>';
//         // Or go to another URL:  actions.redirect('thank_you.html');

//         orders.createNewOrder(cart);
//         WindowUtils.setHref('orders.html');
//       }
//     }).render(this.#selector);
//   }
// }