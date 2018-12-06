var config = require('./config');
var jwt = require('jsonwebtoken');
var authentication = {
    getToken : function(req, res){
        let name = req.body.name;
        let password = req.body.password;
        if (name != config.usses.name) {
            res.json({ success: false, message: '未找到授权用户' });
        } else {
            if (config.usses.password != password) {
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
    filter : function(req,res,next){
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

}

module.exports = authentication;