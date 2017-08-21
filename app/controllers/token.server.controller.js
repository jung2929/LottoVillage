var jwt = require('jsonwebtoken');

exports.check = function (req) {
    const token = req.headers["x-access-token"];

    if (!token) return false;

    try {
        jwt.verify(token, 'developmentTokenSecret');
        return true;
    } catch (err) {
        return false;
    }
};