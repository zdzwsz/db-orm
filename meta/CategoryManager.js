var fs = require("fs")
var path = require('path');
var ResCode = require('../ResCode')
const logger = require("../log")

var CategoryManager = {
    storePath: null,
    init: function () {
        this.storePath = path.join(__dirname, "../modules");
    },

    service: function (service, action) {
        if (action == "add") {
            return this.add(service);
        } else if (action == "delete") {
            return this.delete(service)
        }
        else if (action == "all") {
            return this.all()
        }
    },

    add: function (service) {
        var file = this.getFileName(service);
        try {
            fs.mkdirSync(file);
            return ResCode.OK;
        } catch (e) {
            logger.error(e);
            return ResCode.error(ResCode.MetaAdd, e);
        }
    },

    getEntity: function (service) {
        var file = this.getFileName(service);
        try {
            files = fs.readdirSync(file);
            var returnjsons = [];
            for (let i = 0; i < files.length; i++) {
                let index = files[i].indexOf(".json");
                if (index > 0) {
                    returnjsons.push(files[i].substring(0,index));
                }
            }
            return ResCode.data(returnjsons);
        } catch (e) {
            logger.error(e);
            return ResCode.error(ResCode.MetaAdd, e);
        }
    },

    getService: function (service) {
        var file = this.getFileName(service);
        try {
            files = fs.readdirSync(file);
            var returnjsons = [];
            for (let i = 0; i < files.length; i++) {
                let index = files[i].indexOf(".service.js");
                if (index > 0) {
                    returnjsons.push(files[i]);
                }
            }
            return ResCode.data(returnjsons);
        } catch (e) {
            logger.error(e);
            return ResCode.error(ResCode.MetaAdd, e);
        }
    },

    delete: function (service) {
        var file = this.getFileName(service);
        try {
            fs.rmdirSync(file);
            return ResCode.OK
        } catch (e) {
            logger.error(e);
            return ResCode.error(ResCode.MetaDelete, e);
        }
    },

    all: function () {
        folder = fs.readdirSync(this.storePath);
        var returnfolder = [];
        for (let i = 0; i < folder.length; i++) {
            if (folder[i] != 'node_modules') {
                returnfolder.push(folder[i]);
            }
        }
        return ResCode.data(returnfolder);
    },

    getFileName: function (service) {
        var filepath = this.storePath + "/" + service
        return filepath;
    }

}
module.exports = CategoryManager;