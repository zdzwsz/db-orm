const Reply = require("./Reply");
const ProcessLoader = require("./ProcessLoader");
const DB = require("./DB");
const code = require("./ReplyCode.json");
const logger = require("./../log");
const LogicError = require("./LogicError");
var processManager = {

    init() {
        ProcessLoader.init();
    },

    service(service, action, req, res) {
        let data = req.body;
        let Process = ProcessLoader.loadProcess(service, action);
        Reflect.apply(Process, null, this.getParameter(data, res,Process.length));
    },

    getParameter(json, res, number) {
        var parameter = []
        for (let i = 0; i < 10000; i++) {
            if (json["p" + i]) {
                parameter.push(json["p" + i])
            } else {
                break;
            }
        }
        if(typeof(json) =="object" && JSON.stringify(json) != '{}' && parameter.length==0){
            parameter.push(json);
        }
        while(number - 2 > parameter.length){
            parameter.push(null);
        }
        const db = new DB();
        parameter.push(db);
        const reply = new Reply();
        reply.end(function (message) {
            if (typeof (message) == "object") {
                if (message.code === code.ok[0]) {
                    res.json(message);
                    return;
                }else if(message.code === code.error){
                    logger.error("error code:"+message.code + " message:"+ message.data.message);
                    throw message.data;
                }
            }
            logger.error(message);
            res.json(message);
            throw new LogicError(message);
        })
        parameter.push(reply);
        return parameter;
    }

}

module.exports = processManager;