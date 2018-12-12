var log4js=require('log4js');
var log = {
    appenders: {
      "out": { type: 'stdout' },
      "info": { type: 'file', filename: './logs/info.log' },
      "just-errors": { type: 'file', filename: './logs/error.log' },
      'error': { type: 'logLevelFilter', appender: 'just-errors', level: 'error' }
    },
    categories: {
      default: { appenders: [ 'out', 'info','error' ], level: 'debug' }
    }
  }
log4js.configure(log);

module.exports = log4js.getLogger();