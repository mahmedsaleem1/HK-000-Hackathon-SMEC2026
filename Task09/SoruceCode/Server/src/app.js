const express = require('express');
const cors = require('cors');

const memberRoutes = require('./routes/memberRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/members', memberRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/reservations', reservationRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'Campus Hub API',
        version: '1.0.0',
        endpoints: {
            members: '/api/members',
            facilities: '/api/facilities',
            reservations: '/api/reservations'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;

