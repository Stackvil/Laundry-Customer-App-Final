const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('../models/Service');
const Item = require('../models/Item');
const Shop = require('../models/Shop');

dotenv.config();

// Seed data
const services = [
  { name: 'Washing', description: 'Professional washing service', icon: '🧼', priceMultiplier: 1.0 },
  { name: 'Ironing', description: 'Premium ironing service', icon: '🔥', priceMultiplier: 0.6 },
  { name: 'Dry Cleaning', description: 'Expert dry cleaning', icon: '✨', priceMultiplier: 2.5 },
  { name: 'Stain Removal', description: 'Specialized stain removal', icon: '🧪', priceMultiplier: 1.2 },
  { name: 'Steam Press', description: 'Steam pressing service', icon: '💨', priceMultiplier: 0.8 },
];

const items = [
  { name: 'Shirt', icon: '👔', basePrice: 50, unit: 'item' },
  { name: 'Pant', icon: '👖', basePrice: 60, unit: 'item' },
  { name: 'Suit', icon: '🤵', basePrice: 200, unit: 'item' },
  { name: 'Coat', icon: '🧥', basePrice: 250, unit: 'item' },
  { name: 'Dress', icon: '👗', basePrice: 70, unit: 'item' },
  { name: 'Kurta', icon: '👕', basePrice: 55, unit: 'item' },
  { name: 'Saree', icon: '🎀', basePrice: 80, unit: 'item' },
  { name: 'T-Shirt', icon: '👕', basePrice: 40, unit: 'item' },
];

const shops = [
  {
    name: 'QuickClean Laundry',
    description: 'Fast and reliable laundry service',
    image: '🧺',
    address: '123 Main Street, City',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Example: Delhi coordinates
    },
    phone: '+91 98765 43210',
    email: 'quickclean@cleanfold.com',
    rating: 4.8,
    totalReviews: 120,
    workingHours: {
      open: '09:00',
      close: '20:00'
    }
  },
  {
    name: 'Fresh & Fold',
    description: 'Eco-friendly laundry solutions',
    image: '👔',
    address: '456 Oak Avenue, City',
    location: {
      type: 'Point',
      coordinates: [77.2190, 28.6239]
    },
    phone: '+91 98765 43211',
    email: 'freshfold@cleanfold.com',
    rating: 4.6,
    totalReviews: 95,
    workingHours: {
      open: '08:00',
      close: '21:00'
    }
  },
  {
    name: 'Sparkle Wash',
    description: 'Premium laundry and dry cleaning',
    image: '✨',
    address: '789 Pine Road, City',
    location: {
      type: 'Point',
      coordinates: [77.2290, 28.6339]
    },
    phone: '+91 98765 43212',
    email: 'sparkle@cleanfold.com',
    rating: 4.9,
    totalReviews: 200,
    workingHours: {
      open: '07:00',
      close: '22:00'
    }
  },
  {
    name: 'EcoClean Services',
    description: 'Sustainable laundry practices',
    image: '🌿',
    address: '321 Elm Street, City',
    location: {
      type: 'Point',
      coordinates: [77.2390, 28.6439]
    },
    phone: '+91 98765 43213',
    email: 'ecoclean@cleanfold.com',
    rating: 4.7,
    totalReviews: 150,
    workingHours: {
      open: '09:00',
      close: '20:00'
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanfold', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Service.deleteMany({});
    // await Item.deleteMany({});
    // await Shop.deleteMany({});

    // Insert services
    const insertedServices = await Service.insertMany(services);
    console.log(`Inserted ${insertedServices.length} services`);

    // Insert items
    const insertedItems = await Item.insertMany(items);
    console.log(`Inserted ${insertedItems.length} items`);

    // Insert shops and link services
    for (const shopData of shops) {
      const shop = await Shop.create({
        ...shopData,
        services: insertedServices.map(s => s._id)
      });
      console.log(`Created shop: ${shop.name}`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
