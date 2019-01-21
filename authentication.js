
const logger = require("./log");
var jwt = require('jsonwebtoken');
var UUID = require('uuid');
var ID = UUID.v1();

function getServerToken(req, res, user, time) {
    let name = req.body.name;
    let password = req.body.password;
    if(!user){
        console.log("config model......");
        if(name =="superman" && password =="123456"){
            res.json({
                success: true,
                message: 'init',
                token: ID
            });
        }else{
            res.json({ success: false, message: '请初始化服务！' });
        }
        return;
    }
    if (name != user.name) {
        res.json({ success: false, message: '未找到授权用户' });
    } else {
        if (user.password != password) {
            res.json({ success: false, message: '用户密码错误' });
        } else {
            time = time || 60 * 60 * 24
            var token = jwt.sign({ "user": "admin" }, user.secret, {
                expiresIn: time
            });
            res.json({
                success: true,
                message: '请使用您的授权码',
                token: token
            });
        }
    }
}


function serverIntercept(req, res, next, secret) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        if(!secret){
            if(token == ID){
                next();
            }else{
                return res.json({ success: false, message: '无效的token.' });
            }
        }else{
            jwt.verify(token, secret, function (err, user) {
                if (err) {
                    return res.json({ success: false, message: '无效的token.' });
                } else {
                    req.user = user;
                    logger.info(user.user + " access api web");
                    next();
                }
            });
        }
    } else {
        return res.status(403).send({
            success: false,
            message: '没有找到token.'
        });
    }
}

var authentication = {
    config:null,
    getToken: function (req, res) {
        getServerToken(req, res, this.config.user);
    },

    intercept: function (req, res, next) {
        serverIntercept(req, res, next, this.config.user.secret);
    },

    getMetaToken: function (req, res) {
        getServerToken(req, res, this.config.meta, 60 * 60 * 24);
    },

    metaIntercept: function (req, res, next) {
        serverIntercept(req, res, next, this.config.meta.secret);
    },
    init:function(config){
        this.config = config;
     }
}

module.exports = authentication;