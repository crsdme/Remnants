const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { createUnit, removeUnit, editUnit, getUnits } = require('../../controllers/units.js');

router.post('/create', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await createUnit(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'create', route: 'units', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getUnits(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'units', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/remove', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await removeUnit(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'remove', route: 'units', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

router.post('/edit', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await editUnit(req.body);
    
    const { userId, ...params } = req.body;

    createLog({ type: 'edit', route: 'units', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

module.exports = router;