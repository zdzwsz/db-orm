var log = require("Log");
var BasicService = require("BasicService");

log.debug("this is a test");
class PetService extends BasicService{

    constructor(tableName,master){
        super(tableName,master);
    }

    get(id,callback){
        log.debug("welcome to my pet shop, no no oooooo!");
        super.get(id,callback);
    }
}

module.exports = PetService