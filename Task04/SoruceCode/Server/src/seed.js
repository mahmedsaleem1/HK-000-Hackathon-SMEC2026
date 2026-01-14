require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Wireless Headphones',
    price: 79.99,
    description: 'High quality wireless headphones with noise cancellation',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    category: 'electronics',
    stock: 50
  },
  {
    name: 'Running Shoes',
    price: 129.99,
    description: 'Comfortable running shoes for daily workout',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    category: 'footwear',
    stock: 30
  },
  {
    name: 'Backpack',
    price: 49.99,
    description: 'Durable backpack with laptop compartment',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
    category: 'bags',
    stock: 40
  },
  {
    name: 'Smart Watch',
    price: 199.99,
    description: 'Fitness tracking smartwatch with heart rate monitor',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
    category: 'electronics',
    stock: 25
  },
  {
    name: 'Coffee Maker',
    price: 89.99,
    description: 'Automatic drip coffee maker with timer',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300',
    category: 'kitchen',
    stock: 35
  },
  {
    name: 'Desk Lamp',
    price: 34.99,
    description: 'LED desk lamp with adjustable brightness',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300',
    category: 'home',
    stock: 60
  },
  {
    name: 'Yoga Mat',
    price: 29.99,
    description: 'Non-slip yoga mat for home workouts',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300',
    category: 'fitness',
    stock: 45
  },
  {
    name: 'Sunglasses',
    price: 59.99,
    description: 'Polarized sunglasses with UV protection',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
    category: 'accessories',
    stock: 55
  },
  {
    name: 'Water Bottle',
    price: 19.99,
    description: 'Insulated stainless steel water bottle',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300',
    category: 'fitness',
    stock: 70
  },
  {
    name: 'Notebook Set',
    price: 14.99,
    description: 'Pack of 3 ruled notebooks for notes',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300',
    category: 'stationery',
    stock: 100
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    await Product.insertMany(sampleProducts);
    console.log('Added sample products');
    
    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
