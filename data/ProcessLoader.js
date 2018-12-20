var fs = require("fs");
const logger = require("./../log")
var path = require("path");

class ProcessLoader {

    static init() {
        global.service = this.service;
        global.slog = logger;
        let folder = require("../module")+path.sep;
        let files = fs.readdirSync(folder)
        files.forEach(function (item) {
            let stat = fs.lstatSync(folder + item)
            if (stat.isDirectory() === true && item.indexOf("node_modules")<0) {
                let processFiles = fs.readdirSync(folder + item)
                processFiles.forEach(function(jsFile){
                    if(jsFile.indexOf(".service.js")>0){
                        ProcessLoader.loadProcessFile(item,folder + item+path.sep+jsFile);
                        ProcessLoader.setProcessFileTime(item,folder + item+path.sep+jsFile);
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

    static setProcessFileTime(serviceName,file){
        let ltime = fs.statSync(file).mtimeMs;
        let map = ProcessLoader.processMap.get(serviceName);
        for(let key of map.keys()){
            ProcessLoader.processAndFileMap.set(serviceName+"_"+key,{"file":file,"time":ltime});
        }
    }

    static loadProcessFile(service,fileName){
        global.serviceName = service;
        require(fileName);
    }

    static loadProcess(service, action) {
        ProcessLoader.checkAndLoadNewProcess(service, action);
        let map = ProcessLoader.processMap.get(service);
        if(map == null){
            return null;
        }
        return map.get(action);
    }

    static checkAndLoadNewProcess(service, action){
        let file = ProcessLoader.processAndFileMap.get(service+"_"+action);
        if(file){
            let ltime = fs.statSync(file["file"]).mtimeMs;
            if(ltime - file["time"]>50){
                require.cache[file["file"]]=null
                ProcessLoader.loadProcessFile(service,file["file"]);
            }
        }
    }
}

ProcessLoader.processMap = new Map();
ProcessLoader.processAndFileMap = new Map();//service+"_"+action , {fileName,long}

module.exports = ProcessLoader;