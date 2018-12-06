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
        console.log("create database pool!")
    }
    static getKnex() {
        if (!KnexManager.instance) {
            KnexManager.instance = new KnexManager()
        }
        return KnexManager.instance.knex
    }
}

exports = module.exports = KnexManager