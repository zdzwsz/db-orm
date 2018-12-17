const knex = require("./KnexManager").getKnex();
class DB {
    constructor() {
       this.init();
    }

    transaction() {
        this.transaction = true;
        return this;
    }

    select(tableName, where, paramter) {
        if (typeof (where) == "undefined") {
            this.sqlRunners.push(knex(tableName));
        } else {
            this.sqlRunners.push(knex(tableName).whereRaw(where, paramter));
        }
        return this;
    }

    init(){
        this.sqlRunners = [];
        this.transaction = false;
    }

    then(callback) {
        let sqlRunners = this.sqlRunners;
        let transaction = this.transaction;
        this.init();
        if (transaction) {
            this.execSql(sqlRunners,callback);
        } else {
            this.selectSql(sqlRunners,callback);
        }
    }

    selectSql(sqlRunners,callback) {
        for (let i = 0; i < sqlRunners.length; i++) {
            let runner = sqlRunners[i];
            runner.then(function(data){
                if (callback) {
                    callback(null, data,i);
                }
            }).catch(function(error){
                if (callback) {
                    callback(error,null,i);
                }
            })
        }
    }

    execSql(sqlRunners,callback) {
        knex.transaction(function (trx) {
            return Promise.map(sqlRunners, function (runner, i) {
               return runner.transacting(trx);
            })
        }) .then(function (data) {
            if (callback) {
                callback(null, data);
            }
        })
        .catch(function (error) {
            if (callback) {
                callback(error);
            }
        });

    }

}
module.exports = DB;