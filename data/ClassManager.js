var BasicService = require("./../db/BasicService")
var fs = require("fs");
const logger = require("./../log");
const path = require("path");


class ClassManager {

    static getClass(path) {

        let serviceClass = ClassManager.getCacheServiceClass(path);
        if (serviceClass != null) {
            return serviceClass;
        }
        return ClassManager.loadServiceClass(path);
    }

    static loadServiceClass(filepath) {
        let serviceClass = null;
        if (fs.existsSync(filepath)) {
            logger.info("load service...... " + filepath);
            require.cache[filepath] = null
            if (global.need == null) {
                const need = function (m) {
                    let filePath = path.resolve(__dirname ,"../shortcut/" , m);
                    return require(filePath)
                }
                global.need = need;
            }
            serviceClass = require(filepath);
            if (!serviceClass instanceof BasicService) {
                logger.error(filepath + " is not a service,use BasicService!");
                serviceClass = BasicService;
            }
            ClassManager.setCacheServiceClass(filepath, serviceClass);
        }
        else {
            serviceClass = BasicService;
        }
        return serviceClass;
    }

    static getCacheServiceClass(filepath) {
        let stime = ClassManager.fileTimeMap.get(filepath);
        if (!stime) return null;
        let ltime = fs.statSync(filepath).mtimeMs;
        if (ltime - stime > 50) {
            ClassManager.fileTimeMap.set(filepath, ltime);
            return null;
        }
        return ClassManager.classMap.get(filepath);
    }

    static setCacheServiceClass(filepath, serviceClass) {
        ClassManager.classMap.set(filepath, serviceClass);
        let ltime = fs.statSync(filepath).mtimeMs;
        ClassManager.fileTimeMap.set(filepath, ltime);
    }

}
ClassManager.classMap = new Map();
ClassManager.fileTimeMap = new Map();

module.exports = ClassManager;