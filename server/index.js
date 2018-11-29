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
    res.send('JWT 授权访问的API路径 http://localhost:' + config.network.port + '/api');
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
            var token = jwt.sign({"user":"admin"}, config.jwtsecret, {
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

//  localhost:端口号/api 路径路由定义
var apiRoutes = express.Router();
apiRoutes.use(function (req, res, next) {
    // 拿取token 数据 按照自己传递方式写
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
});

//API跟路径返回内容
apiRoutes.get('/', function (req, res) {
    res.json({ message:  '  欢迎使用API' });
});
//获取所有用户数据
apiRoutes.get('/users', function (req, res) {
    res.json({name:"admin",password:"123456"});
});
// 注册API路由
app.use('/api', apiRoutes);

//开启服务
app.listen(config.network.port);
console.log('服务已经开启地址： http://localhost:' + config.network.port);