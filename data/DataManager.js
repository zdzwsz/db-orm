var fs = require("fs")
var path = require('path');
var ResCode = require('./../ResCode')
var BasicService = require("./../db/BasicService")
var EventEmitter = require('events').EventEmitter;
const logger = require("./../log")

class DataManager extends EventEmitter {

    constructor() {
        super();
        this.init();
        this.eventName = "DataManager_end_event"
    }

    end(callback) {
        this.once(this.eventName, callback);
    }

    init() {
        this.storePath = path.join(__dirname, "../modules");
    }

    service(service, name, action, req) {
        this.action(action,service, name, req);
    }

   
    //验证提交数据
    validate(actionName, service, name, data) {
        return { ok: true, message: "" };
    }

    respond(e,result){
       
    }

    getParameter(json,_this){
        var parameter = []
        for(let i = 0;i<10000;i++){
            if(json["p"+i]){
                parameter.push(json["p"+i])
            }else{
                break;
            }
        }
        parameter.push(function(e,result){
            if (e) {
                logger.error(e);
                _this.emit(_this.eventName, ResCode.error(ResCode.DataException, e))
            } else {
                if(result){
                    _this.emit(_this.eventName, ResCode.data(result))
                }else{
                    _this.emit(_this.eventName, ResCode.OK)
                }
            }
        })
        return parameter;
    }

    action(actionName, service, name, req) {
        let data = req.body;
        let validateResult = this.validate(actionName, service, name, data);
        if (validateResult.ok) {
            var tableMeta = this.getTableMeta(service, name);
            var basicService = Reflect.construct(BasicService, [tableMeta.tableName, tableMeta.primary]);
            let _this = this;
            Reflect.apply(basicService[actionName], basicService, this.getParameter(data,_this));
        } else {
            this.emit(_this.eventName, ResCode.error(ResCode.DataValidateException, validateResult.message))
        }
    }

    getTableMeta(service, name) {
        var filepath = this.storePath + "/" + service + "/" + name + ".json"
        return require(filepath);
    }

}

module.exports = DataManager;