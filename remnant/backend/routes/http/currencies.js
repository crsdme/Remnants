const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createCurrency, getCurrencies, removeCurrency, editCurrency } = require('../../controllers/currency.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createCurrency(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'currencies', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getCurrencies(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'currencies', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeCurrency(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'currencies', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editCurrency(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'currencies', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;