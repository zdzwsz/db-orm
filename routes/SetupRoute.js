
const logger = require("../log")
var Router = require('express').Router;


class SetupRoute {

    constructor(intercept) {
        this.intercept = intercept;
        this.router = Router();
        this.init();
    }

    init() {
        let _this = this;
        this.router.post('/config', function (req, res) {
            var data = req.body;
            if (_this.validate(data)) {
                fs.writeFileSync('./config.json', JSON.stringify(data));
                res.json({ code: "000", message: 'ok' });
            }
            res.json({ code: "001", message: 'error' });
        });

        this.router.post('/restart', function (req, res) {
            try {
                var knexManager = require("./../db/KnexManager");
                var webServer = require('../index');
                knexManager.destroy(0);
                webServer.stop();
                res.json({ code: "000", message: 'ok' });
                setTimeout(() => {
                    webServer.start();
                }, 1000);
            } catch (e) {
                res.json({ code: "001", message: e.message });
            }

        });
    }

    filter() {
        this.router.use(this.intercept);
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
            if (!fs.existsSync(this.config.modules)) {
                try {
                    fs.mkdirSync(this.config.modules)
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