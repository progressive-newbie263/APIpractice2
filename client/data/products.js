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

  constructor(productDetails) {
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.ratingstars = productDetails.ratingstars;
    this.ratingcount = productDetails.ratingcount;
    this.pricecents = productDetails.pricecents;
    this.keywords = productDetails.keywords;
    //this.type = productDetails.type;
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

//INHERITANCE:
//size chart:
export class Clothing extends Product {
  sizechartlink;

  constructor(productDetails) {
    super(productDetails); //call the constructor of its parent class
    
    //hiện tại ở database thì String là địa chỉ còn Valid là khi nó đúng.
    //trả về địa chỉ kia, nếu tồn tại link image khả dụng. Nếu ko, trả lại empty string
    this.sizechartlink = productDetails.sizechartlink.String ? `/${productDetails.sizechartlink.String}` : ''; 
  }

  //method overriding (this piece of code will overwrite the same code from parent class)
  extraInfoHTML() {
    //super.extraInfoHTML();
    //console.log('Size Chart Link:', this.sizechartlink); //bugged.

    return `
      <a href="${this.sizechartlink}" target="_blank">
        Size chart
      </a>
    `
  }
}

//instructions link and warranty link:
export class Appliance extends Product {
  instructionslink;
  warrantylink;

  constructor(productDetails) {
    super(productDetails);

    //trả về địa chỉ kia, nếu tồn tại link image khả dụng. Nếu ko, trả lại empty string
    this.instructionslink = productDetails.instructionslink.String ? `/${productDetails.instructionslink.String}` : '';
    this.warrantylink = productDetails.warrantylink.String ? `/${productDetails.warrantylink.String}` : '';
  }

  extraInfoHTML() {
    return `
      <a href="${this.instructionslink}" target="_blank">
        Instruction
      </a>

      <a href="${this.warrantylink}" target="_blank">
        Warranty
      </a>
    `
  }
}

export let products = [];

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
      if(productDetails.type === 'appliance') {
        return new Appliance(productDetails);
      }
      return new Product(productDetails);
    });

    console.log('load products');
  }).catch(() => {
    console.log('Unexpected Error. Please try again later.');
  });

  return promise; 
}

//loadProductsFetch();

export function loadProducts(fun) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener('load', () => {
    products = JSON.parse(xhr.response).map((productDetails) => { 
      if(productDetails.type === 'clothing') {
        return new Clothing(productDetails);
      }
      if(productDetails.type === 'appliance') {
        return new Appliance(productDetails);
      }
      return new Product(productDetails);
    });
    console.log('load products'); //console.log(products); it worked

    fun();
  });
  xhr.addEventListener('error', (error) => {
    console.log('Unexpected Error. Please try again later.');
  });

  xhr.open('GET', 'http://localhost:8082/api/products');
  xhr.send(); //asynchronous, so it just send first, no response
}


