knex = require("./KnexManager").getKnex();
const logger = require("./../log")

class BasicService{

    constructor(tableName,master) {
        this.tableName = tableName;
        this.master = master;
    }

    add(dataJson,callback){
        knex(this.tableName).insert(dataJson)
        .then(function(data){
            if(callback){
                callback();
            }
        }).catch(function (e) {
            logger.error(e);
            if (callback) {
                callback(e)
            }
        });
    }

    update(dataJson,callback){
        let value = dataJson[this.master];
        knex(this.tableName).where(this.master,value).update(dataJson)
        .then(function(){
            if(callback){
                callback();
            }
        }).catch(function (e) {
            logger.error(e);
            if (callback) {
                callback(e)
            }
        });
    }

    delete(id,callback){
        knex(this.tableName).where(this.master,id).del()
        .then(function(){
            if(callback){
                callback();
            }
        }).catch(function (e) {
            logger.error(e);
            if (callback) {
                callback(e)
            }
        });
    }

    get(id,callback){
        knex(this.tableName).where(this.master,id)
        .then(function(value){
            if(callback){
                let returnValue = null;
                if(value && value.length && value.length>0){
                    returnValue = value[0];
                }
                callback(returnValue,null);
            }
        }).catch(function (e) {
            logger.error(e);
            if (callback) {
                callback(null,e)
            }
        });
    }
}

module.exports = BasicService

