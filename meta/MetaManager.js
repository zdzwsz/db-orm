var fs = require("fs")
var path = require('path');
var ResCode = require('./../ResCode')
var config = require('./../config');
var TableMeta = require("./../db/TableMeta")
var MetaManager = {
    storePath: null,
    init: function () {
        this.storePath = config.dbstore;
        if (this.storePath.indexOf(".")==0) {
            this.storePath = path.join(__dirname, this.storePath);
        }
        if (!fs.existsSync(this.storePath)) {
            fs.mkdirSync(this.storePath);
        }
    },
    service: function (service, name, action, req) {
        if (action == "get") {
            return this.get(service, name);
        } else if (action == "add") {
            return this.add(service, name, req);
        } else if(action =='delete'){
            return this.delete(service, name);
        } else if(action == 'update'){
            return this.update(service, name, req);
        }
    },

    get: function (service, name) {
        var file = this.getFileName(service, name);
        try {
            var data = fs.readFileSync(file, 'utf-8');
            console.log(data);
            var json = ResCode.data(JSON.parse(data));
            return json;
        } catch (e) {
            console.log(e);
            return ResCode.error(ResCode.MetaGet, e);
        }
    },

    add: function (service, name, req) {
        var data = req.body;
        if(data == null || typeof(data) !='object' || typeof(data.tableName) == 'undefined'){
            return ResCode.error(ResCode.MetaAddNull);
        }
        console.log("data is :"+data);
        var file = this.getFileName(service, name);
        try {
            var table = TableMeta.load(data);
            table.create();
            fs.writeFileSync(file, JSON.stringify(data));
            return ResCode.OK;
        } catch (e) {
            console.log(e);
            return ResCode.error(ResCode.MetaAdd, e);
        }
    },

    update: function (service, name, req) {
        return this.add(service, name, req);
    },

    delete: function (service, name) {
        var file = this.getFileName(service, name);
        try {
            var table = TableMeta.loadMeta(file);
            table.delete();
            fs.unlinkSync(file);
            return ResCode.OK;
        } catch (e) {
            console.log(e);
            return ResCode.error(ResCode.MetaDelete, e);
        }
    },

    getFileName: function (service, name) {
        var filepath = this.storePath+"/" + service + "/" + name + ".json"
        return filepath;
    }

}

module.exports = MetaManager;