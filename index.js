var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var MetaRouter = require('./routes/MetaRoute');
var DataRouter = require('./routes/DataRoute');
const auth = require('./authentication');
var log4js = require('log4js');
var logger = require('./log');
var fs = require("fs");


class WebServer {
    constructor(config) {
        this.app = express();
        this.config = config;
        this.server = null;
        var watcher = null;
    }

    validate() {
        if (!this.config || this.config == null) {
            logger.error("please config file <config.js>");
            return false;
        }
        var ok = true;
        if (this.config.modules == null || this.config.modules == "") {
            logger.error("please config file <config.js>,set modules value");
            ok = false;
        } else {
            if (!fs.existsSync(this.config.modules)) {
                try {
                    fs.mkdirSync(this.config.modules)
                } catch (e) {
                    logger.error(e);
                    ok = false;
                }
            }
        }
        if (this.config.user == null) {
            logger.error("please config file <config.js>,set user name and user password");
            ok = false;
        }
        
        if (this.config.database == null) {
            logger.error("please config file <config.js>,set database value");
            ok = false;
        }
        return ok
    }

    init() {
        this.app.all('*', function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "x-access-token,Content-Type");
            res.header("Access-Control-Allow-Methods","POST,GET,OPTIONS,HEAD");
            if(req.method.toLocaleLowerCase() === 'options'){
                res.status(204);
                return res.json({});
            }else{
                next();
            }
        });
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(log4js.connectLogger(logger, { level: 'auto' }));
        this.app.use('/auth', auth.getToken);
        //this.app.use('/metaAuth', auth.intercept);
        this.app.use('/metaAuth', auth.getMetaToken);
        var metaRouter = new MetaRouter(auth.metaIntercept);
        this.app.use('/meta', metaRouter.router);
        var dataRouter = new DataRouter(auth.intercept);
        this.app.use('/data', dataRouter.router);
        
    }

    start() {
        if (this.validate()) {
            this.init();
            this.server = this.app.listen(this.config.network.port);
            logger.info("server start at:" + this.config.network.port);
            this.watcher = require("./watch/ModulesWatch");
        }
    }

    stop() {
        this.server.close();
        this.watcher.close();
        //this.watcher = null;
        //this.server = null;
    }
}

var webServer = new WebServer(config);
webServer.start();
module.exports = webServer;