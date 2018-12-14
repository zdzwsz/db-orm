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
            KnexManager.status = true;
        }
        if(!KnexManager.status){
            KnexManager.instance = new KnexManager();
            KnexManager.status = true;
        }
        return KnexManager.instance.knex
    }

    static destroy(){
        if(KnexManager.instance != null){
            setTimeout(function(){
                KnexManager.instance.knex.destroy();
            },15000);
            KnexManager.status = false;
        }
    }
}

module.exports = KnexManager