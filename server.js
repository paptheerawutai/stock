const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// เบิกของ
app.post('/checkout', (req, res) => {
    const { userInfo, cart } = req.body;
    if (!userInfo || !cart) return res.status(400).send({ message: "ข้อมูลไม่ครบ" });

    let products = readJSON('products.json');
    cart.forEach(item => {
        const index = products.findIndex(p => p.id == item.product_id);
        if (index !== -1) {
            products[index].stock = Math.max(0, products[index].stock - item.quantity);
        }
    });
    writeJSON('products.json', products);

    const logs = readJSON('Data.json');
    logs.push({ userInfo, cart, type: 'checkout', time: new Date().toISOString() });
    writeJSON('Data.json', logs);

    res.send({ message: 'เบิกของสำเร็จ', stock: products });
});

// คืนของ
app.post('/return', (req, res) => {
    const { userInfo, cart } = req.body;
    if (!userInfo || !cart) return res.status(400).send({ message: "ข้อมูลไม่ครบ" });

    let products = readJSON('products.json');
    cart.forEach(item => {
        const index = products.findIndex(p => p.id == item.product_id);
        if (index !== -1) {
            products[index].stock += item.quantity;
        }
    });
    writeJSON('products.json', products);

    const logs = readJSON('Return.json');
    logs.push({ userInfo, cart, type: 'return', time: new Date().toISOString() });
    writeJSON('Return.json', logs);

    res.send({ message: 'คืนของสำเร็จ', stock: products });
});
app.get('/api/products', (req, res) => {
    const data = fs.readFileSync('products.json', 'utf-8');
    res.json(JSON.parse(data));
});
app.get('/api/checkout',(req , res)=>{
    const data = fs.readFileSync('Data.json', 'utf-8');
    res.json(JSON.parse(data));
}


);

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});