const DataManager = require('../data/DataManager');
const processManager = require('../data/ProcessManager');
const logger = require("../log")
require("./DateUtil");
var Router = require('express').Router;

class DataRoute{

    constructor(intercept) {
        this.intercept = intercept;
        this.router = Router();
        this.init();
        processManager.init();
    }

    init(){
       //this.filter();
       this.postData();
       this.postLogic();
    }

    filter(){
        this.router.use(this.intercept);
    }

    postData(){
        this.router.post('/:service/:entity/:action', function (req, res) {
            let service = req.params.service;
            let entity = req.params.entity;
            let action = req.params.action;
            logger.info("post data: " + service + "," + entity + "," + action);
            var dataManager = new DataManager();
            dataManager.end(function(message){
                res.json(message)
            })
            dataManager.service(service, entity, action, req);
        })
    }

    postLogic(){
        this.router.post('/:service/:action', function (req, res) {
            let service = req.params.service;
            let action = req.params.action;
            logger.info("post Logic: " + service + "," + action);
            processManager.service(service, action,req,res);
        })
    }
}

module.exports = DataRoute