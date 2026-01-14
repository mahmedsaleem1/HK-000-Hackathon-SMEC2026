# Task 02 - Price Comparison Application

A modern web application that compares product prices across three major e-commerce platforms: Amazon, eBay, and Walmart. Find the best deals instantly!

## 🎯 Features

- **Multi-Platform Search**: Search products across Amazon, eBay, and Walmart simultaneously
- **Best Price Detection**: Automatically identifies and highlights the lowest price
- **Real-Time Comparison**: Displays prices, ratings, shipping info, and delivery times
- **Price Analytics**: Shows price range, average price, and potential savings
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **User-Friendly Interface**: Clean, modern design with smooth animations

## 🛠️ Tech Stack

### Frontend
- React 18.2
- Vite (Build tool)
- Axios (HTTP client)
- CSS3 with modern styling

### Backend
- Node.js
- Express.js
- Axios for API integration
- CORS enabled
- Environment variable configuration

## 📁 Project Structure

```
Task02/
├── Client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductList.jsx
│   │   ├── services/      # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx        # Main application component
│   │   └── App.css        # Global styles
│   ├── package.json
│   └── .env               # Frontend environment variables
│
└── Server/                # Backend Express application
    ├── src/
    │   ├── controllers/   # Request handlers
    │   │   └── productController.js
    │   ├── routes/        # API routes
    │   │   ├── index.js
    │   │   └── productRoutes.js
    │   ├── services/      # Business logic
    │   │   └── priceService.js
    │   ├── app.js         # Express app configuration
    │   └── index.js       # Server entry point
    ├── package.json
    └── .env               # Backend environment variables
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd Task02/SoruceCode/Server
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with:
```
PORT=5000
PRICES_API_KEY=pricesapi_dRnRbNXDkpe0ggDbEk04qd7u6cnlEUcD
PRICES_API_URL=https://api.pricely.com/v1
```

4. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the client directory:
```bash
cd Task02/SoruceCode/Client
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will run on `http://localhost:5173` (or another port if 5173 is busy)

## 💡 Usage

1. **Start Both Servers**: Make sure both backend and frontend servers are running
2. **Open Browser**: Navigate to `http://localhost:5173`
3. **Search Products**: Enter a product name (e.g., "laptop", "phone", "headphones")
4. **View Results**: See price comparisons across all three platforms
5. **Identify Best Deal**: The best price is automatically highlighted with a green border and badge
6. **Visit Store**: Click "View on [Store Name]" to visit the product on the respective e-commerce site

## 🎨 Features Walkthrough

### Search Bar
- Clean, modern search interface
- Real-time loading states
- Enter key support for quick searches

### Product Cards
- Display product name, price, and rating
- Show shipping and delivery information
- Platform-specific styling with emoji logos
- Direct links to product pages
- "Best Price" badge on the cheapest option

### Price Summary
- **Price Range**: Shows min and max prices
- **Average Price**: Calculates mean price across all platforms
- **Potential Savings**: Displays how much you can save by choosing the best deal

## 🔌 API Endpoints

### GET `/api/products/search`
Search for products across platforms

**Query Parameters:**
- `query` (required): Product search term

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Product Name",
        "price": 999.99,
        "rating": 4.5,
        "source": "Amazon",
        "inStock": true,
        "shipping": "Free shipping",
        "delivery": "2-3 days",
        "url": "https://..."
      }
    ],
    "bestDeal": { /* lowest price product */ },
    "searchedAt": "2026-01-14T..."
  }
}
```

## 🎯 Sample Search Terms

Try searching for:
- laptop
- phone
- headphones
- tablet
- camera

## 🌟 Key Highlights

1. **Human-like Design**: Modern, professional UI with gradient backgrounds and smooth animations
2. **Real Names**: Uses actual e-commerce platform names (Amazon, eBay, Walmart)
3. **Smart Comparison**: Automatically identifies and highlights the best deal
4. **Price Analytics**: Provides insights into price differences and savings
5. **Responsive**: Works seamlessly on all device sizes
6. **Error Handling**: Graceful error messages and loading states

## 📝 Notes

- The application currently uses simulated data for demonstration purposes
- In production, the PricesAPI integration would fetch real-time prices
- The API key is included for reference but should be kept secure in production
- All prices are displayed in USD format

## 🔧 Development

### Available Scripts

**Backend:**
- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-reload)

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📱 Screenshots

The application features:
- Gradient purple header with logo
- Clean white search bar with blue button
- Product cards with platform-specific colors
- Green highlight for best deals
- Price summary cards at the bottom
- Responsive grid layout

## 🚀 Future Enhancements

- Integration with real PricesAPI endpoints
- User authentication and saved searches
- Price history tracking
- Email alerts for price drops
- More e-commerce platforms
- Product categories and filters
- Advanced search options

---

**Built with ❤️ for smart shoppers**
