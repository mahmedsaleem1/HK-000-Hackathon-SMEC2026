const express = require('express');
const router = express.Router();

router.use('/products', require('./productRoutes'));
router.use('/cart', require('./cartRoutes'));

module.exports = router;
