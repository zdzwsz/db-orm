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

        this.router.post('/:service/ws', function (req, res) {
            logger.info("get Service");
            let service = req.params.service;
            res.json(categoryManager.getService(service));
        });

        this.router.post('/:service/gcode', function (req, res) {
            logger.info("get Service code");
            let service = req.params.service;
            let name = req.body.name;
            res.json(categoryManager.getWsCode(service,name));
        });

        this.router.post('/:service/scode', function (req, res) {
            logger.info("set Service code");
            let service = req.params.service;
            let name = req.body.name;
            let base64 = req.body.code;
            res.json(categoryManager.setWsCode(service,name,base64));
        });

        this.router.post('/:service/dcode', function (req, res) {
            logger.info("delete Service code");
            let service = req.params.service;
            let name = req.body.name;
            res.json(categoryManager.delWsCode(service,name));
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