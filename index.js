var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var MetaRouter = require('./routes/MetaRoute');
var DataRouter = require('./routes/DataRoute');
const auth = require('./authentication');
var log4js=require('log4js');
var logger=require('./log');

class WebServer {
    constructor(config) {
        this.app = express();
        this.config = config;
        this.server = null;
        this.init();
    }

    validate() {
        if (!this.config || this.config == null) {
            logger.error("please config file <config.js>");
            return false;
        }
        var ok = true;
        if (this.config.users == null) {
            logger.error("please config file <config.js>,set user name and user password");
            ok = false;
        }
        if (this.config.jwtsecret == null) {
            logger.error("please config file <config.js>,set jwtsecret value");
            ok = false;
        }
        if (this.config.database == null) {
            logger.error("please config file <config.js>,set database value");
            ok = false;
        }
        return ok
    }

    init() {
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(log4js.connectLogger(logger, { level: 'auto' }));
        this.app.use('/auth', auth.getToken);
        var metaRouter = new MetaRouter(auth.intercept);
        this.app.use('/meta', metaRouter.router);
        var dataRouter = new DataRouter(auth.intercept);
        this.app.use('/data', dataRouter.router);
    }

    start() {
        if (this.validate()) {
            this.server = this.app.listen(this.config.network.port);
            logger.info("server start at:"+this.config.network.port);
        }
    }

    stop() {
        this.server.stop();
        this.server = null;
    }
}

var webServer = new WebServer(config);
webServer.start();
module.exports = webServer.server;