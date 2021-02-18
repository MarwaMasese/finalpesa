  
  const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "sxafdz5tjxx7",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken:
    "mUINoCKS_RuaNnbHtkU36jyLZ1L8mB9mtWWkeaiyVtA"
});

// variables
const blog = document.querySelector(".posts-center");
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const myModal = document.querySelector('#exampleModal');
const form = document.querySelector('#booking-form');
let cart = [];
let buttonsDOM = [];
let singlePost =[];


// products
class Posts {
  async getPosts() {
    // always returns promise so we can add .then
    // we can use await until promised is settled and return result
    try {
      // let result = await fetch("products.json");
      // let data = await result.json();
      let contentful = await client.getEntries({
        content_type: "posts"
      });
      console.log(contentful.items);

      let posts = contentful.items;
      posts = posts.map(item => {
        const { title, details,author,date } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, details, id, image,date,author };
      });
      return posts;
 
     
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }
}

// ui
class UI {
  displayProducts(posts) {
    let result = "";
    posts.forEach(post => {
      result += `
				<div class="blog-entry justify-content-end">
				<a href="#" class="block-20" style="background-image: url('images/image_1.jpg');">
				</a>
				<div class="text mt-3 float-right d-block">
				
				  <h3 class="heading"><a href="single.html">${post.title} </a></h3>
				<P> ${post.details.substring(0, 100)}h</P>
				  <div class="d-flex align-items-center mt-4 meta">
					  <p class="mb-0">
                      <a href="#book-tour" class="btn btn-primary"
                      
    
                       > <span class="ion-ios-arrow-round-forward "></span></a></p>
                       <button type="button"
                        class="btn btn-primary read-more" 
                        data-id=${post.id}>
                         Read More
                        </button>
					  <p class="ml-auto mb-0">
						  <a href="#" class="mr-2">${post.author}</a>
						  <a href="#" class="meta-chat">${post.date}</a>
					  </p>
				  </div>
				</div>
			  </div>
   `;
    });
    blog.innerHTML = result;
  }
  getBagButtons() {
    let buttons = [...document.querySelectorAll(".read-more")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);

      if (inCart) {
        button.innerText = "Read";
        button.disabled = true;
      }
      button.addEventListener("click", event => {
        // disable button
        event.target.innerText = "Read";
        event.target.disabled = true;
        // add to cart
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        // add to DOM
        this.addCartItem(cartItem);
      });

    });
  }
 
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
       <!-- cart item -->
    
            <!-- item image -->
            <img src=${item.image} alt="product" />
            <!-- item info -->
            <div>
              
              <h5>$${item.details}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <!-- item functionality -->
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">
                ${item.amount}
              </p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
          <!-- cart item -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary clear-cart">Save changes</button>
      </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.addCartItem);
    closeCartBtn.addEventListener("click", this.hideCart);
     cartBtn.addEventListener("click", this.showCart);
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        // remove item
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    // console.log(this);
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("posts", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("posts"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const posts = new Posts();

  // get all products
  posts
    .getPosts()
    .then(posts => {
      ui.displayProducts(posts);
      Storage.saveProducts(posts);
    }).then(() => {
      ui.getBagButtons();
       ui.cartLogic();
    });
});
