var knex = require("./knex_config")



FIELDTPYE = ["increment","string","integer","decimal","float","date","dateTime","time","bigInteger","timestamp","binary"]
COUSTRAINTT = ["primary","unique","foreign","notNullable"]
DEFAULTVALUE = []
function createTable(tableName, fields) {
    knex.schema.hasTable(tableName).then(function (exists) {
        if (!exists) {
            console.log("create table:" + tableName)
            knex.schema.createTable(tableName, function (table) {
                for (i = 0 ; i < fields.length;i++) {
                    field = fields[i]
                    console.log("field:" + field.name)
                    if (field.type == "increment") {
                        table.increments(field.name)
                    }
                    else if (field.type == "int") {
                        table.integer(field.name);
                    }
                    else
                        table.string(field.name)
                }
            }).catch(function (e) {
                console.error('创建表：' + tableName + ' error:' + e);
            });
        } else {
            console.log("table:" + tableName + " is Exists")
        }
    })
}






var tableName = "sys_users";
var fields = [{name : "id", type : "increment" },{ name : "name", type : "string" },{ name : "age", type : "int" }];
createTable(tableName, fields)