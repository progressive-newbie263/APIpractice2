import formatCurrency from "../scripts/utils/money.js";

export function getProduct(productId) {
  let matchingProduct;
  
  products.forEach((product) => {
    if(product.id === productId){
      matchingProduct = product;
    }
  });

  return matchingProduct;
}

export class Product {
  id;
  image;
  name;
  ratingstars;
  ratingcount;
  pricecents;
  keywords;
  type;
  is_active;

  constructor(productDetails) {
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.ratingstars = productDetails.ratingstars;
    this.ratingcount = productDetails.ratingcount;
    this.pricecents = productDetails.pricecents;
    this.keywords = productDetails.keywords;
    this.is_active = productDetails.is_active; 
  }

  getStarsUrl() {
    return `images/ratings/rating-${this.ratingstars*10}.png`;
  }

  getPrice() {
    return `$${formatCurrency(this.pricecents)}`;
  }

  extraInfoHTML() {
    return '';
  }
}

// INHERITANCE:
// size chart:
export class Clothing extends Product {
  sizeOptions;
  colorOptions;
  selectedSize;
  selectedColor;

  constructor(productDetails) {
    super(productDetails); // Call the constructor of the parent class

    //4 nút để lựa chọn cỡ.
    this.sizeOptions = ['S', 'M', 'L', 'XL'];

    // Chọn màu sắc.
    const colorOptions = productDetails.variants.map(variant => variant.color);
    this.colorOptions = Array.from(new Set(colorOptions)); // Ensure unique colors

    // Đặt mặc định cho size và color là ?
    this.selectedSize = this.sizeOptions[0]; // Default to 'S'
    this.selectedColor = this.colorOptions[0] || 'default'; // Default to first color or 'default' if no colors
  }

extraInfoHTML() {
  let colorSection = '';

  // Kiểm tra xem có màu nào không
  if (this.colorOptions.length > 0) {
    colorSection = `
      <div>
        <label for="color">Color:</label>
        <div id="color-options" class="color-options">
          ${this.colorOptions.map(color => {
            // Kiểm tra nếu màu là beige, camo, yellow (màu sáng quá) thì áp dụng màu chữ đen
            const textColorClass = ['beige', 'camo', 'yellow'].includes(color.toLowerCase()) ? 'black-text' : '';

            return `
              <button 
                type="button" 
                class="color-option-button ${textColorClass}" 
                style="background-color: ${color};"
                data-color="${color}" 
                ${color === this.selectedColor ? 'class="selected"' : ''}
              >
                ${color}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  //bỏ cái sizechartlink luôn
  return `
    <!--
    <a href="${this.sizechartlink}" target="_blank">
      Size chart
    </a>
    -->
    <div>
      <label for="size">Size:</label>
      <div id="size-options" class="size-options">
        ${this.sizeOptions.map(size => {
          return `
            <button 
              type="button" 
              class="size-option-button" 
              data-size="${size}" 
              ${size === this.selectedSize ? 'class="selected"' : ''}
            >
              ${size}
            </button>
          `;
        }).join('')}
      </div>
    </div>
    ${colorSection}  <!-- Chỉ hiển thị phần này nếu có màu -->
  `;
  }
}



// Product collection:
export let products = [];

// Load products using XMLHttpRequest
export async function loadProducts(fun) {
  try {
    const response = await fetch('http://localhost:8082/api/products');
    if (!response.ok) {
      throw new Error(`Failed to load products. Status: ${response.status}`);
    }

    const data = await response.json();
    products = data.map((productDetails) => {
      if (productDetails.type === 'clothing') {
        return new Clothing(productDetails);
      }
      return new Product(productDetails);
    });

    console.log('Products loaded successfully');
    fun();
  } catch (error) {
    console.error('Error loading products:', error.message);
  }
}

export function loadProductsFetch() {
  //make a GET request by default.
  const promise = fetch(
    'http://localhost:8082/api/products'
  ).then((response) => {
    return response.json();//console.log(response) returned a JSON object;
  }).then((productsData) => {
    products = productsData.map((productDetails) => { 
      if(productDetails.type === 'clothing') {
        return new Clothing(productDetails);
      }
      // if(productDetails.type === 'appliance') {
      //   return new Appliance(productDetails);
      // }
      return new Product(productDetails);
    });

    console.log('load products');
  }).catch(() => {
    console.log('Unexpected Error. Please try again later.');
  });

  return promise; 
}