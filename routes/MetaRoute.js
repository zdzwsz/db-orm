const MetaManager = require('./../meta/MetaManager');
const categoryManager = require('./../meta/CategoryManager');
const logger = require("./../log")
var Router = require('express').Router;

class MetaRoute{

    constructor(intercept) {
        this.intercept = intercept;
        this.router = Router();
        categoryManager.init();
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
            res.json(categoryManager.service(service, 'add'));
        });
        
        this.router.post('/:service/delete', function (req, res) {
            logger.info("delete service");
            let service = req.params.service;
            res.json(categoryManager.service(service, 'delete'));
        });

        this.router.post('/:service/entity', function (req, res) {
            logger.info("get entity");
            let service = req.params.service;
            res.json(categoryManager.getEntity(service));
        });

        this.router.post('/:service/service', function (req, res) {
            logger.info("get Service");
            let service = req.params.service;
            res.json(categoryManager.getService(service));
        });
    }
    
    postGetAllService(){
        this.router.post('/all', function (req, res) {
            res.json(categoryManager.all());
        });
        this.router.post('/', function (req, res) {
            res.json({ 'message': "welcome use db-orm" });
        });
    }

}

module.exports = MetaRoute