const axios = require('axios');

class PriceService {
  constructor() {
    this.apiKey = process.env.PRICES_API_KEY;
    this.apiUrl = process.env.PRICES_API_URL;
  }

  async searchProducts(query) {
    try {
      // Simulated response for multiple e-commerce platforms
      // In production, you would call the actual PricesAPI
      const products = await this.fetchFromMultipleSources(query);
      return this.processResults(products);
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  async fetchFromMultipleSources(query) {
    
    const mockData = {
      amazon: this.getMockAmazonData(query),
      ebay: this.getMockEbayData(query),
      walmart: this.getMockWalmartData(query)
    };

    return mockData;
  }

  getMockAmazonData(query) {
    const products = {
      'laptop': { name: 'Dell XPS 13 Laptop', price: 1299.99, rating: 4.5, inStock: true },
      'phone': { name: 'Samsung Galaxy S23', price: 799.99, rating: 4.7, inStock: true },
      'headphones': { name: 'Sony WH-1000XM5', price: 349.99, rating: 4.8, inStock: true },
      'tablet': { name: 'iPad Pro 11-inch', price: 899.99, rating: 4.6, inStock: true },
      'camera': { name: 'Canon EOS R6', price: 2499.99, rating: 4.9, inStock: true }
    };

    const product = products[query.toLowerCase()] || { 
      name: `${query} - Amazon Edition`, 
      price: Math.random() * 500 + 100, 
      rating: (Math.random() * 2 + 3).toFixed(1), 
      inStock: true 
    };

    return {
      ...product,
      source: 'Amazon',
      url: `https://amazon.com/search?q=${query}`,
      shipping: 'Free shipping',
      delivery: '2-3 days'
    };
  }

  getMockEbayData(query) {
    const products = {
      'laptop': { name: 'HP Pavilion 15 Laptop', price: 1199.99, rating: 4.3, inStock: true },
      'phone': { name: 'iPhone 14 Pro', price: 999.99, rating: 4.8, inStock: true },
      'headphones': { name: 'Bose QuietComfort 45', price: 329.99, rating: 4.6, inStock: true },
      'tablet': { name: 'Samsung Galaxy Tab S8', price: 699.99, rating: 4.5, inStock: true },
      'camera': { name: 'Nikon Z6 II', price: 1999.99, rating: 4.7, inStock: true }
    };

    const product = products[query.toLowerCase()] || { 
      name: `${query} - eBay Deal`, 
      price: Math.random() * 500 + 80, 
      rating: (Math.random() * 2 + 3).toFixed(1), 
      inStock: true 
    };

    return {
      ...product,
      source: 'eBay',
      url: `https://ebay.com/sch/i.html?_nkw=${query}`,
      shipping: '$5.99 shipping',
      delivery: '3-5 days'
    };
  }

  getMockWalmartData(query) {
    const products = {
      'laptop': { name: 'Lenovo IdeaPad 3', price: 899.99, rating: 4.2, inStock: true },
      'phone': { name: 'Google Pixel 7 Pro', price: 699.99, rating: 4.6, inStock: true },
      'headphones': { name: 'JBL Tune 760NC', price: 129.99, rating: 4.4, inStock: true },
      'tablet': { name: 'Amazon Fire HD 10', price: 149.99, rating: 4.3, inStock: true },
      'camera': { name: 'Fujifilm X-T4', price: 1699.99, rating: 4.8, inStock: true }
    };

    const product = products[query.toLowerCase()] || { 
      name: `${query} - Walmart Special`, 
      price: Math.random() * 500 + 70, 
      rating: (Math.random() * 2 + 3).toFixed(1), 
      inStock: true 
    };

    return {
      ...product,
      source: 'Walmart',
      url: `https://walmart.com/search?q=${query}`,
      shipping: 'Free pickup',
      delivery: '1-2 days'
    };
  }

  processResults(data) {
    const results = [
      { id: 1, ...data.amazon },
      { id: 2, ...data.ebay },
      { id: 3, ...data.walmart }
    ];

    const bestPrice = results.reduce((min, product) => 
      product.price < min.price ? product : min
    );

    return {
      products: results,
      bestDeal: bestPrice,
      searchedAt: new Date().toISOString()
    };
  }
}

module.exports = new PriceService();
