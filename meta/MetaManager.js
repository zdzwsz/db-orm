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
            return this.delete(service, name);
        } else if (action == 'update') {
            return this.update(service, name, req);
        }
    }

    get(service, name) {
        var file = this.getFileName(service, name);
        try {
            var data = fs.readFileSync(file, 'utf-8');
            console.log(data);
            var json = ResCode.data(JSON.parse(data));
            this.emit("meta_over", json)
        } catch (e) {
            console.log(e);
            this.emit("meta_over", ResCode.error(ResCode.MetaGet, e));
        }
    }

    add(service, name, req) {
        var data = req.body;
        if (data == null || typeof (data) != 'object' || typeof (data.tableName) == 'undefined') {
            this.emit("meta_over", ResCode.error(ResCode.MetaAddNull));
        }
        console.log("data is :" + data);
        var file = this.getFileName(service, name);
        var table = TableMeta.load(data);
        var _this = this;
        table.create(function (e) {
            if (e) {
                console.log(e);
                this.emit("meta_over", ResCode.error(ResCode.MetaAdd, e))
            } else {
                fs.writeFileSync(file, JSON.stringify(data));
                _this.emit("meta_over", ResCode.OK)
            }
        });
    }

    update(service, name, req) {
        return this.add(service, name, req);
    }

    delete(service, name) {
        var file = this.getFileName(service, name);
        try {
            var _this = this;
            var table = TableMeta.loadMeta(file);
            table.delete(function () {
                fs.unlinkSync(file);
                _this.emit("meta_over", ResCode.OK)
            });
        } catch (e) {
            console.log(e)
            this.emit("meta_over", ResCode.error(ResCode.MetaDelete, e))
        }
    }

    getFileName(service, name) {
        var filepath = this.storePath + "/" + service + "/" + name + ".json"
        return filepath;
    }

}

module.exports = MetaManager;