function Cart(localStorageKey) {
  const cart = {
    cartItems: undefined,
  
    //loadFromStorage: function() is full code of it
    //export function loadFromStorage
    loadFromStorage() {
      this.cartItems = JSON.parse(localStorage.getItem(localStorageKey));
    
      if(!this.cartItems) {
        this.cartItems = [
          {
            productId: 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
            quantity: 2,
            deliveryOptionId: '1'
          },
    
          {
            productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d',
            quantity: 1,
            deliveryOptionId: '2'
          }
        ];
      }
    },
  
    saveToStorage(localStorageKey) {
      localStorage.setItem(localStorageKey, JSON.stringify(this.cartItems));
    },
  
    addToCart(productId) {
      let matchingItem;
    
      this.cartItems.forEach((cartItem) => {
        if(productId === cartItem.productId) {
          matchingItem = cartItem;
        }
      });
    
      //13c
      const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);
      //const quantity = Number(quantitySelector.value);
      //replace the hidden line above code with this code, cuz quantity can be null
      let quantity = 1; // Default value
      if (quantitySelector) {
        const quantity = Number(quantitySelector.value);
      }
    
      //13d : console.log(quantityAdded.Value);
    
      //13e
      if (matchingItem) {
        matchingItem.quantity += quantity;
      }
      else {
        this.cartItems.push({
          productId: productId,
          quantity: quantity,
          deliveryOptionId: '1'
        });
        //shorthand property:
            /*
            cart.push({productId, quantity});
            */
      }
      this.saveToStorage();
    },
  
    removeFromCart(productId) {
      const newCart = [];
      
      this.cartItems.forEach((cartItem) => {
        if (cartItem.productId !== productId) {
          newCart.push(cartItem);
        }
      });
    
      this.cartItems = newCart;
    
      this.saveToStorage();
    },
  
      //14e
    calculateCartQuantity() {
      let cartQuantity = 0;
  
      this.cartItems.forEach((cartItem) => {
        cartQuantity += cartItem.quantity;
      });
      return cartQuantity;
    },
  
    //14l
    updateQuantity(productId, newQuantity) {
      let matchingItem;
  
      this.cartItems.forEach((cartItem) => {
        if(productId === cartItem.productId) {
          matchingItem = cartItem;
        }
      });
      matchingItem.quantity = newQuantity;
  
      this.saveToStorage();
    },
  
  
    updateDeliveryOption(productId, deliveryOptionId) {
      let matchingItem;
  
      this.cartItems.forEach((cartItem) => {
        if(productId === cartItem.productId) {
          matchingItem = cartItem;
        }
      });
  
      matchingItem.deliveryOptionId = deliveryOptionId;
  
      this.saveToStorage();
    }
  };

  return cart;
}

const cart = Cart('cart-oop');
const businessCart = Cart('cart-business');

cart.loadFromStorage();
businessCart.loadFromStorage();

console.log(cart);
console.log(businessCart);








































































































