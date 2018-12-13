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
        this.eventName = "DataManager_end_event";
        
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
            var metaJson = this.getMetaJson(service, name);
            let ServiceClass = this.getServiceClass(service, name);
            var service = Reflect.construct(ServiceClass, [metaJson.tableName, metaJson.primary]);
            let _this = this;
            Reflect.apply(service[actionName], service, this.getParameter(data,_this));
        } else {
            this.emit(_this.eventName, ResCode.error(ResCode.DataValidateException, validateResult.message))
        }
    }

    getServiceClass(service, name){
        name = name.substring(0,1).toUpperCase()+name.substring(1);
        let filepath = this.storePath + "/" + service + "/" + name + "Service.js";
        let serviceClass = DataManager.classMap.get(filepath);
        if(serviceClass != null)return serviceClass;
        if(fs.existsSync(filepath)){
            logger.info("load service...... "+filepath);
            serviceClass = require(filepath);
            if(!serviceClass instanceof BasicService){
                logger.error(filepath +" is not a service,use BasicService!");
                serviceClass = BasicService;
            }
        }
        else{
            serviceClass = BasicService;
        }
        DataManager.classMap.set(filepath,serviceClass);
        return serviceClass;
    }

    getMetaJson(service, name) {
        var filepath = this.storePath + "/" + service + "/" + name + ".json"
        return require(filepath);
    }

}
DataManager.classMap = new Map();

module.exports = DataManager;