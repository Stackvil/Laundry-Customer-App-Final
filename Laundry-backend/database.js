const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'laundry.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobileNumber TEXT UNIQUE NOT NULL,
      address TEXT,
      password TEXT NOT NULL
    )`);

        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNumber TEXT UNIQUE NOT NULL,
      mobileNumber TEXT NOT NULL,
      address TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      paymentMethod TEXT,
      FOREIGN KEY (mobileNumber) REFERENCES users(mobileNumber)
    )`);

        // Order Items Table
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      itemName TEXT NOT NULL,
      service TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id)
    )`);

        // Shops Table
        db.run(`CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      distance TEXT,
      rating REAL,
      image TEXT,
      address TEXT
    )`, () => {
            seedShops();
        });
    });
}

function seedShops() {
    db.get("SELECT COUNT(*) as count FROM shops", (err, row) => {
        if (row && row.count === 0) {
            const shops = [
                ['QuickClean Laundry', '0.5 km', 4.8, '🧺', '123 Main Street'],
                ['Fresh & Fold', '1.2 km', 4.6, '👔', '456 Oak Avenue'],
                ['Sparkle Wash', '2.1 km', 4.9, '✨', '789 Pine Road'],
                ['EcoClean Services', '1.8 km', 4.7, '🌿', '321 Elm Street']
            ];
            const stmt = db.prepare("INSERT INTO shops (name, distance, rating, image, address) VALUES (?, ?, ?, ?, ?)");
            shops.forEach(shop => stmt.run(shop));
            stmt.finalize();
            console.log('Shops table seeded.');
        }
    });
}

module.exports = db;
