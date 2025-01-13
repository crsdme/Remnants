const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createPurchase, editPurchase, removePurchase, getPurchases, getPurchaseProducts } = require('../../controllers/purchase.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createPurchase(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'purchases', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getPurchases(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'purchases', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get/products', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getPurchaseProducts(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get.products', route: 'purchases', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removePurchase(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'purchases', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editPurchase(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'purchases', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;