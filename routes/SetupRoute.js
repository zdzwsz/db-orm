
const logger = require("../log")
var Router = require('express').Router;
var fs = require("fs");
var path = require('path');
var knexManager = require("./../db/KnexManager");
let configPath = path.resolve('config.json')
var UUID = require('uuid');

class SetupRoute {

    constructor(intercept) {
        this.intercept = intercept;
        this.router = Router();
        this.filter();
        this.init();
        this.restart=this.restart.bind(this);
    }

    init() {
        let _this = this;
        this.router.post('/config', function (req, res) {
            var data = req.body;
            if (_this.validate(data)) {
                if(!data.user.secret){
                    data.user.secret = UUID.v4();
                }
                if(!data.meta.secret){
                    data.meta.secret = UUID.v4();
                }
                fs.writeFileSync('./config.json', JSON.stringify(data));
                _this.restart(res);
                return;
            }
            res.json({ code: "001", message: 'error' });
        });

        this.router.post('/restart', function (req, res) {
            try {
               _this.restart(res);
            } catch (e) {
                res.json({ code: "001", message: e.message });
            }

        });

        this.router.post('/pwd', function (req, res) {
            try {
                var data = req.body;
                let config = require("../config");
                if(!data.user && !data.meta){
                    res.json({ code: "001", message: '更新密码需要输入旧密码和新密码' });
                        return;
                }
                if (data.user) {
                    if (config.user.password == data.user.oldPassword) {
                        config.user.password = data.user.newPassword;
                    } else {
                        res.json({ code: "001", message: '你输入的密码错误' });
                        return;
                    }
                }
                if (data.meta) {
                    if (config.meta.password == data.meta.oldPassword) {
                        config.meta.password = data.meta.newPassword;
                    } else {
                        res.json({ code: "001", message: '你输入的密码错误' });
                        return;
                    }
                }
                fs.writeFileSync(configPath, JSON.stringify(config));
                _this.clareCache();
                var webServer = require('../index');
                webServer.reloadConfig();
                res.json({ code: "000", message: 'ok' });
            } catch (e) {
                res.json({ code: "009", message: e.message });
            }
        });
    }

    filter() {
        this.router.use(this.intercept);
    }

    clareCache(){
        let configPath = path.resolve('./config.json');
        require.cache[configPath] = null;
        let modulesPath = path.resolve('./ModulesPath.js');
        require.cache[modulesPath] = null;
    }

    restart(res){
        var webServer = require('../index');
        knexManager.destroy(0);
        webServer.stop();
        this.clareCache();
        setTimeout(() => {
            webServer.start();
            res.json({ code: "000", message: 'ok' });
        }, 1000);
    }

    validate(config) {
        if (!config || config == null) {
            logger.error("please config file <config.js>");
            return false;
        }
        var ok = true;
        if (config.modules == null || config.modules == "") {
            logger.error("please config file <config.js>,set modules value");
            ok = false;
        } else {
            if (!fs.existsSync(config.modules)) {
                try {
                    fs.mkdirSync(config.modules)
                } catch (e) {
                    logger.error(e);
                    ok = false;
                }
            }
        }
        if (config.user == null) {
            logger.error("please config file <config.js>,set user name and user password");
            ok = false;
        }

        if (config.database == null) {
            logger.error("please config file <config.js>,set database value");
            ok = false;
        }
        return ok
    }
}

module.exports = SetupRoute