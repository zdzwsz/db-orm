var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./config');
var morgan = require('morgan');


// 设置superSecret 全局参数
app.set('superSecret', config.jwtsecret);
// 使用 body parser 将post参数及URL参数可以通过 req.body或req.query 拿到请求参数
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// 使用 morgan 将请求日志输出到控制台
app.use(morgan('dev'));
//根路径处理结果
app.get('/', function (req, res) {
    res.send('JWT 授权访问的API路径 http://localhost:' + config.network.port + '/api');
});

// 用户授权路径，返回JWT 的 Token 验证用户名密码
app.post('/auth', function (req, res) {
    var name = req.body.name
    var password = req.body.password
    if (name != "admin") {
        res.json({ success: false, message: '未找到授权用户' });
    } else {
        if ("123456" != password) {
            res.json({ success: false, message: '用户密码错误' });
        } else {
            var token = jwt.sign({"user":"admin"}, app.get('superSecret'), {
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
        // 解码 token (验证 secret 和检查有效期（exp）)
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: '无效的token.' });
            } else {
                // 如果验证通过，在req中写入解密结果
                req.decoded = decoded;
                //console.log(decoded)  ;
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
console.log('JWT测试服务已经开启地址： http://localhost:' + config.network.port);

