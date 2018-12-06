var fs = require("fs")
var path = require('path');
var ResCode = require('./../ResCode')
var config = require('./../config');
var TableMeta = require("./../db/TableMeta")
var EventEmitter = require('events').EventEmitter;
class MetaManager extends EventEmitter {

    constructor() {
        super();
        this.init();
        this.eventName = "MetaManager_end_event"
    }

    end(callback){
        this.once(this.eventName,callback);
    }

    init() {
        this.storePath = config.dbstore;
        if (this.storePath.indexOf(".") == 0) {
            this.storePath = path.join(__dirname, this.storePath);
        }
        if (!fs.existsSync(this.storePath)) {
            fs.mkdirSync(this.storePath);
        }
    }

    service(service, name, action, req) {
        if (action == "get") {
            this.get(service, name);
        } else if (action == "add") {
            console.log("1================:"+new Date().getTime())
            this.add(service, name, req);
        } else if (action == 'delete') {
            this.delete(service, name);
        } else if (action == 'update') {
            this.update(service, name, req);
        }
    }

    get(service, name) {
        var file = this.getFileName(service, name);
        try {
            var data = fs.readFileSync(file, 'utf-8');
            //console.log(data);
            var json = ResCode.data(JSON.parse(data));
            this.emit(this.eventName, json)
        } catch (e) {
            console.log(e);
            this.emit(this.eventName, ResCode.error(ResCode.MetaGet, e));
        }
    }

    add(service, name, req) {
        var data = req.body;
        if (data == null || typeof (data) != 'object' || typeof (data.tableName) == 'undefined') {
            this.emit(this.eventName, ResCode.error(ResCode.MetaAddNull));
        }
        //console.log("data is :" + data);
        var file = this.getFileName(service, name);
        var table = TableMeta.load(data);
        var _this = this;
        table.create(function (e) {
            if (e) {
                console.log(e);
                _this.emit(_this.eventName, ResCode.error(ResCode.MetaAdd, e))
               
            } else {
                fs.writeFileSync(file, JSON.stringify(data));
                _this.emit(_this.eventName, ResCode.OK)
                console.log("3================:"+new Date().getTime())
            }
        });
    }

    update(service, name, req) {
        this.add(service, name, req);
    }

    delete(service, name) {
        var file = this.getFileName(service, name);
        try {
            var _this = this;
            var table = TableMeta.loadMeta(file);
            table.delete(function () {
                fs.unlinkSync(file);
                _this.emit(_this.eventName, ResCode.OK)
            });
        } catch (e) {
            console.log(e)
            this.emit(_this.eventName, ResCode.error(ResCode.MetaDelete, e))
        }
    }

    getFileName(service, name) {
        var filepath = this.storePath + "/" + service + "/" + name + ".json"
        return filepath;
    }

}

module.exports = MetaManager;