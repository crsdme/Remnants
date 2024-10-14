const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

let refreshTokens = []; // SAVE DB

const generateAccessToken = ({ login }) => {
    return jwt.sign({ login }, process.env.JWT_ACCESS_TOKEN, { expiresIn: '600s' });
}

const generateRefreshToken = ({ login }) => {
    const refreshToken = jwt.sign({ login }, process.env.JWT_REFRESH_TOKEN, { expiresIn: '7000s' });
    refreshTokens.push(refreshToken);

    return refreshToken;
} 

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, err => {
        if (err) return res.sendStatus(401);
        next();
    });
}

const refreshToken = (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken === null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);  
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, decoded) => {
        if (err) return res.sendStatus(403);    
        const accessToken = generateAccessToken({ login: decoded.login });
        res.json({
          status: 'ok',
          payload: accessToken,
        });
    });
}


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    authenticateToken,
    refreshToken,
}