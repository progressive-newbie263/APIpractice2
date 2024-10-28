export let cart;

loadFromStorage();

export function loadFromStorage() {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart;
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

  const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);

  let quantity = 1; // Default value
  if (quantitySelector) {
    const quantity = Number(quantitySelector.value);
  }

  if (matchingItem) {
    matchingItem.quantity += quantity;
  }
  else {
    cart.push({
      productId: productId,
      quantity: quantity,
      deliveryOptionId: '1'
    });
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

export function calculateCartQuantity() {
  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  return cartQuantity;
}

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

// export function loadCart(fun) {
//   const xhr = new XMLHttpRequest();

//   xhr.addEventListener('load', () => {
//     console.log(xhr.response);
//     fun();
//   });

//   xhr.open('GET', 'https://supersimplebackend.dev/cart');
//   xhr.send();
// }

// export async function loadCartFetch() {
//   const response = await fetch('https://supersimplebackend.dev/cart', {
//     method: 'GET',    
//   });
//   const text = await response.text();
//   console.log(text);
//   return text;
// }

async function saveCartToDatabase() {
  const cart = loadFromStorage();
  const userData = JSON.parse(localStorage.getItem('user'));

  fetch(`http://localhost:8082/api/cart?userId=${userData.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error fetching cart:", error));

  console.log("userID:", userData ? userData.id : null);

  if (!userData) {
    console.error('User datas not found in localStorage');
    return;
  }

  // Tạo mảng sản phẩm với dữ liệu cần thiết
  const cartItems = cart.map(item => ({
    user_id: userData.id,                 // user id từ localStorage.
    product_id: item.productId,              // productId từ localStorage
    quantity: item.quantity,                  // số lượng
    delivery_option_id: item.deliveryOptionId // deliveryOptionId
  }));

  try {
    const response = await fetch('http://localhost:8082/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cartItems),
      //credentials: 'include'
    });

    if (!response.ok) {
      console.log('Cart Items sent:', cartItems); // Thêm dòng này để kiểm tra dữ liệu
      throw new Error('Failed to save cart to database');
    }

    const result = await response.json();
    console.log('Cart saved successfully:', result);
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}


saveCartToDatabase();