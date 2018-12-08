var TableMeta = require("./TableMeta")
knex = require("./KnexManager").getKnex();
function main() {
    var tableName = "__test__users__create_";
    var fields = [{ name: "id", type: "int" }, 
                  { name: "name", type: "string" ,length : 12}, 
                  { name: "age", type: "int" ,default: 1},
                  { name:"birthday",type:"dateTime"},
                  { name:"salary",type:"float",length:[10,2]},
                  { name:"crete_data",type:"timestamp"},
                  { name:"assets",type:"decimal",length:[8],"notNullable":true},
                  { name:"type",type:"string",length:2,default: "0","notNullable":false}
                ];
    var json ={
        "tableName": tableName,
        "primary": "id",
        "fields": fields
    }
    
    var table = new TableMeta(json);
    table.create(function(){
        knex.destroy()
    })
    
}

console.time("sort");
main()
console.timeEnd("sort");