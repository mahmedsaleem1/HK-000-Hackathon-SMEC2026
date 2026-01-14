require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5007;

connectDB().then((connected) => {
  app.listen(PORT, () => {
    console.log(`Social Media Server running on port ${PORT}`);
    if (!connected) {
      console.log('⚠️  Server running but database is not connected!');
    }
  });
});
