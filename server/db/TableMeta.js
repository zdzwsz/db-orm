knex = require("./knex_config")
var fs = require('fs')

class TableMeta {

    constructor(tableName) {
        this.tableName = tableName;
        this.fields = []
    }

    static loadMeta(filename){
        var meta=JSON.parse(fs.readFileSync(filename,'utf-8'));
        var tableMeta = new TableMeta(meta.tableName);
        tableMeta.addFields(meta.fields);
        console.log("load tableMeta fields......"+meta.fields);
        tableMeta.setPrimary(meta.primary);
        console.log("load tableMeta primary......"+meta.primary);
        return tableMeta;
    }

    setPrimary(fields){ 
       if(fields==null || fields =="undefined") return
       this.primary = Array.isArray(fields) ? fields:[fields]
    }

    addField(field) {
        this.fields.push(field);
    }

    addFields(fields) {
        for (var i = 0; i < fields.length; i++) {
            this.fields.push(fields[i])
        }

    }

    _createColumn(table,field){
        var column = null;
        if (field.type == "increment") {
            column = table.increments(field.name);
        }
        else if (field.type == "int" || field.type == "integer") {
            column =table.integer(field.name);
        }
        else if(field.type == "dateTime"){
            column =table.dateTime(field.name);
        }
        else if(field.type == "decimal"){
            var flength = field.length||[8,2];
            var precision = flength[0]||8;
            var scale = flength[1]||0;
            column = table.decimal(field.name , precision, scale);
        }
        else if(field.type == "float"){
            var flength = field.length||[8,2];
            var precision = flength[0]||8;
            var scale = flength[1]||0;
            column = table.float(field.name, precision, scale);
        }
        else if(field.type == "date"){
            column = table.date(field.name);
        }
        else if(field.type == "timestamp"){
            column = table.timestamp(field.name);
        }
        else if(field.type == "string"){
            var flength = field.length||50;
            column = table.string(field.name,flength);
        }else{
            column = table.string(field.name);
        }
        if(typeof(field.default)!="undefined"){
            column.defaultTo(field.default)
        }
        if(field.notNullable){
            column.notNullable()
        }else{
            column.nullable()
        }
    }

    _createPrimary(table){
        if(this.primary){
            //table.dropPrimary(this.tableName+"_pkey")
            table.primary(this.primary)
        }
    }

    create() {
        var _this = this
        knex.schema.hasTable(_this.tableName).then(function (exists) {
            if (!exists) {
                console.log("create table:" + _this.tableName)
                knex.schema.createTable(_this.tableName, function (table) {
                    for (var i = 0; i < _this.fields.length; i++) {
                        var field = _this.fields[i]
                        console.log("field:" + field.name)
                        _this._createColumn(table,field)
                    }
                    _this._createPrimary(table)
                }).catch(function (e) {
                    console.error('创建表：' + _this.tableName + ' error:' + e);
                });
            } else {
                console.log("table:" + _this.tableName + " is Exists")
            }
        })
    }

}
TableMeta.FIELDTPYE = ["increment","string","integer","decimal","float","date","dateTime","time","bigInteger","timestamp","binary"]
TableMeta.COUSTRAINTT = ["primary","unique","foreign","notNullable"]
TableMeta.DEFAULTVALUE = []

module.exports = TableMeta