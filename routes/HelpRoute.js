var router = require('express').Router();
router.get("/",function (req,res) {
    res.send("服务启动成功")
});

module.exports = router;