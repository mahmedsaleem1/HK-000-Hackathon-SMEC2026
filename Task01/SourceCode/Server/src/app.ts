import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pollutionRoutes from './routes/pollutionRoutes';

dotenv.config();

const server: Application = express();
const serverPort = process.env.PORT || 5000;

// middleware setup
server.use(cors());
server.use(express.json());

// connect to database
const dbConnection = process.env.MONGO_URI || 'mongodb://localhost:27017/airpollution';

mongoose.connect(dbConnection)
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.log('Database connection failed:', err.message);
  });

// routes
server.use('/api/pollution', pollutionRoutes);

// health check
server.get('/health', (req, res) => {
  res.json({ status: 'running', message: 'Server is healthy' });
});

server.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});
