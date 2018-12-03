var jwt = require('jsonwebtoken');
var config = require('./../config');

function filter(req,res,next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.jwtsecret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: '无效的token.' });
            } else {
                req.decoded = decoded;
                next(); //继续下一步路由
            }
        });
    } else {
        // 没有拿到token 返回错误 
        return res.status(403).send({
            success: false,
            message: '没有找到token.'
        });
    }
}

module.exports = filter
  