const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- Authentication Routes ---

// Signup
app.post('/api/signup', (req, res) => {
    const { name, email, mobileNumber, address, password } = req.body;

    const query = `INSERT INTO users (name, email, mobileNumber, address, password) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, email, mobileNumber, address, password], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Email or Mobile Number already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name, email, mobileNumber, address });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { mobileNumber, password } = req.body;

    const query = `SELECT * FROM users WHERE mobileNumber = ? AND password = ?`;
    db.get(query, [mobileNumber, password], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json(user);
    });
});

// --- Shop Routes ---

// Get All Shops
app.get('/api/shops', (req, res) => {
    db.all(`SELECT * FROM shops`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// --- Order Routes ---

// Create Order
app.post('/api/orders', (req, res) => {
    const { orderNumber, mobileNumber, address, total, items, paymentMethod } = req.body;

    db.run(`INSERT INTO orders (orderNumber, mobileNumber, address, total, paymentMethod) VALUES (?, ?, ?, ?, ?)`,
        [orderNumber, mobileNumber, address, total, paymentMethod],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const orderId = this.lastID;
            const itemQueries = items.map(item => {
                return new Promise((resolve, reject) => {
                    db.run(`INSERT INTO order_items (orderId, itemName, service, quantity, price) VALUES (?, ?, ?, ?, ?)`,
                        [orderId, item.name, item.service, item.quantity, item.price],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
            });

            Promise.all(itemQueries)
                .then(() => res.status(201).json({ message: 'Order created successfully', id: orderId }))
                .catch(err => res.status(500).json({ error: err.message }));
        }
    );
});

// Get User Orders
app.get('/api/orders/:mobileNumber', (req, res) => {
    const { mobileNumber } = req.params;

    const query = `SELECT * FROM orders WHERE mobileNumber = ? ORDER BY date DESC`;
    db.all(query, [mobileNumber], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Fetch items for each order (simplified for demo, in production use JOIN or batching)
        const ordersWithItems = orders.map(order => {
            return new Promise((resolve) => {
                db.all(`SELECT * FROM order_items WHERE orderId = ?`, [order.id], (err, items) => {
                    resolve({ ...order, items: items || [] });
                });
            });
        });

        Promise.all(ordersWithItems).then(results => res.json(results));
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
