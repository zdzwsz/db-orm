var config = require('./config');
const logger = require("./log");
var jwt = require('jsonwebtoken');
var authentication = {
    getToken : function(req, res){
        let name = req.body.name;
        let password = req.body.password;
        if (name != config.users.name) {
            res.json({ success: false, message: '未找到授权用户' });
        } else {
            if (config.users.password != password) {
                res.json({ success: false, message: '用户密码错误' });
            } else {
                var token = jwt.sign({ "user": "admin" }, config.jwtsecret, {
                    expiresIn: 60 * 60 * 24// 授权时效24小时
                });
                res.json({
                    success: true,
                    message: '请使用您的授权码',
                    token: token
                });
            }
        }
    },
    intercept : function(req,res,next){
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, config.jwtsecret, function (err, user) {
                if (err) {
                    return res.json({ success: false, message: '无效的token.' });
                } else {
                    req.user = user;
                    logger.info(user.user + " access api web");
                    next(); 
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: '没有找到token.'
            });
        }
    }

}

module.exports = authentication;