var TableMeta = require("./TableMeta")
knex = require("./KnexManager").getKnex();
function test() {
    var tableName = "test_users1";
    var fields = [{ name: "id", type: "int" }, 
                  { name: "name", type: "string" ,length : 12}, 
                  { name: "age", type: "int" ,default: 1},
                  { name:"birthday",type:"dateTime"},
                  { name:"salary",type:"float",length:[10,2]},
                  { name:"crete_data",type:"timestamp"},
                  { name:"assets",type:"decimal",length:[8],"notNullable":true},
                  { name:"type",type:"string",length:2,default: "0","notNullable":false}
                ];
    var table = new TableMeta(tableName);
    table.addFields(fields);
    table.setPrimary("id")
    table.create()
    //var table2 = TableMeta.loadMeta("sys_users.json")
    //table2.create()
    //knex.destroy();
}

test()