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

//17i: export all classes : Product, appliance, clothing.
export class Product {
  id;
  image;
  name;
  ratingstars;
  ratingcount;
  pricecents;
  keywords;

  constructor(productDetails) {
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.ratingstars = productDetails.ratingstars;
    this.ratingcount = productDetails.ratingcount;
    this.pricecents = productDetails.pricecents;
    this.keywords = productDetails.keywords;
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
export class Clothing extends Product {
  sizeChartLink;

  constructor(productDetails) {
    super(productDetails); //call the constructor of its parent class
    this.sizeChartLink = productDetails.sizeChartLink;
  }

  //method overriding (this piece of code will overwrite the same code from parent class)
  extraInfoHTML() {
    //super.extraInfoHTML();
    return `
      <a href="${this.sizeChartLink}" target="_blank">
        Size chart
      </a>
    `
  }
}

export class Appliance extends Product {
  instructionsLink;
  warrantyLink;

  constructor(productDetails) {
    super(productDetails);
    this.instructionsLink = productDetails.instructionsLink;
    this.warrantyLink = productDetails.warrantyLink;
  }

  extraInfoHTML() {
    return `
      <a href="${this.instructionsLink}" target="_blank">
        Instruction
      </a>

      <a href="${this.warrantyLink}" target="_blank">
        Warranty
      </a>
    `
  }
}

export let products = [];

export function loadProductsFetch() {
  //make a GET request by default.
  const promise = fetch(
    'http://localhost:8082/products'
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

  xhr.open('GET', 'http://localhost:8082/products');
  xhr.send(); //asynchronous, so it just send first, no response
}


