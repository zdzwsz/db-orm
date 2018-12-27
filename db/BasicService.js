const knex = require("./KnexManager").getKnex();
const logger = require("./../log")
var Promise = require('bluebird');


class BasicService {

    constructor(json) {
        this.json = json;
        this.init();
    }

    init() {
        let json = this.json;
        this.tableName = json.tableName;
        this.primary = json.primary;
        this.subTables = new Map();
        for (let i = 0; i < json.fields.length; i++) {
            if (json.fields[i].type == "table") {
                this.subTables.set(json.fields[i].name, json.fields[i].relation);
            }
        }
    }

    processData(dataJson) {
        let data = { main: null, subs: new Map() };
        for (let key in dataJson) {
            if (this.subTables.has(key)) {
                let meta = this.subTables.get(key);
                data.subs.set(key, dataJson[key]);
                delete dataJson[key];
            }
        }
        data.main = dataJson;
        return data;
    }

    //新增返回值是主键
    add(dataJson, callback) {
        if (dataJson == null || typeof (dataJson) == "undefined") {
            if (callback) {
                callback(new Error("Parameters cannot be null!"));
            }
            return;
        }
        let data = this.processData(dataJson);
        this.addField(data, callback)
    }

    addField(data, callback) {
        //console.log(data);
        let _this = this;
        knex.transaction(function (trx) {
            let id = data.main[_this.primary];
            let subs = data.subs;
            knex(_this.tableName).returning(_this.primary).insert(data.main).transacting(trx)
                .then(function (ids) {
                    id = id || ids[0];
                    if (subs.size > 0) {
                        for (let [key, values] of subs) {
                            for (let i = 0; i < values.length; i++) {
                                values[i][key] = id;
                            }
                        }
                        return Promise.map(subs.keys(), function (key) {
                            let subTableData = subs.get(key);
                            let subTableName = _this.subTables.get(key).tableName;
                            return knex.insert(subTableData).into(subTableName).transacting(trx);
                        })
                    }
                })
                .then(function () {
                    trx.commit();
                    if (callback) {
                        callback(null, id);
                    }
                })
                .catch(function (e) {
                    logger.error(e);
                    trx.rollback();
                    if (callback) {
                        callback(e);
                    }
                });
        })
    }

    //返回值是成功的条数，一般是1
    update(dataJson, callback) {
        if (dataJson == null || typeof (dataJson) == "undefined") {
            if (callback) {
                callback(new Error("Parameters cannot be null!"));
            }
            return;
        }
        let data = this.processData(dataJson);
        this.updateField(data,callback);
    }

    updateField(data, callback) {
        let _this = this;
        let id = data.main[_this.primary];
        knex.transaction(function (trx) {
            let subs = data.subs;
            knex(_this.tableName).where(_this.primary, id).update(data.main).transacting(trx)
                //子表，先删除多余的，即主键不在目前主键中的。
                .then(function () {
                    let selectRaw = [];
                    for (let [key, value] of _this.subTables) {
                        let where = {};
                        where[key] = id;
                        selectRaw.push(knex(value.tableName).select(value.primary).where(where));
                    }
                    return Promise.all(selectRaw);
                })
                .then(function (values) {
                    let j = 0
                    let oldValueMap = new Map();
                    for (let [key, value] of _this.subTables) {
                        let pArray = [];
                        values[j].forEach(function(v){
                            pArray.push(v[value.primary])
                        })
                        oldValueMap.set(key, pArray);
                        j++;
                    }
                    let execRaw = [];
                    for (let [key, values] of subs) {
                        let newJson =[];
                        let oldValues = oldValueMap.get(key);
                        let tableMeta = _this.subTables.get(key);
                        for (let i = 0; i < values.length; i++) {
                            values[i][key] = id;
                            //console.log(values[i]);
                            let subPrimary = values[i][tableMeta.primary];
                            if(subPrimary){
                                //如果主键不在旧主键中，也是新增，否则是修改
                                let index = oldValues.indexOf(subPrimary);
                                //console.log(oldValues);
                                if(index >-1){
                                    execRaw.push(knex(tableMeta.tableName).where(tableMeta.primary, subPrimary).update(values[i]).transacting(trx));
                                    oldValues.splice(index,1);
                                }else{
                                    newJson.push(values[i]);
                                }
                            }else{//new
                                newJson.push(values[i]);
                            }
                        }
                        if(oldValues.length>0){
                            execRaw.push(knex(tableMeta.tableName).whereIn(tableMeta.primary,oldValues).del().transacting(trx));
                        }
                        if(newJson.length>0){
                            execRaw.push(knex(tableMeta.tableName).insert(newJson).transacting(trx));
                        }
                    }
                    return Promise.all(execRaw);
                })
                .then(function(data){
                    trx.commit();
                    if (callback) {
                        callback(null,data);
                    }
                })
                .catch(function (e) {
                    logger.error(e);
                    trx.rollback();
                    if (callback) {
                        callback(e);
                    }
                });
        })
    }

    delete(id, callback) {
        let parame = this._getParameter(id);
        if (parame == null) {
            if (callback) {
                callback(new Error("Parameters cannot be null!"));
                return;
            }
        }
        let _this = this;
        knex.transaction(function (trx) {
            let raws = []
            for (let [key, value] of _this.subTables) {
                let raw = knex(value.tableName).whereIn(key, function () {
                    this.select(_this.primary).from(_this.tableName).where(parame);
                }).del().transacting(trx);
                raws.push(raw);
            }
            raws.push(knex(_this.tableName).where(parame).del().transacting(trx));
            return Promise.all(raws)
        }).then(function (data) {
            if (callback) {
                callback(null, data);
            }
        }).catch(function (e) {
            if (callback) {
                callback(e);
            }
        })
    }

    _getParameter(id) {
        if (id == null || typeof (id) == "undefined") {
            return null;
        }

        let parame = {};
        if (typeof (id) != "object") {
            parame[this.primary] = id
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
        var _this = this;
        let returnValue = {};
        knex(this.tableName).where(parame)
            .then(function (value) {
                if (value && value.length && value.length > 0) {
                    value = value[0];
                    returnValue = value;
                    let id = returnValue[_this.primary];
                    if (_this.subTables.size > 0) {
                        return Promise.map(_this.subTables.keys(), function (key) {
                            let meta = _this.subTables.get(key);
                            let parame = {};
                            parame[key] = id
                            return knex(meta.tableName).where(parame);
                        })
                    }
                }
            })
            .then(function (values) {
                let keys = [..._this.subTables.keys()];
                for (let i = 0; i < keys.length; i++) {
                    if (values) {
                        returnValue[keys[i]] = values[i];
                    } else {
                        returnValue[keys[i]] = [];
                    }
                }
                if (callback) {
                    callback(null, returnValue);
                }
            })
            .catch(function (e) {
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