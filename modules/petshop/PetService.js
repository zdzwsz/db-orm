var log = require("Log");
var BasicService = require("BasicService");
var db = require("DB");

class PetService extends BasicService {

    constructor(tableName, master) {
        super(tableName, master);
    }

    get(id, callback) {
        log.debug("welcome to my pet shop, no no oooooo!");
        super.get(id, callback);
    }

    all(callback) {
        this.select("select * from "+this.tableName,null,callback);
    }

    searchName(name,callback) {
        this.select("select * from "+this.tableName + " where name = ?",[name],callback);
    }
}

module.exports = PetService