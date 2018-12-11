var BasicService = require("test");
require("test");
console.log(require.resolve.paths("./test.js"))
require.cache["D:\\jswork\\db-orm\\data\\node_modules\\test.js"]=null
require("test");
var basicService = Reflect.construct(BasicService, ["test_table","id"]);
basicService.get(1,function(data){
    console.log(data);
});

Reflect.apply(basicService["get"],basicService,[1,function(data){
    console.log(data);
}])