const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../../controllers/auth.js');

const { getUsers, } = require('../../controllers/user.js');

router.post('/get', authenticateToken, async (req, res) => {
    const { status, data, errors, warnings, info } = await getUsers(req.body);
  
    res.json({ status, data, errors, warnings, info });
});

module.exports = router;

