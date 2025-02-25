const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createDeliveryService, editDeliveryService, removeDeliveryService, getDeliveryServices } = require('../../controllers/delivery-services.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createDeliveryService(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'delivery-services', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getDeliveryServices(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'delivery-services', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeDeliveryService(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'delivery-services', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editDeliveryService(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'delivery-services', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;