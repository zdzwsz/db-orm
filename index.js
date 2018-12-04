var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./config');
var morgan = require('morgan');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function (req, res) {
    res.send('JWT 授权访问服务路径 http://ip:' + config.network.port + '/data');
});

app.post('/auth', function (req, res) {
    var name = req.body.name
    var password = req.body.password
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
});

const metaRouter = require('./routes/MetaRoute');
app.use('/meta', metaRouter);

//开启服务
var server = app.listen(config.network.port);
console.log('服务已经开启地址： http://localhost:' + config.network.port);

module.exports = server;