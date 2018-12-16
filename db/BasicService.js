const knex = require("./KnexManager").getKnex();
const logger = require("./../log")
var Promise = require('bluebird');

class BasicService {

    constructor(tableName, master) {
        this.tableName = tableName;
        this.master = master;
    }

    add(dataJson, callback) {
        knex(this.tableName).insert(dataJson)
            .then(function (data) {
                if (callback) {
                    callback();
                }
            }).catch(function (e) {
                logger.error(e);
                if (callback) {
                    callback(e)
                }
            });
    }

    update(dataJson, callback) {
        let value = dataJson[this.master];
        knex(this.tableName).where(this.master, value).update(dataJson)
            .then(function () {
                if (callback) {
                    callback();
                }
            }).catch(function (e) {
                logger.error(e);
                if (callback) {
                    callback(e)
                }
            });
    }

    delete(id, callback) {
        knex(this.tableName).where(this.master, id).del()
            .then(function () {
                if (callback) {
                    callback();
                }
            }).catch(function (e) {
                logger.error(e);
                if (callback) {
                    callback(e)
                }
            });
    }

    get(id, callback) {
        knex(this.tableName).where(this.master, id)
            .then(function (value) {
                if (callback) {
                    let returnValue = null;
                    if (value && value.length && value.length > 0) {
                        returnValue = value[0];
                    }
                    callback(null, returnValue);
                }
            }).catch(function (e) {
                logger.error(e);
                if (callback) {
                    callback(e, null)
                }
            });
    }

    select(sql, parameter, callback) {
        var raw = null;
        if (Array.isArray(parameter)) {
            raw = knex.raw(sql, parameter);
        } else {
            raw = knex.raw(sql);
        }
        raw.then(function (data) {
            if (callback) {
                if (Array.isArray(data) && Array.isArray(data[0])) {
                    data = data[0];
                }
                callback(null, data);
            }
        }).catch(function (e) {
            logger.error(e);
            if (callback) {
                callback(e);
            }
        })
    }

    execSql(sqls, parameters, callback) {
        let argsLength = arguments.length;
        knex.transaction(function (trx) {
            return Promise.map(sqls, function (sql, i) {
                if (argsLength == 3 || (argsLength == 2 && Array.isArray(parameter))) {
                    if(Array.isArray(parameters[i])){
                        return trx.raw(sql, parameters[i]);
                    }else{
                        return trx.raw(sql);
                    }
                }
                else {
                    return trx.raw(sql);
                }
            })
        })
            .then(function (data) {
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

module.exports = BasicService

