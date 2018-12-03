var fs = require("fs")
var path = require('path');
var ResCode = require('./../ResCode')
var config = require('./../config');

var ServiceManager = {
    storePath: null,
    init: function () {
        this.storePath = config.dbstore;
        if (this.storePath.indexOf(".")==0) {
            this.storePath = path.join(__dirname, this.storePath);
        }
        if (!fs.existsSync(this.storePath)) {
            fs.mkdirSync(this.storePath)
        }
    },

    service: function (service,action) {
        if (action == "add") {
            return this.add(service);
        } else if (action == "delete") {
            return this.delete(service)
        }
    },

    add: function (service) {
        var file = this.getFileName(service);
        try {
            fs.mkdirSync(file);
            return ResCode.OK;
        } catch (e) {
            console.log(e);
            return ResCode.error(ResCode.MetaAdd, e);
        }
    },

    delete: function (service) {
        var file = this.getFileName(service);
        try {
            fs.rmdirSync(file);
            return ResCode.OK
        } catch (e) {
            console.log(e);
            return ResCode.error(ResCode.MetaDelete, e);
        }
    },

    getFileName: function (service) {
        var filepath = this.storePath+"/" + service
        return filepath;
    }

}
module.exports = ServiceManager;