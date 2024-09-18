const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog, getLogs } = require('../../controllers/log.js');

const { createNotification, getNotifications } = require('../../controllers/notification.js');

router.post('/logs/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getLogs(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'logs', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/notifications/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getNotifications(req.body);

    res.json({ status, data, errors, warnings, info });
});

router.post('/notifications/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createNotification(req.body);
    
    res.json({ status, data, errors, warnings, info });
});

module.exports = router;

