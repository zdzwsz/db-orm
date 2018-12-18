const knex = require("../db/KnexManager").getKnex();
var fs = require("fs");
const logger = require("../log")
var path = require("path");
var Promise = require('bluebird');
const LogicError = require("./LogicError");
class DB {
    constructor() {
        this.init();
        if (DB.masterMap.size == 0) {
            this.loadTableMeta();
        }
    }

    trx() {
        this.transaction = true;
        return this;
    }

    select(tableName, where, parameter) {
        this.createSelect(tableName, where, parameter, false);
        return this;
    }

    createSelect(tableName, where, parameter, isOne) {
        let raw = null;
        if (typeof (where) == "undefined") {
            raw = knex(tableName);
        } else {
            raw = knex(tableName).whereRaw(where, parameter);
        }
        raw.isOne = isOne;
        this.sqlRunners.push(raw)
    }

    get(tableName, where, parameter) {
        this.createSelect(tableName, where, parameter, true);
        return this;
    }

    insert(tableName, json) {
        let raw = knex(tableName).insert(json);
        this.sqlRunners.push(raw);
        return this;
    }

    update(tableName, json) {
        let master = DB.masterMap.get(tableName);
        let value = json[master];
        let raw = knex(tableName).where(master, value).update(json);
        this.sqlRunners.push(raw);
        return this;
    }

    updateRaw(tableName, updateField, where, parameter) {
        let sql = "update " + tableName + " set " + updateField + " where " + where;
        return this.execRaw(sql, parameter);
    }

    execRaw(sql, parameter) {
        if (typeof (parameter) == "undefined") {
            this.sqlRunners.push(knex.raw(sql));
        } else {
            this.sqlRunners.push(knex.raw(sql, parameter));
        }
        return this;
    }

    init() {
        this.sqlRunners = [];
        this.transaction = false;
        this.tran = null;
    }

    then(callback) {
        let sqlRunners = this.sqlRunners;
        let transaction = this.transaction;
        let tran = this.tran;
        this.init();
        if (tran != null) {
            let i = 0;
            DB.one(sqlRunners[i], tran, i, sqlRunners.length, callback, true);
        } else {
            if (transaction) {
                this.execSql(sqlRunners, callback);
            } else {
                this.selectSql(sqlRunners, callback);
            }
        }

    }

    go(callback) {
        let sqlRunners = this.sqlRunners;
        this.sqlRunners = [];
        let i = 0;
        if (this.tran == null) {
            var _this = this;
            knex.transaction(function (trx) {
                _this.tran = trx;
                DB.one(sqlRunners[i], trx, i, sqlRunners.length, callback);
            })
                .then(function (data) {
                    //console.log(data);
                })
                .catch(function (error) {
                    logger.error(error);
                });
        } else {
            DB.one(sqlRunners[i], this.tran, i, sqlRunners.length, callback);
        }
    }

    static one(raw, trx, i, time, callback, commit) {
        raw.transacting(trx).then(function (data) {
            if (i == time - 1) {
                callback(null, data);
                if (commit) {
                    trx.commit();
                }
            } else {
                i++;
                DB.one(sqlRunners[i], trx, i, time, callback);
            }
        }).catch(function (e) {
            trx.rollback();
            if (!e instanceof LogicError) {
                callback(e);
            }
        });
    }

    selectSql(sqlRunners, callback) {
        for (let i = 0; i < sqlRunners.length; i++) {
            let runner = sqlRunners[i];
            runner.then(function (data) {
                if (callback) {
                    if (runner.isOne) {
                        if (data && data.length && data.length > 0) {
                            data = data[0];
                        }
                    }
                    callback(null, data, i);
                }
            }).catch(function (error) {
                if (callback) {
                    if (!error instanceof LogicError) {
                        callback(error, null, i);
                    }
                }
            })
        }
    }

    execSql(sqlRunners, callback) {
        knex.transaction(function (trx) {
            for (let i = 0; i < sqlRunners.length; i++) {
                let runner = sqlRunners[i];
                runner.transacting(trx);
            }
            return Promise.all(sqlRunners);
        }).then(function (data) {
            if (callback) {
                callback(null, data);
            }
        })
            .catch(function (error) {
                if (callback) {
                   if(!error instanceof LogicError){
                    callback(error);
                   }
                }
            });
    }

    loadTableMeta() {
        let folder = path.join(__dirname, "../modules/");
        let files = fs.readdirSync(folder)
        files.forEach(function (item) {
            let stat = fs.lstatSync(folder + item)
            if (stat.isDirectory() === true && item.indexOf("node_modules") < 0) {
                let processFiles = fs.readdirSync(folder + item)
                processFiles.forEach(function (jsFile) {
                    if (jsFile.indexOf(".json") > 0) {
                        let filepath = folder + item + path.sep + jsFile
                        logger.info("load tableMeta......" + filepath);
                        let tableMate = require(filepath);
                        DB.masterMap.set(tableMate.tableName, tableMate.primary);
                    }
                })
            }
        })
    }
}
DB.masterMap = new Map();
module.exports = DB;