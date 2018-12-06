var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var morgan = require('morgan');
var MetaRouter = require('./routes/MetaRoute');
const auth = require('./authentication');

class WebServer {
    constructor(config) {
        this.app = express();
        this.config = config;
        this.server = null;
        this.init();
    }

    validate() {
        if (!this.config || this.config == null) {
            console.log("please config file <config.js>");
            return false;
        }
        var ok = true;
        if (this.config.users == null) {
            console.log("please config file <config.js>,set user name and user password");
            ok = false;
        }
        if (this.config.jwtsecret == null) {
            console.log("please config file <config.js>,set jwtsecret value");
            ok = false;
        }
        if (this.config.dbstore == null) {
            console.log("please config file <config.js>,set dbstore value");
            ok = false;
        }
        if (this.config.database == null) {
            console.log("please config file <config.js>,set database value");
            ok = false;
        }
        return ok
    }

    init() {
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(morgan('dev'));
        this.app.use('/auth', auth.getToken);
        var metaRouter = new MetaRouter(express.Router(), auth.intercept);
        this.app.use('/meta', metaRouter.router);
    }

    start() {
        if (this.validate()) {
            this.server = this.app.listen(this.config.network.port);
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