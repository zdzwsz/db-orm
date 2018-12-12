const MetaManager = require('./../meta/MetaManager');
const serviceManager = require('./../meta/ServiceManager');
const logger = require("./../log")
var Router = require('express').Router;

class MetaRoute{

    constructor(intercept) {
        this.intercept = intercept;
        this.router = Router();
        serviceManager.init();
        this.init();
    }

    init(){
       this.filter();
       this.postEntity();
       this.postService();
       this.postGetAllService();
    }

    filter(){
        this.router.use(this.intercept);
    }

    postEntity(){
        this.router.post('/:service/:entity/:action', function (req, res) {
            let service = req.params.service;
            let entity = req.params.entity;
            let action = req.params.action;
            logger.info("post: " + service + "," + entity + "," + action);
            var metaManager = new MetaManager();
            metaManager.end(function(message){
                res.json(message)
            })
            metaManager.service(service, entity, action, req);
        })
    }

    postService(){
        this.router.post('/:service/add', function (req, res) {
            logger.info("create service");
            let service = req.params.service;
            res.json(serviceManager.service(service, 'add'));
        });
        
        this.router.post('/:service/delete', function (req, res) {
            logger.info("delete service");
            let service = req.params.service;
            res.json(serviceManager.service(service, 'delete'));
        });
    }
    
    postGetAllService(){
        this.router.post('/get', function (req, res) {
            logger.info("get all service:");
            res.json({ name: "", password: "" });
        });
        this.router.post('/', function (req, res) {
            res.json({ 'message': "welcome use db-orm" });
        });
    }

}

module.exports = MetaRoute