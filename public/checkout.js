let listCart = [];
let products = [];

// อ่าน cookie
function checkCart() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('listCart='));
    if (cookieValue) {
        try {
            listCart = JSON.parse(cookieValue.split('=')[1]);
        } catch (e) {
            console.warn("❌ Cookie ผิดรูปแบบ");
            listCart = [];
        }
    } else {
        listCart = [];
    }
}

// แสดงรายการในหน้า checkout
function addCartToHTML() {
    const listCartHTML = document.querySelector('.returnCart .list');
    if (!listCartHTML) {
        console.warn("❌ ไม่พบ .returnCart .list");
        return;
    }

    listCartHTML.innerHTML = '';
    const totalQuantityHTML = document.querySelector('.totalQuantity');
    const totalPriceHTML = document.querySelector('.totalPrice');

    let totalQuantity = 0;
    let totalPrice = 0;

    listCart.forEach(item => {
        const product = products.find(p => p.id == item.product_id);
        if (!product) return;

        const imageSrc = product.image && product.image !== "image/" 
            ? product.image 
            : "image/default.png";

        const newCart = document.createElement('div');
        newCart.classList.add('item');
        newCart.innerHTML = `
            <img src="${imageSrc}">
            <div class="info">
                <div class="name">${product.name}</div>
                
            </div>
            <div class="quantity">${item.quantity} ชิ้น</div>
            
        `;
        listCartHTML.appendChild(newCart);

        totalQuantity += item.quantity;
        totalPrice += product.price * item.quantity;
    });

    if (totalQuantityHTML) totalQuantityHTML.innerText = totalQuantity;
    if (totalPriceHTML) totalPriceHTML.innerText = '$' + totalPrice.toFixed(2);
}

// โหลด products และแสดงผลหลัง DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/products')

        .then(res => res.json())
        .then(data => {
            products = data;
            checkCart();
            addCartToHTML();
        });
});

// เมื่อคลิก CHECKOUT
document.querySelector('.buttonCheckout').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const id = document.getElementById('ID').value.trim();
    const address = document.getElementById('address').value.trim();
    const department = document.getElementById('country').value;
    const type = document.getElementById('CT').value;

    if (!name || !id || !address || !department || !type) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    const userInfo = { name, id, address, department, type };

    fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInfo, cart: listCart })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "ทำรายการสำเร็จ");
        document.cookie = "listCart=[]; path=/;";
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    })
    .catch(err => {
        console.error("❌ Error:", err);
        alert("เกิดข้อผิดพลาด");
    });
});
