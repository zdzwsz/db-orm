const express = require('express');
const router = express.Router();

const filter = require('./JwtFilter');
var MetaManager = require('./../meta/MetaManager');

const serviceManager = require('./../meta/ServiceManager');
serviceManager.init();

router.use(function (req, res, next) {
    filter(req, res, next);
})

router.post('/:service/:entity/:action', function (req, res) {
    service = req.params.service;
    entity = req.params.entity;
    action = req.params.action;
    console.log("post: " + service + "," + entity + "," + action);
    var metaManager = new MetaManager();
    metaManager.on("meta_over",function(message){
        res.json(message)
    })
    metaManager.service(service, entity, action, req);
})

router.post('/get', function (req, res) {
    console.log("get all service:");
    res.json({ name: "admin", password: "123456" });
})

router.post('/:service/add', function (req, res) {
    console.log("create service");
    service = req.params.service;
    res.json(serviceManager.service(service, 'add'));
})

router.post('/:service/delete', function (req, res) {
    console.log("delete service");
    service = req.params.service;
    res.json(serviceManager.service(service, 'delete'));
})

router.post('/', function (req, res) {
    res.json({ 'message': "welcome use db-orm" });
})

module.exports = router