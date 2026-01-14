require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Campus Hub Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});

