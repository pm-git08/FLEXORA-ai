const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, 'secretKey', { expiresIn: '3d' }); // Replace 'secretKey' later with env
};

module.exports = generateToken;
