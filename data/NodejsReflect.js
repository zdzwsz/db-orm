var BasicService = require("./../db/BasicService");
require("D:/work/nodejs/db-orm/data/test");
console.log(require.main);
var basicService = Reflect.construct(BasicService, ["test_table","id"]);
basicService.get(1,function(data){
    console.log(data);
});

Reflect.apply(basicService["get"],basicService,[1,function(data){
    console.log(data);
}])