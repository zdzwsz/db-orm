var path = require('path');
let modules = require("./config").modules
if(modules){
    modules = path.resolve(modules);
}else{
    modules ="";
}
module.exports = modules;