const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createCustomField, getCustomFields, removeCustomField, editCustomField } = require('../../controllers/custom-field.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createCustomField(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'custom-field', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getCustomFields(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'custom-field', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeCustomField(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'custom-field', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editCustomField(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'custom-field', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;