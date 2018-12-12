const DataManager = require('../data/DataManager');
const logger = require("../log")
var Router = require('express').Router;

class DataRoute{

    constructor(intercept) {
        this.intercept = intercept;
        this.router = Router();
        this.init();
    }

    init(){
       this.filter();
       this.postData();
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
}

module.exports = DataRoute