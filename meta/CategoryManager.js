var fs = require("fs")
var path = require('path');
var ResCode = require('../ResCode')
const logger = require("../log")

var CategoryManager = {
    storePath: null,
    init: function () {
        this.storePath = require("../ModulesPath");
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
            if (fs.existsSync(file)) {
                return ResCode.error(ResCode.MetaAdd, "Service already exists");
            } else {
                fs.mkdirSync(file);
            }

            return ResCode.OK;
        } catch (e) {
            logger.error(e);
            return ResCode.error(ResCode.MetaAdd, e);
        }
    },

    getEntity: function (service) {
        let o = this.getEntityObj(service)
        if (o instanceof Error) {
            return ResCode.error(ResCode.MetaAdd, o);
        } else {
            return ResCode.data(o);
        }
    },

    getService: function (service) {
        let o = this.getServiceObj(service)
        if (o instanceof Error) {
            return ResCode.error(ResCode.MetaAdd, o);
        } else {
            return ResCode.data(o);
        }
    },

    getEntityObj: function (service) {
        var file = this.getFileName(service);
        try {
            files = fs.readdirSync(file);
            var returnjsons = [];
            for (let i = 0; i < files.length; i++) {
                let index = files[i].indexOf(".json");
                if (index == files[i].length - 5) {
                    returnjsons.push({name:files[i].substring(0, index)});
                }
            }
            return returnjsons;
        } catch (e) {
            logger.error(e);
            return e;
        }
    },

    getServiceObj: function (service) {
        var file = this.getFileName(service);
        try {
            files = fs.readdirSync(file);
            var returnjsons = [];
            for (let i = 0; i < files.length; i++) {
                let index = files[i].indexOf(".service.js");
                if (index == files[i].length - 11) {
                    returnjsons.push({name:files[i].substring(0, index)});
                }
            }
            return returnjsons;
        } catch (e) {
            logger.error(e);
            return e;
        }
    },

    getWsCode: function (service, name) {
        var file = this.getFileName(service) + path.sep + name + ".service.js";
        try {
            var jscode = fs.readFileSync(file);
            returnjsons = new Buffer(jscode).toString('base64');
            return ResCode.data(returnjsons);
        } catch (e) {
            logger.error(e);
            return ResCode.error(ResCode.MetaAdd, e);
        }
    },

    setWsCode: function (service, name, code) {
        var file = this.getFileName(service) + path.sep + name + ".service.js";
        try {
            var jscode = new Buffer(code, 'base64');
            fs.writeFileSync(file, jscode);
            return ResCode.OK;
        } catch (e) {
            logger.error(e);
            return ResCode.error(ResCode.MetaAdd, e);
        }
    },

    delWsCode: function (service, name) {
        var file = this.getFileName(service) + path.sep + name + ".service.js";
        try {
            fs.unlinkSync(file);
            return ResCode.OK;
        } catch (e) {
            logger.error(e);
            return ResCode.error(ResCode.MetaAdd, e);
        }
    },

    delete: function (service) {
        var file = this.getFileName(service);
        try {
            fs.rmdirSync(file);
            return ResCode.OK;
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
        var allData = [];
        for (let i = 0; i < returnfolder.length; i++) {
            let entitys = this.getEntityObj(returnfolder[i])
            let apis = this.getServiceObj(returnfolder[i])
            allData.push({name:returnfolder[i],entitys:entitys,apis:apis})
        }
        return ResCode.data(allData);
    },

    getFileName: function (service) {
        var filepath = this.storePath + "/" + service
        return filepath;
    }

}
module.exports = CategoryManager;