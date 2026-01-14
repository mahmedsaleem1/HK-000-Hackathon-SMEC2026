const router = require('express').Router();
const cartController = require('../controllers/cartController');

router.get('/:sessionId', cartController.getCart);
router.post('/:sessionId/add', cartController.addItem);
router.put('/:sessionId/item/:productId', cartController.updateQty);
router.delete('/:sessionId/item/:productId', cartController.removeItem);
router.delete('/:sessionId/clear', cartController.clearCart);

module.exports = router;
