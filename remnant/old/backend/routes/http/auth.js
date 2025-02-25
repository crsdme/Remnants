const express = require('express');
const router = express.Router();

const { refreshToken } = require('../../controllers/auth.js');

const { loginUser } = require('../../controllers/user.js');

router.post('/login', async (req, res) => {
    const { status, data, errors, warnings, info } = await loginUser(req.body);
  
    res.json({ status, data, errors, warnings, info });
});
  
router.post('/check/token', (req, res) => {
    refreshToken(req, res);
});


module.exports = router;