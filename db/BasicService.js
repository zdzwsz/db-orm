const knex = require("./KnexManager").getKnex();
const logger = require("./../log")
var Promise = require('bluebird');

class BasicService {

    constructor(tableName, master) {
        this.tableName = tableName;
        this.master = master;
    }
    //新增返回值是主键
    add(dataJson, callback) {
        if (dataJson == null || typeof (dataJson) == "undefined") {
            if (callback) {
                callback(new Error("Parameters cannot be null!"));
            }
            return;
        }
        knex(this.tableName).returning(this.master).insert(dataJson)
            .then(function (data) {
                if (callback) {
                    if (data && data.length && data.length > 0) {
                        data = data[0];
                    }
                    callback(null, data);
                }
            }).catch(function (e) {
                logger.error(e);
                if (callback) {
                    callback(e)
                }
            });
    }
    //返回值是成功的条数，一般是1
    update(dataJson, callback) {
        if (dataJson == null || typeof (dataJson) == "undefined") {
            if (callback) {
                callback(new Error("Parameters cannot be null!"));
            }
            return;
        }
        let value = dataJson[this.master];
        knex(this.tableName).where(this.master, value).update(dataJson)
            .then(function (data) {
                //console.log(data);
                if (callback) {
                    callback(null, data);
                }
            }).catch(function (e) {
                logger.error(e);
                if (callback) {
                    callback(e)
                }
            });
    }

    delete(id, callback) {
        let parame = this._getParameter(id);
        if (parame == null) {
            if (callback) {
                callback(new Error("Parameters cannot be null!"));
                return;
            }
        }
        knex(this.tableName).where(parame).del()
            .then(function (data) {
                if (callback) {
                    callback(null, data);
                }
            }).catch(function (e) {
                logger.error(e);
                if (callback) {
                    callback(e)
                }
            });
    }

    _getParameter(id) {
        if (id == null || typeof (id) == "undefined") {
            return null;
        }

        let parame = {};
        if (typeof (id) != "object") {
            parame[this.master] = id
        } else {
            parame = id;
        }
        return parame
    }

    get(id, callback) {
        let parame = this._getParameter(id);
        if (parame == null) {
            if (callback) {
                callback(new Error("Parameters cannot be null!"));
            }
            return;
        }
        //console.log(parame);
        knex(this.tableName).where(parame)
            .then(function (value) {
                if (callback) {
                    //console.log(value);
                    if (value && value.length && value.length > 0) {
                        value = value[0];
                    }
                    callback(null, value);
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
                    if (Array.isArray(parameters[i])) {
                        return trx.raw(sql, parameters[i]);
                    } else {
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