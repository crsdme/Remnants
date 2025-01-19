const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createCashregister, removeCashregister, editCashregister, getCashregisters } = require('../../controllers/cashregister.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createCashregister(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'cashregisters', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getCashregisters(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'cashregisters', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeCashregister(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'cashregisters', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editCashregister(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'cashregisters', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;