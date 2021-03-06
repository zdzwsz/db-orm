var express = require('express');
var bodyParser = require('body-parser');
var MetaRouter = require('./routes/MetaRoute');
var DataRouter = require('./routes/DataRoute');
var SetupRouter = require('./routes/SetupRoute');

var log4js = require('log4js');
var logger = require('./log');
var fs = require("fs");
var path = require('path');


class WebServer {
    constructor(port) {
        this.port = port;
        this.server = null;
    }

    static getWebServer(parameter) {
        let config = null;
        if (!fs.existsSync("./config.json")) {
            config = {
                "user": {},
                "modules": "",
                "database": {},
                "meta": {}
            }
            fs.writeFileSync('./config.json',JSON.stringify(config));
        }
        let port = 8088;
        if(parameter.length >2 && parameter[0] == "p"){
            port = parseInt(parameter[0]);
        }
        return new WebServer(port)
    }

    cors(){
        this.app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "x-access-token,Content-Type");
            res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,HEAD");
            if (req.method.toLocaleLowerCase() === 'options') {
                res.status(204);
                return res.json({});
            } else {
                next();
            }
        });
    }

    reloadConfig(){
        this.config = require('./config.json');
        this.auth.init(this.config)
    }

    loadConfig(){
        this.reloadConfig();
    }

    init() {
        this.auth = require('./authentication');
        this.loadConfig();
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(log4js.connectLogger(logger, { level: 'auto' }));
    }

    tokenService(){
        this.app.use('/metaAuth', this.auth.getMetaToken);
        this.app.use('/auth', this.auth.getToken);
    }

    dataService(){
        var metaRouter = new MetaRouter(this.auth.metaIntercept);
        this.app.use('/meta', metaRouter.router);
        var dataRouter = new DataRouter(this.auth.intercept,metaRouter.getServerStatus());
        this.app.use('/data', dataRouter.router);
    }

    setupService(){
        var setupRouter = new SetupRouter(this.auth.metaIntercept);
        this.app.use('/setup', setupRouter.router);
    }

    help(){
        var helpRouter = require('./routes/HelpRoute');
        this.app.use('/', helpRouter);
    }

    start() {
        this.app = express();
        this.cors();
        this.init();
        this.tokenService();
        this.dataService();
        this.setupService();
        this.help();
        this.server = this.app.listen(this.port);
        logger.info("server start at:" + this.port);
        if(this.config.modules){
            this.watcher = require("./watch/ModulesWatch");
        }
    }

    stop() {
        this.server.close();
        this.app =null;
        this.auth =null;
        if(this.watcher){
            this.watcher.close();
        }
    }
}
var arguments = process.argv.splice(2);
var webServer = WebServer.getWebServer(arguments);
webServer.start();
module.exports = webServer;