const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createCustomFieldGroup, getCustomFieldGroups, removeCustomFieldGroup, editCustomFieldGroup } = require('../../controllers/custom-field-group.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createCustomFieldGroup(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'custom-field-group', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getCustomFieldGroups(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'custom-field-group', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeCustomFieldGroup(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'custom-field-group', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editCustomFieldGroup(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'custom-field-group', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;