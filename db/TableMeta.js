knex = require("./KnexManager").getKnex();
var fs = require('fs');
const logger = require("./../log")
class TableMeta {

    constructor(json) {
        this.tableName = json.tableName;
        this.fields = json.fields;
        this.primary = json.primary;
        this.json=json;
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

    getJsonData(){
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
        } else {
            column.nullable()
        }
        return column;
    }

    _createPrimary(table) {
        if (this.primary) {
            table.primary(this.primary)
        }
    }

    create(callback) {
        var _this = this
        logger.debug("2.1==============:" + new Date().getTime());
        knex.schema.hasTable(_this.tableName).then(function (exists) {
            if (!exists) {
                logger.debug("create table:" + _this.tableName)
                knex.schema.createTable(_this.tableName, function (table) {
                    for (var i = 0; i < _this.fields.length; i++) {
                        var field = _this.fields[i]
                        _this._createColumn(table, field)
                    }
                    _this._createPrimary(table)
                }).then(function () {
                    logger.debug("2.2==============:" + new Date().getTime());
                    if (callback) {
                        callback()
                    }
                }).catch(function (e) {
                    if (callback) {
                        callback(e)
                    }
                });
            } else {
                if (callback) {
                    callback("table:" + _this.tableName + " is Exists")
                }
            }
        })
    }

    delete(callback) {
        var _this = this
        knex.schema.dropTableIfExists(_this.tableName).then(function () {
            if (callback) {
                callback()
            }
        })
    }

    update(json, callback) {
        //先增加字段，再删除字段，然后修改字段，然后改主键。无法保证事务完整。
        if (typeof (json) == "object") {
            var _this = this
            //可能什么都没有干
            knex.schema.table(_this.tableName, function (table) {
                if (json.add) {
                    for (var i = 0; i < json.add.length; i++) {
                        var field = json.add[i]
                        _this._createColumn(table, field)
                    }
                }
                if (json.delete) {
                    table.dropColumns(json.delete);
                }
                if (json.update) {
                    //rename 
                    for (var key in json.update) {
                        if (key != json.update[key].name) {
                            logger.debug("rename field type!"+"key is:"+key + " to:"+json.update[key].name );
                            table.renameColumn(key, json.update[key].name)
                        }
                    }
                }
                if (json.r_primary) {
                    table.dropPrimary();
                    table.primary(json.r_primary);
                }
            }).then(function () {
                if (json.update) {
                    //update type 
                    knex.schema.alterTable(_this.tableName, function (table) {
                        for (var key in json.update) {
                            var field = json.update[key];
                            logger.debug("alert field type:"+ field );
                            var column = _this._createColumn(table, field);
                            column.alter();
                        }
                        
                    })
                    .then(function(){
                        callback()
                    })
                    .catch(function(e){
                        logger.error("alter column type error:"+e);
                        callback(e)
                    })
                }else{
                    callback()
                }
            }).catch(function (e) {
                logger.error(e);
                callback(e)
            });

        } else {
            logger.error("Need to submit update table information!")
        }
    }

}
TableMeta.FIELDTPYE = ["increment", "string", "integer", "decimal", "float", "date", "dateTime", "time", "bigInteger", "timestamp", "binary"]
TableMeta.COUSTRAINTT = ["primary", "unique", "foreign", "notNullable"]
TableMeta.DEFAULTVALUE = []

module.exports = TableMeta