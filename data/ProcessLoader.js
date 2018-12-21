var fs = require("fs");
const logger = require("./../log")
var path = require("path");

class ProcessLoader {

    static init() {
        global.service = this.service;
        global.slog = logger;
        let folder = require("../module") + path.sep;
        let files = fs.readdirSync(folder)
        files.forEach(function (item) {
            let stat = fs.lstatSync(folder + item)
            if (stat.isDirectory() === true && item.indexOf("node_modules") < 0) {
                let processFiles = fs.readdirSync(folder + item)
                processFiles.forEach(function (jsFile) {
                    if (jsFile.indexOf(".service.js") > 0) {
                        ProcessLoader.loadProcessFile(item, folder + item + path.sep + jsFile);
                    }
                })
            }
        })
    }

    static service(name, fun) {
        let map = ProcessLoader.processMap.get(global.serviceName);
        if (map == null) {
            map = new Map();
            ProcessLoader.processMap.set(global.serviceName, map);
        }
        logger.info("load server......:" + global.serviceName + "," + name);
        map.set(name, fun);
    }

    static reloadProcessFile(filePath){
        if(filePath==null) return;
        let values = filePath.split(path.sep);
        if(values.length<2)return;
        ProcessLoader.loadProcessFile(values[values.length-2],filePath);
    }

    static deleteProcessFile(filePath){
        if(filePath==null) return;
        let values = filePath.split(path.sep);
        if(values.length<2)return;
        let funNames = ProcessLoader.processFileMap.get(filePath);
        if(funNames !=null && funNames.length > 0){
            let map = ProcessLoader.processMap.get(values[values.length-2]);
            for(let i = 0;i<funNames.length;i++){
                if(map.has(funNames[i])){
                    map.delete(funNames[i]);
                }
            }
        }
    }

    static loadProcessFile(service, fileName) {
        global.serviceName = service;
        require(fileName);
        let map = ProcessLoader.processMap.get(service);
        let funNames = [];
        for(let [key, value] of map) {
            funNames.push(key);
        }
        ProcessLoader.processFileMap.set(fileName,funNames);
    }

    static loadProcess(service, action) {
        let map = ProcessLoader.processMap.get(service);
        if (map == null) {
            return null;
        }
        return map.get(action);
    }


}

ProcessLoader.processMap = new Map();
ProcessLoader.processFileMap = new Map();
module.exports = ProcessLoader;