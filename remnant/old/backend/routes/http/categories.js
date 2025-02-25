const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createCategory, getCategories, removeCategory, editCategory } = require('../../controllers/category.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createCategory(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'categories', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getCategories(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'categories', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeCategory(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'categories', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editCategory(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'categories', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;