const DataManager = require('../data/DataManager');
const processManager = require('../data/ProcessManager');
const logger = require("../log")
require("./DateUtil");
var Router = require('express').Router;
let serviceStatus =null;

class DataRoute {

    constructor(intercept,serverStatus) {
        this.intercept = intercept;
        this.router = Router();
        this.init();
        processManager.init();
        serviceStatus = serverStatus;
        this.serverFilter.bind(this);
    }

    init() {
        this.filter();
        this.postData();
        this.postLogic();
    }

    filter() {
        this.router.use(this.intercept);
        this.router.use(this.serverFilter);
    }

    postData() {
        this.router.post('/:service/:entity/:action', function (req, res) {
            let service = req.params.service;
            let entity = req.params.entity;
            let action = req.params.action;
            logger.info("post data: " + service + "," + entity + "," + action);
            var dataManager = new DataManager();
            dataManager.end(function (message) {
                res.json(message)
            })
            dataManager.service(service, entity, action, req);
        })
    }

    postLogic() {
        this.router.post('/:service/:action', function (req, res) {
            let service = req.params.service;
            let action = req.params.action;
            logger.info("post Logic: " + service + "," + action);
            processManager.service(service, action, req, res);
        })
    }

    serverFilter(req, res, next) {
        let strs = req.path.split("/");
        if(strs.length>1 && strs[1] !=""){
          if(serviceStatus.get(strs[1])==true){
              next();
          }else{
            res.json({code:'001',message:'服务未激活'});
            return;
          }
        }else{
            next();
        }
    }
}

 

module.exports = DataRoute