const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createOrderStatus, getOrderStatuses, removeOrderStatus, editOrderStatus } = require('../../controllers/order-status.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createOrderStatus(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'order-status', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getOrderStatuses(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'order-status', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeOrderStatus(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'order-status', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editOrderStatus(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'order-status', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;