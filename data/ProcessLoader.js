var fs = require("fs");
const logger = require("./../log")
var path = require("path");

class ProcessLoader {

    static init() {
        global.service = this.service;
        let folder = path.join(__dirname, "../modules/");
        let files = fs.readdirSync(folder)
        files.forEach(function (item) {
            let stat = fs.lstatSync(folder + item)
            if (stat.isDirectory() === true && item.indexOf("node_modules")<0) {
                let processFiles = fs.readdirSync(folder + item)
                processFiles.forEach(function(jsFile){
                    if(jsFile.indexOf("service.js")>0){
                        ProcessLoader.loadProcessFile(item,folder + item+path.sep+jsFile);
                    }
                })
            }
        })
    }

    static service(name, fun) {
        let map = ProcessLoader.processMap.get(global.serviceName);
        if(map == null){
            map = new Map();
            ProcessLoader.processMap.set(global.serviceName,map);
        }
        logger.info("load server......:" + global.serviceName+","+name);
        map.set(name,fun);
    }

    static loadProcessFile(service,fileName){
        global.serviceName = service;
        require(fileName);
    }

    static loadProcess(service, action) {
        let map = ProcessLoader.processMap.get(service);
        if(map == null){
            return null;
        }
        return map.get(action);
    }
}

ProcessLoader.processMap = new Map();

module.exports = ProcessLoader;