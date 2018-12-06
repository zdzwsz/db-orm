const MetaManager = require('./../meta/MetaManager');
const serviceManager = require('./../meta/ServiceManager');

class MetaRoute{

    constructor(router,intercept) {
        this.router = router;
        this.intercept = intercept;
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
            console.log("post: " + service + "," + entity + "," + action);
            var metaManager = new MetaManager();
            metaManager.end(function(message){
                res.json(message)
            })
            metaManager.service(service, entity, action, req);
        })
    }

    postService(){
        this.router.post('/:service/add', function (req, res) {
            console.log("create service");
            let service = req.params.service;
            res.json(serviceManager.service(service, 'add'));
        });
        
        this.router.post('/:service/delete', function (req, res) {
            console.log("delete service");
            let service = req.params.service;
            res.json(serviceManager.service(service, 'delete'));
        });
    }
    
    postGetAllService(){
        this.router.post('/get', function (req, res) {
            console.log("get all service:");
            res.json({ name: "", password: "" });
        });
        this.router.post('/', function (req, res) {
            res.json({ 'message': "welcome use db-orm" });
        });
    }

}

module.exports = MetaRoute