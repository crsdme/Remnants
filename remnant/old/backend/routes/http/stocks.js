const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createStock, getStocks, removeStock, editStock } = require('../../controllers/stocks.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createStock(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'stocks', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getStocks(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'stocks', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeStock(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'stocks', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editStock(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'stocks', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;