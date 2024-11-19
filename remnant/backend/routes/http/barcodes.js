const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createBarcode, editBarcode, getBarcodes, removeBarcode } = require('../../controllers/barcode.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createBarcode(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'barcodes', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getBarcodes(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'barcodes', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeBarcode(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'barcodes', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editBarcode(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'barcodes', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;