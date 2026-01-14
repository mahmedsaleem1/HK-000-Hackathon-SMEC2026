const express = require('express');
const router = express.Router();

const rideRoutes = require('./rideRoutes');

router.use('/', rideRoutes);

module.exports = router;
