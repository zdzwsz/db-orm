var config = require('../config')

class KnexManager {
    constructor() {
        this.knex = require('knex')(
            {
                client: config.database.dbtype, //指明数据库类型，还可以是mysql，sqlite3等等 
                connection: {
                    host: config.database.host,
                    user: config.database.user,
                    password: config.database.password,
                    database: config.database.dbname
                }
            });
    }
    static getKnex() {
        if(KnexManager.instance == null){
            KnexManager.instance = new KnexManager();
        }
        return KnexManager.instance.knex
    }

    static getType(){
        return config.database.dbtype;
    }

    static isType(type){
        return config.database.dbtype ===type;
    }

    static destroy(time){
        if(typeof(time)=="undefined"){
            time = 80000;
        }
        if(KnexManager.instance != null){
            setTimeout(function(){
                KnexManager.instance.knex.destroy();
            },time);
        }
    }
}
module.exports = KnexManager