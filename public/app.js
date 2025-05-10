// ✅ app.js - แสดงสินค้าและจัดการตะกร้า

let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');

let products = [];
let cart = [];

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

const addDataToHTML = () => {
    if (products.length > 0) {
        products.forEach(product => {
            let imageSrc = product.image && product.image !== "image/" ? product.image : 'image/default.png';
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML = `
                <img src="${imageSrc}" alt="">
                <h2>${product.name}</h2>
                <div class="price">จำนวน ${product.stock}</div>
                <button class="addCart">เบิกอุปกรณ์</button>`;
            listProductHTML.appendChild(newProduct);
        });
    }
};

listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let id_product = positionClick.parentElement.dataset.id;
        addToCart(id_product);
    }
});

const addToCart = (product_id) => {
    let position = cart.findIndex(item => item.product_id == product_id);
    if (position < 0) {
        cart.push({ product_id: product_id, quantity: 1 });
    } else {
        cart[position].quantity += 1;
    }
    document.cookie = "listCart=" + JSON.stringify(cart) + "; expires=Thu, 31 Dec 2025 23:59:59 UTC; path=/;";
    addCartToHTML();
    addCartToMemory();
};

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    cart.forEach(item => {
        let product = products.find(p => p.id == item.product_id);
        if (!product) return;
        totalQuantity += item.quantity;

        let newItem = document.createElement('div');
        newItem.classList.add('item');
        newItem.dataset.id = item.product_id;
        newItem.innerHTML = `
            <div class="image">
                <img src="${product.image || 'image/default.png'}">
            </div>
            <div class="name">${product.name}</div>
            <div class="totalPrice">TP(${item.quantity})</div>
            <div class="quantity">
                <span class="minus">ลบ</span>
                <span>${item.quantity}</span>
                <span class="plus">เพิ่ม</span>
            </div>`;
        listCartHTML.appendChild(newItem);
    });
    iconCartSpan.innerText = totalQuantity;
};

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    let type = '';
    if (positionClick.classList.contains('plus')) type = 'plus';
    if (positionClick.classList.contains('minus')) type = 'minus';
    if (!type) return;

    let product_id = positionClick.parentElement.parentElement.dataset.id;
    changeQuantityCart(product_id, type);
});

const changeQuantityCart = (product_id, type) => {
    let position = cart.findIndex(item => item.product_id == product_id);
    if (position >= 0) {
        if (type === 'plus') {
            cart[position].quantity += 1;
        } else {
            let newQty = cart[position].quantity - 1;
            if (newQty > 0) {
                cart[position].quantity = newQty;
            } else {
                cart.splice(position, 1);
            }
        }
    }
    document.cookie = "listCart=" + JSON.stringify(cart) + "; expires=Thu, 31 Dec 2025 23:59:59 UTC; path=/;";
    addCartToHTML();
    addCartToMemory();
};

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const initApp = () => {
    fetch('/api/products')
        .then(res => res.json())
        .then(data => {
            products = data;
            addDataToHTML();

            if (localStorage.getItem('cart')) {
                cart = JSON.parse(localStorage.getItem('cart'));
            }
            addCartToHTML();
        });
};

initApp();