var fs = require("fs")
var path = require('path');
var ResCode = require('./../ResCode')
var config = require('./../config');
var TableMeta = require("./../db/TableMeta")
var EventEmitter = require('events').EventEmitter;
const logger = require("./../log")
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
            var json = ResCode.data(JSON.parse(data));
            this.emit(this.eventName, json)
        } catch (e) {
            logger.error(e);
            this.emit(this.eventName, ResCode.error(ResCode.MetaGet, e));
        }
    }

    add(service, name, req) {
        var data = req.body;
        if (data == null || typeof (data) != 'object' || typeof (data.tableName) == 'undefined') {
            this.emit(this.eventName, ResCode.error(ResCode.MetaAddNull));
        }
        var file = this.getFileName(service, name);
        var table = TableMeta.load(data);
        var _this = this;
        table.create(function (e) {
            if (e) {
                logger.error(e);
                _this.emit(_this.eventName, ResCode.error(ResCode.MetaAdd, e))
               
            } else {
                fs.writeFileSync(file, JSON.stringify(data));
                _this.emit(_this.eventName, ResCode.OK)
            }
        });
    }

    update(service, name, req) {
        var data = req.body;
        if (data == null || typeof (data) != 'object') {
            this.emit(this.eventName, ResCode.error(ResCode.MetaUpdateNull));
        }
        var file = this.getFileName(service, name);
        var table = TableMeta.loadMeta(file);
        var _this = this;
        table.update(data,function(e){
            if (e) {
                logger.error(e);
                _this.emit(_this.eventName, ResCode.error(ResCode.MetaUpdate, e))
               
            } else {
                fs.writeFileSync(file, JSON.stringify(table.getJsonData()));
                _this.emit(_this.eventName, ResCode.OK)
            }
        })
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
            logger.error(e)
            this.emit(_this.eventName, ResCode.error(ResCode.MetaDelete, e))
        }
    }

    getFileName(service, name) {
        var filepath = this.storePath + "/" + service + "/" + name + ".json"
        return filepath;
    }

}

module.exports = MetaManager;