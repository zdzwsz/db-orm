var path = require('path');
let modules = require("./config").modules
modules = path.resolve(modules);
module.exports = modules;