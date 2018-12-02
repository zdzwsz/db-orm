const express = require('express');
const router = express.Router();

const filter = require('./JwtFilter');
const metaManager = require('./../meta/MetaManager');
metaManager.init();
router.use(function (req, res, next){
    filter(req, res, next);
})

router.post('/:service/:entity/:action', function (req, res) {
    service = req.params.service;
    entity = req.params.entity;
    action = req.params.action;
    console.log("post: "+service +","+ entity +","+ action);
    res.json(metaManager.service(service,entity,action,req));
})

router.post('/get', function (req, res) {
    console.log("get all service:");
    res.json({name:"admin",password:"123456"});
})

router.post('/:service/add', function (req, res) {
    console.log("create service");
    service = req.params.service;
    res.json({name:service,message:"ok"});
})

router.post('/', function (req, res) {
    res.json({'message':"welcome use db-orm"});
})
 
module.exports = router