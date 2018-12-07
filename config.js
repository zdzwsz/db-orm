module.exports = {
  'network': {
    'port': 8080
  },
  users: {
    'name': 'admin',
    'password': '123456'
  },
  'jwtsecret': 'myjwttest',
  'dbstore': 'd:/dbstore',
  database: {
    dbtype:'mysql',
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    dbname: 'test'
  },
  'log':{
    appenders: {
      "out": { type: 'stdout' },//设置是否在控制台打印日志
      "info": { type: 'file', filename: './logs/info.log' },
      "just-errors": { type: 'file', filename: './logs/error.log' },
      'error': { type: 'logLevelFilter', appender: 'just-errors', level: 'error' }
    },
    categories: {
      default: { appenders: [ 'out', 'info','error' ], level: 'info' }
    }
  }
};