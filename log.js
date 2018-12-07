var log4js=require('log4js');
var config = require('./config');

log4js.configure(config.log);

module.exports = log4js.getLogger();