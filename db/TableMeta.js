knex = require("./KnexManager").getKnex();
var fs = require('fs');
const logger = require("./../log")
class TableMeta {

    constructor(json) {
        this.tableName = json.tableName;
        this.fields = json.fields;
        this.primary = json.primary;
        this.json = json;
    }

    static loadMeta(filename) {
        var meta = JSON.parse(fs.readFileSync(filename, 'utf-8'));
        var tableMeta = new TableMeta(meta);
        return tableMeta;
    }

    static load(JsonData) {
        var tableMeta = new TableMeta(JsonData);
        return tableMeta;
    }

    getJsonData() {
        return this.json;
    }

    setPrimary(fields) {
        if (fields == null || fields == "undefined") return
        this.primary = Array.isArray(fields) ? fields : [fields]
    }

    addField(field) {
        this.fields.push(field);
    }

    addFields(fields) {
        for (var i = 0; i < fields.length; i++) {
            this.fields.push(fields[i])
        }

    }

    _createColumn(table, field) {
        logger.debug("op field is :" + field.name);
        var column = null;
        if (field.type == "increment") {
            //mysql 的自增类型，必须是主键。
            column = table.increments(field.name);
        }
        else if (field.type == "int" || field.type == "integer") {
            column = table.integer(field.name);
        }
        else if (field.type == "dateTime") {
            column = table.dateTime(field.name);
        }
        else if (field.type == "decimal") {
            var flength = field.length || [8, 2];
            var precision = flength[0] || 8;
            var scale = flength[1] || 0;
            column = table.decimal(field.name, precision, scale);
        }
        else if (field.type == "float") {
            var flength = field.length || [8, 2];
            var precision = flength[0] || 8;
            var scale = flength[1] || 0;
            column = table.float(field.name, precision, scale);
        }
        else if (field.type == "date") {
            column = table.date(field.name);
        }
        else if (field.type == "timestamp") {
            column = table.timestamp(field.name);
        }
        else if (field.type == "string") {
            var flength = field.length || 50;
            column = table.string(field.name, flength);
        } else {
            column = table.string(field.name);
        }
        if (typeof (field.default) != "undefined") {
            column.defaultTo(field.default)
        }
        if (field.notNullable) {
            column.notNullable()
        }
        if (field.nullable) {
            column.nullable()
        }
        return column;
    }

    _createPrimary(table, tableJson) {
        if (tableJson.primary) {
            let column = this._getColumn(tableJson, tableJson.primary)
            if (column != null) {
                if (column["type"] != "increment") {//mysql 在increment下，不能设置主键
                    table.primary(tableJson.primary)
                }
            } else {
                logger.error("primary setup error:" + tableJson.primary);
                throw new Error("primary setup error:" + tableJson.primary);
            }
        }
    }

    _getColumn(tableJson, name) {
        for (let i = 0; i < tableJson.fields.length; i++) {
            let column = tableJson.fields[i];
            if (column["name"] === name) {
                return column;
            }
        }
        return null;
    }

    getMetaTables() {
        let tables = [];
        let mainTable = {};
        mainTable.tableName = this.tableName;
        mainTable.primary = this.primary;
        tables.push(mainTable);
        mainTable.fields = [];
        let json = this.json;
        let primary = this._getColumn(json, mainTable.primary);
        for (let i = 0; i < json.fields.length; i++) {
            if (json.fields[i].type == "table") {
                let subTable = json.fields[i].relation;
                let foreign_key = this.cloneColumn(primary);
                foreign_key.name = json.fields[i].name;
                if (foreign_key.type == "increment") {
                    foreign_key.type = "integer"
                }
                subTable.fields.push(foreign_key);
                tables.push(subTable);
            } else {
                mainTable.fields.push(json.fields[i]);
            }
        }
        return tables;
    }

    hasTable(i, tables, _this, callback) {
        knex.schema.hasTable(tables[i].tableName).then(function (exists) {
            if (!exists) {
                if (i < tables.length - 1) {
                    i++;
                    _this.hasTable(i, tables, _this, callback)
                } else {
                    callback()
                }
            } else {
                throw new Error("The created table already exists:" + tables[i]);
            }
        })
    }

    cloneColumn(source) {
        return JSON.parse(JSON.stringify(source));
    }

    create(callback) {
        var _this = this
        let tableJsons = this.getMetaTables();
        //console.log(tableJsons);
        this.hasTable(0, tableJsons, _this, function () {
            _this.createTable(0, tableJsons, _this, callback);
        });
    }

