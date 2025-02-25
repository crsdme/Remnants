const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { createLog } = require('../../controllers/log.js');

const { getMoneyTransactions } = require('../../controllers/money-transactions.js');

// router.post('/create', authenticateToken, async (req, res) => {
//     const { status, data, errors, warnings, info } = await createCashregisterAccount(req.body);

//     const { userId, ...params } = req.body;

//     createLog({ type: 'create', route: 'cashregister-accounts', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

//     res.json({ status, data, errors, warnings, info });
// });

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getMoneyTransactions(req.body);

    const { userId, ...params } = req.body;

    createLog({ type: 'get', route: 'money-transactions', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

    res.json({ status, data, errors, warnings, info });
});

// router.post('/remove', authenticateToken, async (req, res) => {
//     const { status, data, errors, warnings, info } = await removeCashregisterAccount(req.body);
    
//     const { userId, ...params } = req.body;

//     createLog({ type: 'remove', route: 'cashregister-accounts', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

//     res.json({ status, data, errors, warnings, info });
// });

// router.post('/edit', authenticateToken, async (req, res) => {
//     const { status, data, errors, warnings, info } = await editCashregisterAccount(req.body);
    
//     const { userId, ...params } = req.body;

//     createLog({ type: 'edit', route: 'cashregister-accounts', ip: req.socket.remoteAddress, userId, params: JSON.stringify(params) })

//     res.json({ status, data, errors, warnings, info });
// });

module.exports = router;