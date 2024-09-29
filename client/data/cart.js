export let cart;

loadFromStorage();

export function loadFromStorage() {
  cart = JSON.parse(localStorage.getItem('cart'));

  if(!cart) {
    cart = [
      /*
      starting products for cart - supersimpledev edition.
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
      */
    ];
  }
}

function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(productId) {
  let matchingItem;

  cart.forEach((cartItem) => {
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
    cart.push({
      productId: productId,
      quantity: quantity,
      deliveryOptionId: '1'
    });
    //shorthand property:
        /*
        cart.push({productId, quantity});
        */
  }
  saveToStorage();
}

export function removeFromCart(productId) {
  const newCart = [];
  
  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  });

  cart = newCart;

  saveToStorage();
}

//14e
export function calculateCartQuantity() {
  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  return cartQuantity;
}

//14l
export function updateQuantity(productId, newQuantity) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if(productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });
  matchingItem.quantity = newQuantity;

  saveToStorage();
}


export function updateDeliveryOption(productId, deliveryOptionId) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if(productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  matchingItem.deliveryOptionId = deliveryOptionId;

  saveToStorage();
}

export function loadCart(fun) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener('load', () => {
    console.log(xhr.response);
    fun();
  });

  xhr.open('GET', 'https://supersimplebackend.dev/cart');
  xhr.send();
}

export async function loadCartFetch() {
  const response = await fetch('https://supersimplebackend.dev/cart', {
    method: 'GET',    
  });
  const text = await response.text();
  console.log(text);
  return text;
}