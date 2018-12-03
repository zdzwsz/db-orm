var knex = require('knex')(
    {
        client: 'mysql', //指明数据库类型，还可以是mysql，sqlite3等等 
        connection: { //指明连接参数 
            host: '127.0.0.1',
            user: 'root',
            password: '123456',
            database: 'test'
        }
});

exports = module.exports = knex