    createTable(j, tableJsons, _this, callback) {
        knex.schema.createTable(tableJsons[j].tableName, function (table) {
            for (var i = 0; i < tableJsons[j].fields.length; i++) {
                var field = tableJsons[j].fields[i];
                _this._createColumn(table, field);
            }
            _this._createPrimary(table, tableJsons[j]);
        }).then(function () {
            if (j < tableJsons.length - 1) {
                j++;
                _this.createTable(j, tableJsons, _this, callback)
            } else {
                if (callback) {
                    callback();
                }
            }
        }).catch(function (e) {
            if (callback) {
                callback(e);
            }
        });
    }

    delete(callback) {
        var _this = this
        let tableJsons = this.getMetaTables();
        _this.deleteTable(0,tableJsons,_this,callback);
    }

    deleteTable(i, tableJsons, _this, callback) {
        knex.schema.dropTableIfExists(tableJsons[i].tableName).then(function () {
            if (i < tableJsons.length - 1) {
                i++;
                _this.deleteTable(i, tableJsons, _this, callback)
            } else {
                if (callback) {
                    callback()
                }
            }
        })
    }


    update(json, callback) {
        //先增加字段，再删除字段，然后修改字段，然后改主键。无法保证事务完整。
        if (typeof (json) == "object") {
            //克隆 json
            let cloneJson = JSON.parse(JSON.stringify(this.json));
            //console.log(cloneJson);
            var _this = this
            //可能什么都没有干
            knex.schema.table(_this.tableName, function (table) {
                if (json.add) {
                    for (let i = 0; i < json.add.length; i++) {
                        var field = json.add[i]
                        _this._createColumn(table, field)
                        cloneJson.fields.push(field);
                    }
                }
                if (json.delete) {
                    table.dropColumns(json.delete);
                    for (let i = 0; i < json.delete.length; i++) {
                        for (let j = 0; j < cloneJson.fields.length; j++) {
                            if (cloneJson.fields[j].name == json.delete[i]) {
                                cloneJson.fields.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
                if (json.update) {
                    //rename 
                    for (var key in json.update) {
                        if (key != json.update[key].name) {
                            //如果提交的字段，不在数据中，日志发出警告。
                            let field_exist = false;
                            for (let i = 0; i < cloneJson.fields.length; i++) {
                                if (cloneJson.fields[i].name == key) {
                                    table.renameColumn(key, json.update[key].name)
                                    cloneJson.fields[i].name = json.update[key].name;
                                    logger.debug("rename field: " + key + " to: " + json.update[key].name);
                                    field_exist = true;
                                    break;
                                }
                            }
                            if (!field_exist) {
                                logger.warn("modify field error:" + key + " not exist ,please check update json!");
                            }
                        }
                    }
                }
                if (json.r_primary) {
                    table.dropPrimary();
                    if (json.r_primary != "_delete_") {
                        table.primary(json.r_primary);
                        cloneJson.primary = json.r_primary;
                    }
                }
            }).then(function () {
                _this.json = cloneJson;
                cloneJson = JSON.parse(JSON.stringify(_this.json));
                if (json.update) {
                    //update type , 难以保证事务一致性
                    knex.schema.alterTable(_this.tableName, function (table) {
                        for (let key in json.update) {
                            let field = json.update[key];
                            for (let i = 0; i < cloneJson.fields.length; i++) {
                                if (cloneJson.fields[i].name == field.name) {
                                    cloneJson.fields[i] = json.update[key];
                                    logger.debug("alert field type:" + field.name);
                                    let column = _this._createColumn(table, field);
                                    column.alter();
                                    break;
                                }
                            }
                        }
                    })
                        .then(function () {
                            _this.json = cloneJson;
                            callback()
                        })
                        .catch(function (e) {
                            e.code = "02"
                            logger.error("alter column type error:" + e);
                            callback(e)
                        })
                } else {
                    callback()
                }
            }).catch(function (e) {
                e.code = "01"
                logger.error(e);
                callback(e)
            });

        } else {
            logger.error("Need to submit update table information!")
        }
    }

}
TableMeta.FIELDTPYE = ["increment", "string", "integer", "decimal", "float", "date", "dateTime", "time", "bigInteger", "timestamp", "binary", "guid"]
TableMeta.COUSTRAINTT = ["primary", "unique", "foreign", "notNullable"]
TableMeta.DEFAULTVALUE = []

module.exports = TableMeta