const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createOrderPayment, editOrderPayment, removeOrderPayment, getOrderPayments } = require('../../controllers/order-payment.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createOrderPayment(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'order-payments', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getOrderPayments(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'order-payments', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeOrderPayment(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'order-payments', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editOrderPayment(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'order-payments', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;