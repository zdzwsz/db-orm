const express = require('express')
const router = express.Router()

const filter = require('./JwtFilter')
 
router.use(function (req, res, next){
    filter(req, res, next)
})

router.post('/:name/:action', function (req, res) {
    console.log("name:" + req.params.name)
    console.log("action:" + req.params.action)
    res.json({name:"admin",password:"123456"});
})

router.post('/get', function (req, res) {
    console.log("get all service:")
    res.json({name:"admin",password:"123456"});
})

router.post('/', function (req, res) {
    res.json({'message':"welcome use db-orm"});
})
 
module.exports = router