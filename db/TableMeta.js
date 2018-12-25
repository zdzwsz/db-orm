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
        //console.log(json);
        let primary = this._getColumn(json, mainTable.primary);
        for (let i = 0; i < json.fields.length; i++) {
            if (json.fields[i].type == "table") {
                let subTable = JSON.parse(JSON.stringify(json.fields[i].relation));
                //console.log(subTable);
                //console.log("======");
                let foreign_key = this.cloneColumn(primary);
                foreign_key.name = json.fields[i].name;
                if (foreign_key.type == "increment") {
                    foreign_key.type = "integer"
                }
                subTable.fields.push(foreign_key);
                subTable.foreign = json.fields[i].name;
                tables.push(subTable);
                //console.log(subTable);
            } else {
                mainTable.fields.push(json.fields[i]);
            }
        }

        return tables;
    }

    cloneColumn(source) {
        return JSON.parse(JSON.stringify(source));
    }

    create(callback) {
        var _this = this
        let tableJsons = this.getMetaTables();
        //console.log(tableJsons);
        this.createTable(tableJsons, _this, callback);
    }

    createTable(tableJsons, _this, callback) {
        if(tableJsons.length==0){
            if(callback){
                callback();
            }
        }else{
            this.hasTable(0, tableJsons, _this, callback);
        }
        
    }

    hasTable(i, tables, _this, callback) {
        knex.schema.hasTable(tables[i].tableName).then(function (exists) {
            if (!exists) {
                _this.createTableByJson(i, tables, _this, callback);
            } else {
                logger.warn("The created table already exists:" + tables[i].tableName);
                if (i < tables.length - 1) {
                    i++;
                    _this.hasTable(i, tables, _this, callback)
                } else {
                    if (callback) {
                        callback();
                    }
                }
            }
        })
    }

    createTableByJson(j, tableJsons, _this, callback) {
        knex.schema.createTable(tableJsons[j].tableName, function (table) {
            for (var i = 0; i < tableJsons[j].fields.length; i++) {
                var field = tableJsons[j].fields[i];
                _this._createColumn(table, field);
            }
            _this._createPrimary(table, tableJsons[j]);
        }).then(function () {
            if (j < tableJsons.length - 1) {
                j++;
                _this.hasTable(j, tableJsons, _this, callback)
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
        this.deleteTable(0, tableJsons, _this, callback);
    }

    deleteTable(i, tableJsons, _this, callback) {
        if(tableJsons.length == 0){
            if(callback){
                callback();
            }
            return;
        }
        let tableName = tableJsons[i].tableName;
        // if (typeof (tableName) != "string") {
        //     tableName = tableName.tableName;
        // }
        knex.schema.dropTableIfExists(tableName).then(function () {
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

    updateTable2AddAndDeleteAndMasterKey(i, tablejsons, jsons, _this) {
        let cloneJson = tablejsons[i];
        let json = jsons[i];
        let raw = knex.schema.table(cloneJson.tableName, function (table) {
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
        });
        return raw;
    }

    updateModifyFieldsType(i, tablejsons, jsons, _this) {
        let cloneJson = tablejsons[i];
        let json = jsons[i];
        let raw = null;
        if (json.update) {
            //update type , 难以保证事务一致性
            raw = knex.schema.alterTable(cloneJson.tableName, function (table) {
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
        }
        return raw;
    }

    updateTable(i, tablejsons, sourceTableJons, jsons, _this, callback) {
        let raw = this.updateTable2AddAndDeleteAndMasterKey(i, tablejsons, jsons, _this);
        raw.then(function () {
            sourceTableJons[i] = tablejsons[i];
            let mraw = _this.updateModifyFieldsType(i, tablejsons, jsons, _this);
            if (mraw != null) {
                mraw.then(function () {
                    sourceTableJons[i] = tablejsons[i];
                    if (i < tablejsons.length - 1) {
                        i++;
                        _this.updateTable(i, tablejsons, sourceTableJons, jsons, _this, callback);
                    } else {
                        callback()
                    }
                })
                    .catch(function (e) {
                        e.code = "02"
                        logger.error("alter column type error:" + e);
                        callback(e)
                    })
            } else {
                if (i < tablejsons.length - 1) {
                    i++;
                    _this.updateTable(i, tablejsons, sourceTableJons, jsons, _this, callback);
                } else {
                    callback()
                }
            }
        }).catch(function (e) {
            e.code = "01"
            logger.error(e);
            callback(e)
        });
    }

    update(json, callback) {
        let tableJsons = this.getMetaTables();
        if (typeof (json) == "object") {
            var _this = this
            let jsons = this.updateJson(json, tableJsons);
            let addTable = jsons.addTable;
            let delTable = jsons.delTable;
            //console.log(jsons.modify);
            this.createTable(addTable, _this, function (e) {
                if (e == null) {
                    _this.deleteTable(0, delTable, _this, function (e) {
                        let modify = jsons.modify;
                        for(let n= 0;n<modify.length;n++){
                            if(modify[n].isdel == true){
                                modify.splice(n,1);
                                tableJsons.splice(n,1);
                            }
                        }
                        let cloneTableJsons = JSON.parse(JSON.stringify(tableJsons));
                        _this.updateTable(0, cloneTableJsons, tableJsons, jsons.modify, _this, function () {
                            _this.updateMerge(tableJsons, addTable, delTable);
                            callback()
                        });
                    })
                }
            });
        } else {
            logger.error("Need to submit update table information!")
        }
    }
    //没有考虑增表和删表
    updateMerge(tableJsons, addTable, delTable) {
        let newJson = tableJsons[0];
        for (let i = 1; i < tableJsons.length; i++) {
            let subTable = { "name": tableJsons[i].foreign, "type": "table", "relation": tableJsons[i] };
            newJson.fields.push(subTable);
            //console.log(tableJsons[i]);
        }
        this.json = newJson;
        this.primary = newJson.primary;
        if (addTable) {
            for (let i = 0; i < addTable.length; i++) {
                let subTable = { "name": addTable[i].foreign, "type": "table", "relation": addTable[i] };
                newJson.fields.push(subTable);
            }
        }
        // if (delTable) {
        //     for (let i = 0; i < delTable.length; i++) {
        //         for (let j = 0; j < newJson.fields.length; j++)
        //             if (newJson.fields[j].name == delTable[i].foreign) {
        //                 newJson.fields.splice(j, 1);
        //             }
        //     }
        // }
    }

    updateJson(json, tableJsons) {
        let jsonMap = new Map();
        let addTable = [];
        let delTable = []
        let returnValue = { "addTable": addTable, "delTable": delTable, "modify": null }
        for (let i = 0; i < tableJsons.length; i++) {
            let sjson = { "add": [], "update": {}, "delete": [], "r_primary": null,"tableName":tableJsons[i].tableName,"isdel":false };
            if (tableJsons[i].foreign) {
                jsonMap.set(tableJsons[i].foreign, sjson);
            } else {
                jsonMap.set("main", sjson);
            }
        }
        if (json.add) {
            for (let i1 = 0; i1 < json.add.length; i1++) {
                let field = json.add[i1];
                if (field.type == "table") {
                    let primary = this._getColumn(this.json, this.primary);
                    let foreign_key = this.cloneColumn(primary);
                    foreign_key.name = field.name;
                    if (foreign_key.type == "increment") {
                        foreign_key.type = "integer"
                    }
                    field.relation.fields.push(foreign_key);
                    field.relation.foreign = field.name;
                    addTable.push(field.relation);
                } else {
                    let name = field.name;
                    let names = name.split(".");
                    if (names.length > 1) {
                        field.name = names[1];
                        jsonMap.get(names[0]).add.push(field);
                    } else {
                        jsonMap.get("main").add.push(field);
                    }
                }
            }
        }
        if (json.delete) {
            for (let i1 = 0; i1 < json.delete.length; i1++) {
                let fieldName = json.delete[i1];
                let names = fieldName.split(".");
                if (names.length > 1) {
                    jsonMap.get(names[0]).delete.push(names[1]);
                } else {
                    let subtable = jsonMap.get(fieldName);
                    //console.log(subtable);
                    if (subtable == null) {
                        jsonMap.get("main").delete.push(fieldName);
                    }
                    else {
                        delTable.push({"tableName":subtable.tableName,"foreign":fieldName});
                        subtable.isdel = true;
                    }
                }
            }
        }

        if (json.update) {
            for (var key in json.update) {
                let names = key.split(".");
                if (names.length > 1) {
                    jsonMap.get(names[0]).update[names[1]] = json.update[key];
                } else {
                    jsonMap.get("main").update[key] = json.update[key];
                }
            }
        }
        if (json.r_primary) {
            if (Array.isArray(json.r_primary)) {
                for (let i1 = 0; i1 < json.r_primary.length; i1++) {
                    let names = json.r_primary[i1].split(".");
                    if (names.length > 1) {
                        jsonMap.get(names[0]).r_primary = names[1];
                    } else {
                        jsonMap.get("main").r_primary = json.r_primary[i1];
                    }
                }
            } else {
                let names = json.r_primary.split(".");
                if (names.length > 1) {
                    jsonMap.get(names[0]).r_primary = names[1];
                } else {
                    jsonMap.get("main").r_primary = json.r_primary;
                }
            }
        }
        returnValue.modify = [...jsonMap.values()];
        return returnValue;
    }

}
TableMeta.FIELDTPYE = ["increment", "string", "integer", "decimal", "float", "date", "dateTime", "time", "bigInteger", "timestamp", "binary", "guid"]
TableMeta.COUSTRAINTT = ["primary", "unique", "foreign", "notNullable"]
TableMeta.DEFAULTVALUE = []

module.exports = TableMeta