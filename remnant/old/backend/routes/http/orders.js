const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createOrder, getOrders, removeOrder, editOrder } = require('../../controllers/order.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createOrder(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'orders', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getOrders(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'orders', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeOrder(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'orders', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editOrder(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'orders', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;