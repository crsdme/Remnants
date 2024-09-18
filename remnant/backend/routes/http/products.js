const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createProduct, getProducts, removeProduct, editProduct, } = require('../../controllers/products.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createLanguage(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'languages', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {

    const { status, data, errors, warnings, info } = await getProducts(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'products', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeLanguage(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'languages', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editLanguage(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'languages', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;